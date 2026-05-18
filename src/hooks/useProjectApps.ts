import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { useState, useEffect } from 'react';
import { Application, INSTANCE_LABEL, TRACKING_ANNOTATION } from '../api/application';
import { SyncStatusCode, HealthStatusCode, ArgoCDApplication } from '../api/types';

export interface AppView {
  name: string;
  namespace: string;
  cluster: string;
  sync: SyncStatusCode;
  health: HealthStatusCode;
  revision: string;
  repoURL: string;
  targetRevision: string;
  destination: string;
  autoSync: boolean;
  sources: Array<{ repoURL: string; targetRevision?: string; path?: string; chart?: string }>;
  resources: ArgoCDApplication['status']['resources'];
  conditions: ArgoCDApplication['status']['conditions'];
  finishedAt?: string;
  matchLayer: string;
}

// check if argo cd is installed by looking for the CRD
export function useArgoCDInstalled(cluster?: string): boolean | null {
  const [crds] = K8s.ResourceClasses.CustomResourceDefinition.useList({ cluster });
  if (!crds) return null;
  return crds.some((crd: any) => crd.metadata.name === 'applications.argoproj.io');
}

export function useProjectApps(project: any): AppView[] {
  const clusters: string[] = project?.clusters ?? [];
  const namespaces: string[] = (project?.namespaces ?? []).map((n: any) =>
    typeof n === 'string' ? n : n.name
  );

  const [allApps, setAllApps] = useState<AppView[]>([]);

  // fetch from up to 3 clusters - headlamp projects can span multiple
  const [apps0] = Application.useList({ cluster: clusters[0] });
  const [apps1] = Application.useList({ cluster: clusters[1] });
  const [apps2] = Application.useList({ cluster: clusters[2] });

  useEffect(() => {
    const rawApps = [
      ...(apps0 ?? []),
      ...(apps1 ?? []),
      ...(apps2 ?? []),
    ] as any[];

    if (rawApps.length === 0) return;

    const matched: AppView[] = [];

    for (const app of rawApps) {
      const data = app.jsonData as ArgoCDApplication;
      const cluster = clusters.find(c => app.cluster === c) ?? clusters[0];
      let matchLayer = '';

      // layer 1: destination namespace matches project namespaces
      const destNs = data.spec?.destination?.namespace;
      if (destNs && namespaces.includes(destNs)) {
        matchLayer = 'destination namespace';
      }

      // layer 2: app.kubernetes.io/instance label on resources (default tracking)
      if (!matchLayer) {
        const label = data.metadata?.labels?.[INSTANCE_LABEL];
        if (label && namespaces.length > 0) {
          matchLayer = 'resource tracking label';
        }
      }

      // layer 3: argocd.argoproj.io/tracking-id annotation (annotation tracking mode)
      if (!matchLayer) {
        const annotation = data.metadata?.annotations?.[TRACKING_ANNOTATION];
        if (annotation) {
          const ns = annotation.split('/')[1];
          if (ns && namespaces.includes(ns)) {
            matchLayer = 'tracking annotation';
          }
        }
      }

      if (!matchLayer) continue;

      const sources = data.spec?.sources ?? (data.spec?.source ? [data.spec.source] : []);
      const primary = sources[0] ?? {};

      matched.push({
        name: data.metadata.name,
        namespace: data.metadata.namespace,
        cluster,
        sync: data.status?.sync?.status ?? 'Unknown',
        health: data.status?.health?.status ?? 'Unknown',
        revision: data.status?.sync?.revision?.substring(0, 7) ?? '',
        repoURL: primary.repoURL ?? '',
        targetRevision: primary.targetRevision ?? 'HEAD',
        destination: data.spec?.destination?.namespace ?? data.spec?.destination?.name ?? '',
        autoSync: !!data.spec?.syncPolicy?.automated,
        sources,
        resources: data.status?.resources ?? [],
        conditions: data.status?.conditions ?? [],
        finishedAt: data.status?.operationState?.finishedAt,
        matchLayer,
      });
    }

    // show degraded first, then out of sync, then healthy
    matched.sort((a, b) => {
      const order: Record<string, number> = { Degraded: 0, OutOfSync: 1, Synced: 2, Unknown: 3 };
      return (order[a.health] ?? 3) - (order[b.health] ?? 3);
    });

    setAllApps(matched);
  }, [apps0, apps1, apps2]);

  return allApps;
}