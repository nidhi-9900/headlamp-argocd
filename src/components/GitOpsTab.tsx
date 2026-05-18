import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Collapse,
  IconButton,
  Link,
} from '@mui/material';
import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { SyncBadge, HealthBadge } from './StatusBadges';
import { EmptyState } from './EmptyState';
import { useProjectApps, AppView, useArgoCDInstalled } from '../hooks/useProjectApps';

function RevisionLink({ repoURL, revision }: { repoURL: string; revision: string }) {
  if (!revision) return <Typography variant="caption">—</Typography>;

  let href = '';
  try {
    const url = new URL(repoURL);
    if (url.hostname === 'github.com' || url.hostname === 'gitlab.com') {
      href = `${repoURL.replace(/\.git$/, '')}/commit/${revision}`;
    }
  } catch {}

  if (href) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        <code>{revision}</code>
      </Link>
    );
  }
  return <code>{revision}</code>;
}

function DetailDrawer({ app }: { app: AppView }) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box display="flex" gap={4} flexWrap="wrap">

        <Box flex={1} minWidth={200}>
          <Typography variant="subtitle2" gutterBottom>SOURCES</Typography>
          {app.sources.map((src, i) => (
            <Box key={i} mb={1}>
              <Link
                href={src.repoURL}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                {src.repoURL.replace('https://', '').substring(0, 50)}
              </Link>
              {src.path && (
                <Typography variant="caption" color="textSecondary" display="block">
                  path: {src.path}
                </Typography>
              )}
              <Typography variant="caption" color="textSecondary" display="block">
                {src.targetRevision ?? 'HEAD'}
                {app.revision ? ` (${app.revision})` : ''}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box flex={2} minWidth={200}>
          <Typography variant="subtitle2" gutterBottom>
            MANAGED RESOURCES {app.resources?.length ? `(${app.resources.length})` : ''}
          </Typography>
          <Box sx={{ maxHeight: 180, overflowY: 'auto' }}>
            {(app.resources ?? []).slice(0, 12).map((r, i) => (
              <Typography key={i} variant="caption" display="block" color="textSecondary">
                {r.kind}/{r.name}
                {r.namespace ? ` · ${r.namespace}` : ''}
              </Typography>
            ))}
            {(app.resources ?? []).length > 12 && (
              <Typography variant="caption" color="textSecondary">
                +{app.resources.length - 12} more
              </Typography>
            )}
          </Box>
        </Box>

        <Box flex={1} minWidth={150}>
          <Typography variant="subtitle2" gutterBottom>CONDITIONS</Typography>
          {!app.conditions?.length ? (
            <Typography variant="caption" color="textSecondary">
              No conditions reported
            </Typography>
          ) : (
            app.conditions.map((c, i) => (
              <Typography key={i} variant="caption" display="block" color="error">
                {c.type}: {c.message}
              </Typography>
            ))
          )}
        </Box>

      </Box>

      <Box display="flex" gap={1} mt={2} flexWrap="wrap">
        <Chip
          size="small"
          label={app.sources[0]?.chart ? 'Helm' : 'Directory'}
        />
        <Chip
          size="small"
          label={app.autoSync ? 'auto-sync on' : 'auto-sync off'}
          color={app.autoSync ? 'success' : 'default'}
        />
        <Chip
          size="small"
          label={`via ${app.matchLayer}`}
          variant="outlined"
        />
        <Chip
          size="small"
          label={`dest: ${app.destination || 'in-cluster'}`}
          variant="outlined"
        />
      </Box>
    </Box>
  );
}

interface Props {
  project: any;
}

export function GitOpsTab({ project }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const installed = useArgoCDInstalled(project?.clusters?.[0]);
  const apps = useProjectApps(project);

  if (installed === false) return <EmptyState reason="no-crd" />;
  if (apps.length === 0) return <EmptyState reason="no-apps" />;

  const toggle = (key: string) =>
    setExpanded(prev => (prev === key ? null : key));

  return (
    <SectionBox title={`Argo CD Applications (${apps.length})`}>
      {apps.map(app => {
        const key = `${app.cluster}/${app.name}`;
        const isOpen = expanded === key;

        return (
          <Box key={key}>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              py={1}
              px={1}
              sx={{
                borderLeft: app.health === 'Degraded'
                  ? '3px solid #f44336'
                  : app.sync === 'OutOfSync'
                  ? '3px solid #ff9800'
                  : '3px solid #4caf50',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                borderBottom: '1px solid',
                borderBottomColor: 'divider',
              }}
              onClick={() => toggle(key)}
            >
              <IconButton size="small">
                {isOpen ? '▼' : '▶'}
              </IconButton>

              <Box flex={2}>
                <Typography variant="body2" fontWeight="bold">
                  {app.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {app.matchLayer}
                </Typography>
              </Box>

              <Box flex={1} display="flex" gap={1}>
                <SyncBadge status={app.sync} />
                <HealthBadge status={app.health} />
              </Box>

              <Box flex={1}>
                <RevisionLink repoURL={app.repoURL} revision={app.revision} />
              </Box>

              <Box flex={2}>
                <Typography variant="caption" noWrap>
                  {app.repoURL.replace('https://', '').substring(0, 40)}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography variant="caption" color="textSecondary">
                  {app.destination || 'in-cluster'}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography variant="caption" color="textSecondary">
                  {app.finishedAt
                    ? new Date(app.finishedAt).toLocaleDateString()
                    : '—'}
                </Typography>
              </Box>
            </Box>

            <Collapse in={isOpen}>
              <DetailDrawer app={app} />
            </Collapse>
          </Box>
        );
      })}
    </SectionBox>
  );
}