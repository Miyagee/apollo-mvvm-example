import React from 'react';
import { render, screen } from '@testing-library/react';

import { DeviceStatus } from '@/graphql/generated';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  describe('Given a device status needs to be displayed', () => {
    describe('When showing an Online device status', () => {
      it('Then displays Online status with green styling', () => {
        render(<StatusBadge status={DeviceStatus.Online} />);

        const badge = screen.getByText(DeviceStatus.Online);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-green-100', 'text-green-800');
        expect(badge).toHaveClass('dark:bg-green-900/20', 'dark:text-green-400');
      });
    });

    describe('When showing an Offline device status', () => {
      it('Then displays Offline status with red styling', () => {
        render(<StatusBadge status={DeviceStatus.Offline} />);

        const badge = screen.getByText(DeviceStatus.Offline);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-red-100', 'text-red-800');
        expect(badge).toHaveClass('dark:bg-red-900/20', 'dark:text-red-400');
      });
    });

    describe('When showing a Maintenance device status', () => {
      it('Then displays Maintenance status with yellow styling', () => {
        render(<StatusBadge status={DeviceStatus.Maintenance} />);

        const badge = screen.getByText(DeviceStatus.Maintenance);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
        expect(badge).toHaveClass('dark:bg-yellow-900/20', 'dark:text-yellow-400');
      });
    });

    describe('When showing an unknown device status', () => {
      it('Then displays unknown status with default gray styling', () => {
        const unknownStatus = 'Unknown' as DeviceStatus;
        render(<StatusBadge status={unknownStatus} />);

        const badge = screen.getByText(unknownStatus);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
        expect(badge).toHaveClass('dark:bg-gray-900/20', 'dark:text-gray-400');
      });
    });

    describe('When any status badge is rendered', () => {
      it('Then applies consistent badge styling to all status types', () => {
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
    });
  });
});
