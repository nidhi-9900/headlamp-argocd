// types for argo cd application CRD fields we actually use
// ref: https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/

export type SyncStatusCode = 'Synced' | 'OutOfSync' | 'Unknown';

export type HealthStatusCode =
  | 'Healthy'
  | 'Progressing'
  | 'Degraded'
  | 'Suspended'
  | 'Missing'
  | 'Unknown';

export interface AppSource {
  repoURL: string;
  path?: string;
  chart?: string;
  targetRevision?: string;
}

export interface AppDestination {
  server?: string;
  name?: string;
  namespace?: string;
}

// subset of status we care about for the projects view
export interface AppStatus {
  sync?: {
    status: SyncStatusCode;
    revision?: string;
    revisions?: string[];
  };
  health?: {
    status: HealthStatusCode;
    message?: string;
  };
  resources?: Array<{
    group?: string;
    version: string;
    kind: string;
    namespace?: string;
    name: string;
    health?: { status: HealthStatusCode };
  }>;
  conditions?: Array<{
    type: string;
    message: string;
    lastTransitionTime?: string;
  }>;
  operationState?: {
    finishedAt?: string;
  };
}

export interface AppSpec {
  source?: AppSource;
  sources?: AppSource[];
  destination: AppDestination;
  project: string;
  syncPolicy?: {
    automated?: {
      prune?: boolean;
      selfHeal?: boolean;
    };
  };
}

export interface ArgoCDApplication {
  metadata: {
    name: string;
    namespace: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec: AppSpec;
  status?: AppStatus;
}