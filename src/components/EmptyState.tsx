import React from 'react';
import { Typography, Box } from '@mui/material';

interface Props {
  reason: 'no-crd' | 'no-apps' | 'rbac-denied';
}

export function EmptyState({ reason }: Props) {
  if (reason === 'no-crd') {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Argo CD is not installed in this cluster. Install it to see GitOps context here.
        </Typography>
      </Box>
    );
  }

  if (reason === 'rbac-denied') {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Argo CD detected but you lack permission to list applications.
          Ask your cluster admin for get, list, watch on applications.argoproj.io.
        </Typography>
      </Box>
    );
  }

  // no-apps
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="textSecondary">
        No Argo CD applications match this project's namespaces. Either set
        spec.destination.namespace to one of this project's namespaces, or label
        your namespace with headlamp.dev/project-id.
      </Typography>
    </Box>
  );
}