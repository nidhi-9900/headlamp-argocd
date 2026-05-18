import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { SyncBadge, HealthBadge } from './StatusBadges';
import { EmptyState } from './EmptyState';
import { useProjectApps, useArgoCDInstalled } from '../hooks/useProjectApps';

interface Props {
  project: any;
}

export function GitOpsOverviewSection({ project }: Props) {
  const installed = useArgoCDInstalled(project?.clusters?.[0]);
  const apps = useProjectApps(project);

  if (installed === false) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>GitOps</Typography>
          <EmptyState reason="no-crd" />
        </CardContent>
      </Card>
    );
  }

  const degraded = apps.filter(a => a.health === 'Degraded').length;
  const outOfSync = apps.filter(a => a.sync === 'OutOfSync').length;
  const healthy = apps.filter(a => a.health === 'Healthy').length;

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <Typography variant="h6">GitOps</Typography>
          {degraded > 0 && (
            <Chip
              label={`${degraded} Degraded`}
              color="error"
              size="small"
            />
          )}
          {outOfSync > 0 && (
            <Chip
              label={`${outOfSync} OutOfSync`}
              color="warning"
              size="small"
            />
          )}
          {degraded === 0 && outOfSync === 0 && healthy > 0 && (
            <Chip
              label={`${healthy} Healthy`}
              color="success"
              size="small"
            />
          )}
        </Box>

        {apps.length === 0 ? (
          <EmptyState reason="no-apps" />
        ) : (
          <Box>
            {apps.slice(0, 5).map(app => (
              <Box
                key={`${app.cluster}/${app.namespace}/${app.name}`}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                py={0.5}
                mb={0.5}
                pl={1}
                sx={{
                  borderLeft: app.health === 'Degraded'
                    ? '3px solid #f44336'
                    : app.sync === 'OutOfSync'
                    ? '3px solid #ff9800'
                    : '3px solid #4caf50',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {app.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {app.repoURL.replace('https://', '').substring(0, 45)}
                    {app.finishedAt
                      ? ` · synced ${new Date(app.finishedAt).toLocaleDateString()}`
                      : ''}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <SyncBadge status={app.sync} />
                  <HealthBadge status={app.health} />
                </Box>
              </Box>
            ))}
            {apps.length > 5 && (
              <Typography variant="caption" color="textSecondary">
                +{apps.length - 5} more
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}