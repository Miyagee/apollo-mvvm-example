import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  describe('Given a device table should display device data', () => {
    describe('When the table is rendered with devices', () => {
      it('Then displays table headers for all device information', () => {
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

      it('Then shows all device data in table rows', () => {
        render(<DeviceTable {...defaultProps} />);

        mockDevices.forEach((device) => {
          expect(screen.getByText(device.name)).toBeInTheDocument();
          expect(screen.getByText(device.serialNumber)).toBeInTheDocument();
          expect(screen.getByText(device.type)).toBeInTheDocument();
          expect(screen.getByText(device.firmwareVersion)).toBeInTheDocument();
        });
      });

      it('Then displays location or dash for null locations', () => {
        render(<DeviceTable {...defaultProps} />);

        expect(screen.getByText('Building A')).toBeInTheDocument();
        expect(screen.getByText('Building B')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
      });

      it('Then shows formatted last seen time or "Never" for null values', () => {
        render(<DeviceTable {...defaultProps} />);

        expect(screen.getByText('Never')).toBeInTheDocument();
      });

      it('Then displays status badges for each device', () => {
        render(<DeviceTable {...defaultProps} />);

        const statusBadges = screen.getAllByTestId('status-badge');
        expect(statusBadges).toHaveLength(mockDevices.length);

        expect(statusBadges[0]).toHaveTextContent(DeviceStatus.Online);
        expect(statusBadges[1]).toHaveTextContent(DeviceStatus.Offline);
        expect(statusBadges[2]).toHaveTextContent(DeviceStatus.Maintenance);
      });
    });
  });

  describe('Given a user wants to interact with devices', () => {
    describe('When clicking on a device row', () => {
      it('Then selects the device', () => {
        render(<DeviceTable {...defaultProps} />);

        const firstRow = screen.getByText('Device 1').closest('tr');
        fireEvent.click(firstRow!);

        expect(defaultProps.onSelectDevice).toHaveBeenCalledWith('1');
      });

      it('Then highlights the selected device row', () => {
        render(<DeviceTable {...defaultProps} selectedDevice={mockDevices[0]} />);

        const selectedRow = screen.getByText('Device 1').closest('tr');
        expect(selectedRow).toHaveClass('bg-blue-50', 'dark:bg-blue-900/20');

        const otherRow = screen.getByText('Device 2').closest('tr');
        expect(otherRow).not.toHaveClass('bg-blue-50', 'dark:bg-blue-900/20');
      });

      it('Then updates highlighted row when selection changes', () => {
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

    describe('When clicking device action buttons', () => {
      it('Then provides Edit and Delete buttons for each device', () => {
        render(<DeviceTable {...defaultProps} />);

        const editButtons = screen.getAllByText('Edit');
        const deleteButtons = screen.getAllByText('Delete');

        expect(editButtons).toHaveLength(mockDevices.length);
        expect(deleteButtons).toHaveLength(mockDevices.length);
      });

      it('Then calls edit handler when Edit button is clicked', () => {
        render(<DeviceTable {...defaultProps} />);

        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);

        expect(defaultProps.onEditDevice).toHaveBeenCalledWith(mockDevices[0]);
        expect(defaultProps.onSelectDevice).not.toHaveBeenCalled(); // Should not trigger row selection
      });

      it('Then calls delete handler when Delete button is clicked', () => {
        render(<DeviceTable {...defaultProps} />);

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[1]);

        expect(defaultProps.onDeleteDevice).toHaveBeenCalledWith('2');
        expect(defaultProps.onSelectDevice).not.toHaveBeenCalled(); // Should not trigger row selection
      });
    });
  });

  describe('Given there are no devices to display', () => {
    describe('When the table is rendered with empty device list', () => {
      it('Then shows the default empty message', () => {
        render(<DeviceTable {...defaultProps} devices={[]} />);

        expect(screen.getByText('No devices found')).toBeInTheDocument();
      });

      it('Then shows custom empty message when provided', () => {
        const customMessage = 'Custom empty message';
        render(<DeviceTable {...defaultProps} devices={[]} emptyMessage={customMessage} />);

        expect(screen.getByText(customMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Given the table handles edge cases', () => {
    describe('When devices have missing optional data', () => {
      it('Then gracefully handles null location and lastSeenAt values', () => {
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

      it('Then handles empty string values in device properties', () => {
        const deviceWithEmptyStrings = new DeviceModel({
          id: '5',
          name: '',
          serialNumber: '',
          type: DeviceType.Sensor,
          status: DeviceStatus.Offline,
          firmwareVersion: '',
          location: '',
          lastSeenAt: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        });

        render(<DeviceTable {...defaultProps} devices={[deviceWithEmptyStrings]} />);

        expect(screen.getByText('Never')).toBeInTheDocument();
      });

      it('Then displays very long device names and locations without breaking layout', () => {
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

    describe('When rendering many devices', () => {
      it('Then handles large numbers of devices efficiently', () => {
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
});
