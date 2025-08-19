import React from 'react';
import { render, screen } from '@testing-library/react';

import { DeviceStatus } from '@/graphql/generated';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders with Online status', () => {
    render(<StatusBadge status={DeviceStatus.Online} />);

    const badge = screen.getByText(DeviceStatus.Online);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders with Offline status', () => {
    render(<StatusBadge status={DeviceStatus.Offline} />);

    const badge = screen.getByText(DeviceStatus.Offline);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('renders with Maintenance status', () => {
    render(<StatusBadge status={DeviceStatus.Maintenance} />);

    const badge = screen.getByText(DeviceStatus.Maintenance);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('applies common styles to all status badges', () => {
    render(<StatusBadge status={DeviceStatus.Online} />);

    const badge = screen.getByText(DeviceStatus.Online);
    expect(badge).toHaveClass(
      'inline-flex',
      'px-2',
      'py-1',
      'text-xs',
      'font-semibold',
      'rounded-full'
    );
  });

  it('renders with dark mode styles for Online status', () => {
    render(<StatusBadge status={DeviceStatus.Online} />);

    const badge = screen.getByText(DeviceStatus.Online);
    expect(badge).toHaveClass('dark:bg-green-900/20', 'dark:text-green-400');
  });

  it('renders with dark mode styles for Offline status', () => {
    render(<StatusBadge status={DeviceStatus.Offline} />);

    const badge = screen.getByText(DeviceStatus.Offline);
    expect(badge).toHaveClass('dark:bg-red-900/20', 'dark:text-red-400');
  });

  it('renders with dark mode styles for Maintenance status', () => {
    render(<StatusBadge status={DeviceStatus.Maintenance} />);

    const badge = screen.getByText(DeviceStatus.Maintenance);
    expect(badge).toHaveClass('dark:bg-yellow-900/20', 'dark:text-yellow-400');
  });

  it('handles unknown status with default styles', () => {
    // Testing with an undefined/unknown status value
    const unknownStatus = 'Unknown' as DeviceStatus;
    render(<StatusBadge status={unknownStatus} />);

    const badge = screen.getByText(unknownStatus);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    expect(badge).toHaveClass('dark:bg-gray-900/20', 'dark:text-gray-400');
  });
});
