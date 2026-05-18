import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';

// argo cd ships these two CRDs in argoproj.io/v1alpha1
// we only need Application for MVP, AppProject is future work

export const Application = makeCustomResourceClass({
  apiInfo: [{ group: 'argoproj.io', version: 'v1alpha1' }],
  isNamespaced: true,
  singularName: 'application',
  pluralName: 'applications',
});

export const AppProject = makeCustomResourceClass({
  apiInfo: [{ group: 'argoproj.io', version: 'v1alpha1' }],
  isNamespaced: true,
  singularName: 'appproject',
  pluralName: 'appprojects',
});

// argo cd tracks managed resources using this label by default
// can also use annotation tracking - we handle both
export const INSTANCE_LABEL = 'app.kubernetes.io/instance';
export const TRACKING_ANNOTATION = 'argocd.argoproj.io/tracking-id';