import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeviceTable } from './DeviceTable';
import { DeviceModel } from '@/models/Device';
import { Device, DeviceStatus, DeviceType } from '@/graphql/generated';

// Mock the StatusBadge component
jest.mock('./StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => <span data-testid='status-badge'>{status}</span>,
}));

describe('DeviceTable', () => {
  // Helper function to create DeviceModel instances
  const createDeviceModel = (data: Device): DeviceModel => {
    return new DeviceModel(data);
  };

  const mockDeviceData: Device[] = [
    {
      id: '1',
      name: 'Device 1',
      serialNumber: 'SN001',
      type: DeviceType.Sensor,
      status: DeviceStatus.Online,
      firmwareVersion: '1.0.0',
      location: 'Building A',
      lastSeenAt: '2024-01-01T10:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      name: 'Device 2',
      serialNumber: 'SN002',
      type: DeviceType.Gateway,
      status: DeviceStatus.Offline,
      firmwareVersion: '2.0.0',
      location: 'Building B',
      lastSeenAt: '2024-01-01T09:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T09:00:00Z',
    },
    {
      id: '3',
      name: 'Device 3',
      serialNumber: 'SN003',
      type: DeviceType.Controller,
      status: DeviceStatus.Maintenance,
      firmwareVersion: '1.5.0',
      location: null,
      lastSeenAt: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
  ];

  const mockDevices = mockDeviceData.map(createDeviceModel);

  const defaultProps = {
    devices: mockDevices,
    selectedDevice: null,
    onSelectDevice: jest.fn(),
    onEditDevice: jest.fn(),
    onDeleteDevice: jest.fn(),
    emptyMessage: 'No devices found',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Table Structure', () => {
    it('should render table with correct headers', () => {
      render(<DeviceTable {...defaultProps} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Serial Number')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Firmware')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Last Seen')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render all devices in the table', () => {
      render(<DeviceTable {...defaultProps} />);

      mockDevices.forEach((device) => {
        expect(screen.getByText(device.name)).toBeInTheDocument();
        expect(screen.getByText(device.serialNumber)).toBeInTheDocument();
        expect(screen.getByText(device.type)).toBeInTheDocument();
        expect(screen.getByText(device.firmwareVersion)).toBeInTheDocument();
      });
    });

    it('should display location or dash when location is null', () => {
      render(<DeviceTable {...defaultProps} />);

      expect(screen.getByText('Building A')).toBeInTheDocument();
      expect(screen.getByText('Building B')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should display last seen time or "Never" when lastSeenAt is null', () => {
      render(<DeviceTable {...defaultProps} />);

      // The actual formatted time will depend on when the test runs
      // So we check for the presence of "Never" for null lastSeenAt
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no devices', () => {
      render(<DeviceTable {...defaultProps} devices={[]} />);

      expect(screen.getByText('No devices found')).toBeInTheDocument();
    });

    it('should display custom empty message', () => {
      const customMessage = 'Custom empty message';
      render(<DeviceTable {...defaultProps} devices={[]} emptyMessage={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });

  describe('Device Selection', () => {
    it('should call onSelectDevice when clicking on a row', () => {
      render(<DeviceTable {...defaultProps} />);

      const firstRow = screen.getByText('Device 1').closest('tr');
      fireEvent.click(firstRow!);

      expect(defaultProps.onSelectDevice).toHaveBeenCalledWith('1');
    });

    it('should highlight selected device row', () => {
      render(<DeviceTable {...defaultProps} selectedDevice={mockDevices[0]} />);

      const selectedRow = screen.getByText('Device 1').closest('tr');
      expect(selectedRow).toHaveClass('bg-blue-50', 'dark:bg-blue-900/20');

      // Check that other rows are not highlighted
      const otherRow = screen.getByText('Device 2').closest('tr');
      expect(otherRow).not.toHaveClass('bg-blue-50', 'dark:bg-blue-900/20');
    });

    it('should update highlighted row when selection changes', () => {
      const { rerender } = render(
        <DeviceTable {...defaultProps} selectedDevice={mockDevices[0]} />
      );

      rerender(<DeviceTable {...defaultProps} selectedDevice={mockDevices[1]} />);

      const newSelectedRow = screen.getByText('Device 2').closest('tr');
      expect(newSelectedRow).toHaveClass('bg-blue-50', 'dark:bg-blue-900/20');

      const previousSelectedRow = screen.getByText('Device 1').closest('tr');
      expect(previousSelectedRow).not.toHaveClass('bg-blue-50', 'dark:bg-blue-900/20');
    });
  });

  describe('Actions', () => {
    it('should render Edit and Delete buttons for each device', () => {
      render(<DeviceTable {...defaultProps} />);

      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');

      expect(editButtons).toHaveLength(mockDevices.length);
      expect(deleteButtons).toHaveLength(mockDevices.length);
    });

    it('should call onEditDevice with correct device when Edit is clicked', () => {
      render(<DeviceTable {...defaultProps} />);

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      expect(defaultProps.onEditDevice).toHaveBeenCalledWith(mockDevices[0]);
    });

    it('should call onDeleteDevice with correct device id when Delete is clicked', () => {
      render(<DeviceTable {...defaultProps} />);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[1]);

      expect(defaultProps.onDeleteDevice).toHaveBeenCalledWith('2');
    });

    it('should stop propagation when clicking Edit button', () => {
      render(<DeviceTable {...defaultProps} />);

      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      expect(defaultProps.onEditDevice).toHaveBeenCalledWith(mockDevices[0]);
      expect(defaultProps.onSelectDevice).not.toHaveBeenCalled();
    });

    it('should stop propagation when clicking Delete button', () => {
      render(<DeviceTable {...defaultProps} />);

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      expect(defaultProps.onDeleteDevice).toHaveBeenCalledWith('1');
      expect(defaultProps.onSelectDevice).not.toHaveBeenCalled();
    });
  });

  describe('StatusBadge Integration', () => {
    it('should render StatusBadge component for each device', () => {
      render(<DeviceTable {...defaultProps} />);

      const statusBadges = screen.getAllByTestId('status-badge');
      expect(statusBadges).toHaveLength(mockDevices.length);

      expect(statusBadges[0]).toHaveTextContent(DeviceStatus.Online);
      expect(statusBadges[1]).toHaveTextContent(DeviceStatus.Offline);
      expect(statusBadges[2]).toHaveTextContent(DeviceStatus.Maintenance);
    });
  });

  describe('Styling and Classes', () => {
    it('should apply hover styles to table rows', () => {
      render(<DeviceTable {...defaultProps} />);

      const rows = screen.getAllByRole('row').filter((row) => row.querySelector('td') !== null);

      rows.forEach((row) => {
        expect(row).toHaveClass('hover:bg-gray-50', 'dark:hover:bg-gray-700', 'cursor-pointer');
      });
    });

    it('should have responsive overflow container', () => {
      const { container } = render(<DeviceTable {...defaultProps} />);

      const overflowContainer = container.querySelector('.overflow-x-auto');
      expect(overflowContainer).toBeInTheDocument();
    });

    it('should apply correct styling to table headers', () => {
      render(<DeviceTable {...defaultProps} />);

      const headers = screen.getAllByRole('columnheader');

      // Check all headers except the last one (Actions)
      headers.slice(0, -1).forEach((header) => {
        expect(header).toHaveClass('px-6', 'py-3', 'text-left', 'text-xs', 'font-medium');
      });

      // Check the last header (Actions) which has text-right
      const actionsHeader = headers[headers.length - 1];
      expect(actionsHeader).toHaveClass('px-6', 'py-3', 'text-right', 'text-xs', 'font-medium');
    });

    it('should apply correct styling to action buttons', () => {
      render(<DeviceTable {...defaultProps} />);

      const editButtons = screen.getAllByText('Edit');
      editButtons.forEach((button) => {
        expect(button).toHaveClass('text-blue-600', 'hover:text-blue-900');
      });

      const deleteButtons = screen.getAllByText('Delete');
      deleteButtons.forEach((button) => {
        expect(button).toHaveClass('text-red-600', 'hover:text-red-900');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle devices with missing optional fields', () => {
      const deviceWithMissingFields = new DeviceModel({
        id: '4',
        name: 'Device 4',
        serialNumber: 'SN004',
        type: DeviceType.Sensor,
        status: DeviceStatus.Online,
        firmwareVersion: '1.0.0',
        location: null,
        lastSeenAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      render(<DeviceTable {...defaultProps} devices={[deviceWithMissingFields]} />);

      expect(screen.getByText('Device 4')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument(); // location
      expect(screen.getByText('Never')).toBeInTheDocument(); // lastSeenAt
    });

    it('should handle empty strings in device properties', () => {
      const deviceWithEmptyStrings = new DeviceModel({
        id: '5',
        name: '',
        serialNumber: '',
        type: DeviceType.Sensor, // Can't be empty, using a valid enum value
        status: DeviceStatus.Offline, // Can't be empty, using a valid enum value
        firmwareVersion: '',
        location: '',
        lastSeenAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      render(<DeviceTable {...defaultProps} devices={[deviceWithEmptyStrings]} />);

      // Should render without crashing
      expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('should handle very long device names and locations', () => {
      const deviceWithLongText = new DeviceModel({
        id: '6',
        name: 'This is a very long device name that might overflow the table cell',
        serialNumber: 'SN-VERY-LONG-SERIAL-NUMBER-123456789',
        type: DeviceType.Sensor,
        status: DeviceStatus.Online,
        firmwareVersion: '1.0.0-beta.123456789',
        location: 'Building A, Floor 3, Room 301, Rack 5, Shelf 2, Position 3',
        lastSeenAt: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      render(<DeviceTable {...defaultProps} devices={[deviceWithLongText]} />);

      expect(screen.getByText(deviceWithLongText.name)).toBeInTheDocument();
      expect(screen.getByText(deviceWithLongText.location!)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure for screen readers', () => {
      render(<DeviceTable {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(8);

      const rows = screen.getAllByRole('row');
      // 1 header row + 3 data rows
      expect(rows).toHaveLength(4);
    });

    it('should have accessible button labels', () => {
      render(<DeviceTable {...defaultProps} />);

      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');

      editButtons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });

      deleteButtons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Performance', () => {
    it('should handle large number of devices', () => {
      const manyDevices: DeviceModel[] = Array.from(
        { length: 100 },
        (_, i) =>
          ({
            id: `device-${i}`,
            name: `Device ${i}`,
            serialNumber: `SN${i.toString().padStart(3, '0')}`,
            type: ['Sensor', 'Gateway', 'Controller'][i % 3],
            status: ['online', 'offline', 'maintenance'][i % 3],
            firmwareVersion: `${i % 3}.${i % 5}.${i % 10}`,
            location: i % 2 === 0 ? `Location ${i}` : null,
            lastSeenAt: i % 2 === 0 ? new Date() : null,
            lastSeenFormatted: i % 2 === 0 ? 'Just now' : '',
          }) as DeviceModel
      );

      const { container } = render(<DeviceTable {...defaultProps} devices={manyDevices} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(100);
    });
  });
});
