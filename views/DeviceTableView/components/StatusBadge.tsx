import React from 'react';

import { DeviceStatus } from '@/graphql/generated';

interface StatusBadgeProps {
  status: DeviceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case DeviceStatus.Online:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case DeviceStatus.Offline:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case DeviceStatus.Maintenance:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
}
