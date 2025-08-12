import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviceTableView } from './index';
import { useDevices } from '@/viewmodels/DeviceViewModel';
import { DeviceStatus, DeviceType } from '@/graphql/generated';

// Only mock the ViewModel and SearchBar (since we need to interact with it)
jest.mock('@/viewmodels/DeviceViewModel', () => ({
  useDevices: jest.fn(),
}));

// Minimal mock for SearchBar to ensure testability
jest.mock('./components/SearchBar', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SearchBar: ({ value, onChange, placeholder }: any) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid='search-input'
    />
  ),
}));

describe('DeviceTableView', () => {
  const mockDevices = [
    {
      id: '1',
      name: 'Test Device 1',
      serialNumber: 'TD-001',
      type: DeviceType.Sensor,
      status: DeviceStatus.Online,
      firmwareVersion: '1.0.0',
      location: 'Lab 1',
      lastSeenAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Test Device 2',
      serialNumber: 'TD-002',
      type: DeviceType.Gateway,
      status: DeviceStatus.Offline,
      firmwareVersion: '2.0.0',
      location: 'Lab 2',
      lastSeenAt: '2024-01-02T00:00:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const defaultMockViewModel = {
    devices: mockDevices,
    filteredDevices: mockDevices,
    selectedDevice: null,
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    error: undefined,
    searchTerm: '',
    setSearchInput: jest.fn(),
    selectDevice: jest.fn(),
    createDevice: jest.fn().mockResolvedValue({}),
    updateDevice: jest.fn().mockResolvedValue({}),
    deleteDevice: jest.fn().mockResolvedValue({}),
    refetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDevices as jest.Mock).mockReturnValue(defaultMockViewModel);
  });

  describe('Given a DeviceTableView', () => {
    describe('When component renders with devices', () => {
      it('Then it should display the device table and controls', () => {
        render(<DeviceTableView />);

        expect(screen.getByText('Device Management')).toBeInTheDocument();
        expect(screen.getByText('Add Device')).toBeInTheDocument();
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(screen.getByText('Test Device 1')).toBeInTheDocument();
        expect(screen.getByText('Test Device 2')).toBeInTheDocument();
        expect(screen.getByText('Showing 2 of 2 devices')).toBeInTheDocument();
      });
    });

    describe('When loading devices', () => {
      it('Then it should show loading state', () => {
        (useDevices as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          loading: true,
          devices: [],
        });

        render(<DeviceTableView />);

        expect(screen.getByText('Loading devices...')).toBeInTheDocument();
        expect(screen.queryByText('Test Device 1')).not.toBeInTheDocument();
      });
    });

    describe('When there is an error', () => {
      it('Then it should show error state', () => {
        (useDevices as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          error: { message: 'Failed to load devices' },
          devices: [],
        });

        render(<DeviceTableView />);

        expect(screen.getByText('Error: Failed to load devices')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      it('Then retry button should call refetch', () => {
        const mockRefetch = jest.fn();
        (useDevices as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          error: { message: 'Failed to load devices' },
          devices: [],
          refetch: mockRefetch,
        });

        render(<DeviceTableView />);

        fireEvent.click(screen.getByText('Retry'));
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    describe('When searching devices', () => {
      it('Then it should update search term', () => {
        const mockSetSearchInput = jest.fn();
        (useDevices as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          setSearchInput: mockSetSearchInput,
        });

        render(<DeviceTableView />);

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'Test' } });

        expect(mockSetSearchInput).toHaveBeenCalledWith('Test');
      });
    });

    describe('When adding a device', () => {
      it('Then it should open form for new device', () => {
        render(<DeviceTableView />);

        fireEvent.click(screen.getByText('Add Device'));

        // Look for form elements that would indicate the form is open
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });
  });
});
