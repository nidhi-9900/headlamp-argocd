import React from 'react';
import { StatusLabel } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { SyncStatusCode, HealthStatusCode } from '../api/types';

export function SyncBadge({ status }: { status: SyncStatusCode }) {
  if (status === 'Synced') {
    return <StatusLabel status="success">Synced</StatusLabel>;
  }
  if (status === 'OutOfSync') {
    return <StatusLabel status="warning">OutOfSync</StatusLabel>;
  }
  return <StatusLabel status="">{status}</StatusLabel>;
}

export function HealthBadge({ status }: { status: HealthStatusCode }) {
  if (status === 'Healthy') {
    return <StatusLabel status="success">Healthy</StatusLabel>;
  }
  if (status === 'Degraded') {
    return <StatusLabel status="error">Degraded</StatusLabel>;
  }
  if (status === 'Progressing') {
    return <StatusLabel status="warning">Progressing</StatusLabel>;
  }
  if (status === 'Suspended') {
    return <StatusLabel status="warning">Suspended</StatusLabel>;
  }
  return <StatusLabel status="">{status || 'Unknown'}</StatusLabel>;
}