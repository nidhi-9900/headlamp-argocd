import React from 'react';
import {
  registerProjectOverviewSection,
  registerProjectDetailsTab,
} from '@kinvolk/headlamp-plugin/lib';
import { GitOpsOverviewSection } from './components/GitOpsOverviewSection';
import { GitOpsTab } from './components/GitOpsTab';

// adds gitops card to the project overview page
// sits alongside Status / Resources / Resource Quotas
registerProjectOverviewSection({
  component: ({ project }: { project: any }) => (
    <GitOpsOverviewSection project={project} />
  ),
});

// adds gitops tab to the project details page
registerProjectDetailsTab({
  id: 'argocd.tabs.gitops',
  label: 'GitOps',
  component: ({ project }: { project: any }) => (
    <GitOpsTab project={project} />
  ),
});