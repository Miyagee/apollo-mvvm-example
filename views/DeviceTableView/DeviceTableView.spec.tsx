import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviceTableView } from './index';
import { useDeviceTableViewModel } from '@/viewmodels/DeviceTableViewModel';
import { DeviceStatus, DeviceType } from '@/graphql/generated';
import { DeviceModel } from '@/models/Device';

// Mock the ViewModel
jest.mock('@/viewmodels/DeviceTableViewModel', () => ({
  useDeviceTableViewModel: jest.fn(),
}));

describe('DeviceTableView', () => {
  const mockDevices = [
    new DeviceModel({
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
    }),
    new DeviceModel({
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
    }),
  ];

  const defaultMockViewModel = {
    // Data
    devices: mockDevices,
    filteredDevices: mockDevices,
    selectedDevice: null,

    // Loading states
    loading: false,
    creating: false,
    updating: false,
    deleting: false,

    // Network status
    networkStatus: 7, // Ready
    isPolling: false,
    isRefetching: false,

    // Error states
    error: null,

    // Search
    searchInputValue: '',
    searchTerm: '',
    isSearchDebouncing: false,
    setSearchInput: jest.fn(),
    clearSearch: jest.fn(),

    // Selection
    selectDevice: jest.fn(),

    // Form state
    isFormOpen: false,
    editingDevice: null,
    formData: {
      name: '',
      serialNumber: '',
      type: DeviceType.Sensor,
      status: DeviceStatus.Online,
      firmwareVersion: '',
      location: '',
    },
    formErrors: {},
    formTouched: {},
    isSubmitting: false,
    isEditMode: false,

    // Form actions
    setFormField: jest.fn(),
    touchFormField: jest.fn(),
    submitForm: jest.fn(),
    openCreateForm: jest.fn(),
    openEditForm: jest.fn(),
    closeForm: jest.fn(),

    // Delete state & actions
    deviceToDelete: null,
    confirmDelete: jest.fn(),
    cancelDelete: jest.fn(),
    executeDelete: jest.fn(),

    // Polling controls
    startPolling: jest.fn(),
    stopPolling: jest.fn(),

    // Refetch
    refetch: jest.fn(),

    // Snackbar
    snackbarMessages: [],
    dismissSnackbar: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDeviceTableViewModel as jest.Mock).mockReturnValue(defaultMockViewModel);
  });

  describe('Given a stateless DeviceTableView', () => {
    describe('When component renders with devices', () => {
      it('Then displays the device table and controls', () => {
        render(<DeviceTableView />);

        expect(screen.getByText('Device Management')).toBeInTheDocument();
        expect(screen.getByText('Add Device')).toBeInTheDocument();
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(screen.getByText('Test Device 1')).toBeInTheDocument();
        expect(screen.getByText('Test Device 2')).toBeInTheDocument();
        expect(screen.getByText('Showing 2 of 2 devices')).toBeInTheDocument();
      });

      it('Then does not show syncing indicator when not polling', () => {
        render(<DeviceTableView />);

        expect(screen.queryByTestId('sync-indicator')).not.toBeInTheDocument();
      });
    });

    describe('When isPolling is true', () => {
      it('Then shows syncing indicator', () => {
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          isPolling: true,
        });

        render(<DeviceTableView />);

        expect(screen.getByTestId('sync-indicator')).toBeInTheDocument();
        expect(screen.getByText('Syncing...')).toBeInTheDocument();
      });
    });

    describe('When isRefetching is true', () => {
      it('Then shows syncing indicator', () => {
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          isRefetching: true,
        });

        render(<DeviceTableView />);

        expect(screen.getByTestId('sync-indicator')).toBeInTheDocument();
      });
    });

    describe('When loading devices', () => {
      it('Then shows loading state when no devices', () => {
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
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
      it('Then shows error state when no devices', () => {
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          error: { message: 'Failed to load devices' },
          devices: [],
        });

        render(<DeviceTableView />);

        expect(screen.getByText('Error: Failed to load devices')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      it('Then retry button calls refetch', () => {
        const mockRefetch = jest.fn();
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
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
      it('Then calls setSearchInput from ViewModel', () => {
        const mockSetSearchInput = jest.fn();
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
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
      it('Then calls openCreateForm from ViewModel', () => {
        const mockOpenCreateForm = jest.fn();
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          openCreateForm: mockOpenCreateForm,
        });

        render(<DeviceTableView />);

        fireEvent.click(screen.getByText('Add Device'));

        expect(mockOpenCreateForm).toHaveBeenCalled();
      });
    });

    describe('When form is open', () => {
      it('Then renders DeviceForm component', () => {
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          isFormOpen: true,
        });

        render(<DeviceTableView />);

        expect(screen.getByTestId('device-form')).toBeInTheDocument();
        expect(screen.getByText('Add New Device')).toBeInTheDocument();
      });

      it('Then renders edit form when isEditMode is true', () => {
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          isFormOpen: true,
          isEditMode: true,
          editingDevice: mockDevices[0],
          formData: {
            name: 'Test Device 1',
            serialNumber: 'TD-001',
            type: DeviceType.Sensor,
            status: DeviceStatus.Online,
            firmwareVersion: '1.0.0',
            location: 'Lab 1',
          },
        });

        render(<DeviceTableView />);

        expect(screen.getByText('Edit Device')).toBeInTheDocument();
      });
    });

    describe('When delete confirmation is open', () => {
      it('Then renders DeleteConfirmModal', () => {
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          deviceToDelete: '1',
        });

        render(<DeviceTableView />);

        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
    });

    describe('When snackbar messages exist', () => {
      it('Then renders SnackbarContainer with messages', () => {
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          snackbarMessages: [
            { id: 'msg-1', message: 'Device created successfully', type: 'success' },
          ],
        });

        render(<DeviceTableView />);

        expect(screen.getByTestId('snackbar-container')).toBeInTheDocument();
        expect(screen.getByText('Device created successfully')).toBeInTheDocument();
      });

      it('Then calls dismissSnackbar when dismiss button is clicked', () => {
        const mockDismissSnackbar = jest.fn();
        (useDeviceTableViewModel as jest.Mock).mockReturnValue({
          ...defaultMockViewModel,
          snackbarMessages: [
            { id: 'msg-1', message: 'Test message', type: 'info' },
          ],
          dismissSnackbar: mockDismissSnackbar,
        });

        render(<DeviceTableView />);

        fireEvent.click(screen.getByTestId('snackbar-dismiss-button'));

        expect(mockDismissSnackbar).toHaveBeenCalledWith('msg-1');
      });
    });
  });
});
