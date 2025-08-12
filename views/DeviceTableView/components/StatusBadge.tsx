import React from 'react';

import { DeviceStatus } from '@/graphql/generated';
import { getStatusStyles, getStatusTestId } from '../utils/status';

interface StatusBadgeProps {
  status: DeviceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      data-testid={getStatusTestId(status)}
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(status)}`}
    >
      {status}
    </span>
  );
}
