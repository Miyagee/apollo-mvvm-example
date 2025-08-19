import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useDevices } from '@/viewmodels/DeviceViewModel';
import { DeviceType, DeviceStatus, CreateDeviceInput } from '@/graphql/generated';
import { DeviceModel } from '@/models/Device';

import { DeviceTableView } from '../DeviceTableView';
import { DeleteConfirmModalProps } from './components/DeleteConfirmModal';
import { DeviceFormProps } from './components/DeviceForm';

// Mock the ViewModel
jest.mock('@/viewmodels/DeviceViewModel');

// Mock the child components
jest.mock('./components/DeviceForm', () => ({
  DeviceForm: ({ onSubmit, onCancel, device, isSubmitting }: DeviceFormProps) => (
    <div data-testid='device-form'>
      <h2>{device ? 'Edit Device' : 'Add New Device'}</h2>
      <button
        onClick={() =>
          onSubmit(
            device
              ? { id: device.id, name: 'Updated' }
              : ({ name: 'New Device' } as CreateDeviceInput)
          )
        }
      >
        {isSubmitting ? 'Saving...' : 'Submit'}
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock('./components/DeleteConfirmModal', () => ({
  DeleteConfirmModal: ({ onConfirm, onCancel, isDeleting }: DeleteConfirmModalProps) => (
    <div data-testid='delete-confirm'>
      <button onClick={onConfirm}>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Mock device data
const getMockDevices = () => [
  new DeviceModel({
    id: '1',
    name: 'Temperature Sensor',
    serialNumber: 'TS-001-A',
    type: DeviceType.Sensor,
    status: DeviceStatus.Online,
    lastSeenAt: new Date().toISOString(),
    firmwareVersion: '1.0.0',
    location: 'Building A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  new DeviceModel({
    id: '2',
    name: 'Gateway Device',
    serialNumber: 'GW-001-MAIN',
    type: DeviceType.Gateway,
    status: DeviceStatus.Offline,
    lastSeenAt: null,
    firmwareVersion: '2.1.0',
    location: 'Server Room',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
];

describe('DeviceTableView', () => {
  const mockUseDevices = useDevices as jest.MockedFunction<typeof useDevices>;
  const defaultMockDevices = getMockDevices();
  const defaultMockReturn = {
    devices: defaultMockDevices,
    filteredDevices: defaultMockDevices,
    selectedDevice: null,
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    error: null,
    searchTerm: '',
    setSearchInput: jest.fn(),
    selectDevice: jest.fn(),
    createDevice: jest.fn(),
    updateDevice: jest.fn(),
    deleteDevice: jest.fn(),
    refetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDevices.mockReturnValue(defaultMockReturn);
  });

  describe('initial render', () => {
    it('should render the device table with devices', () => {
      render(<DeviceTableView />);

      expect(screen.getByText('Device Management')).toBeInTheDocument();
      expect(screen.getByText('Temperature Sensor')).toBeInTheDocument();
      expect(screen.getByText('Gateway Device')).toBeInTheDocument();
      expect(screen.getByText('Showing 2 of 2 devices')).toBeInTheDocument();
    });

    it('should render loading state when loading', () => {
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        devices: [],
        filteredDevices: [],
        loading: true,
      });

      render(<DeviceTableView />);

      expect(screen.getByText('Loading devices...')).toBeInTheDocument();
    });

    it('should render error state when error occurs', () => {
      const mockError = new Error('Failed to fetch devices');
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        devices: [],
        filteredDevices: [],
        error: mockError,
      });

      render(<DeviceTableView />);

      expect(screen.getByText('Error: Failed to fetch devices')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should handle retry on error', () => {
      const mockRefetch = jest.fn();
      const mockError = new Error('Failed to fetch devices');
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        devices: [],
        filteredDevices: [],
        error: mockError,
        refetch: mockRefetch,
      });

      render(<DeviceTableView />);
      fireEvent.click(screen.getByText('Retry'));

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('search functionality', () => {
    it('should update search term', async () => {
      const mockSetSearchTerm = jest.fn();
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        setSearchInput: mockSetSearchTerm,
      });

      render(<DeviceTableView />);

      const searchInput = screen.getByPlaceholderText('Search devices by name or serial number...');
      await userEvent.type(searchInput, 'tem');

      expect(mockSetSearchTerm).toHaveBeenCalledTimes(3);
      expect(mockSetSearchTerm).toHaveBeenNthCalledWith(1, 't');
      expect(mockSetSearchTerm).toHaveBeenNthCalledWith(2, 'e');
      expect(mockSetSearchTerm).toHaveBeenNthCalledWith(3, 'm');
    });

    it('should show filtered results', () => {
      const mockDevices = getMockDevices();
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        searchTerm: 'temperature',
        filteredDevices: [mockDevices[0]],
      });

      render(<DeviceTableView />);

      expect(screen.getByText('Temperature Sensor')).toBeInTheDocument();
      expect(screen.queryByText('Gateway Device')).not.toBeInTheDocument();
      expect(screen.getByText('Showing 1 of 2 devices')).toBeInTheDocument();
    });
  });

  describe('device creation', () => {
    it('should open create form when Add Device is clicked', () => {
      render(<DeviceTableView />);

      fireEvent.click(screen.getByText('Add Device'));

      expect(screen.getByTestId('device-form')).toBeInTheDocument();
      expect(screen.getByText('Add New Device')).toBeInTheDocument();
    });

    it('should call createDevice when form is submitted', async () => {
      const mockCreateDevice = jest.fn().mockResolvedValue(undefined);
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        createDevice: mockCreateDevice,
      });

      render(<DeviceTableView />);

      fireEvent.click(screen.getByText('Add Device'));
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockCreateDevice).toHaveBeenCalledWith({ name: 'New Device' });
      });

      await waitFor(() => {
        expect(screen.queryByTestId('device-form')).not.toBeInTheDocument();
      });
    });

    it('should close form when cancel is clicked', () => {
      render(<DeviceTableView />);

      fireEvent.click(screen.getByText('Add Device'));
      expect(screen.getByTestId('device-form')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByTestId('device-form')).not.toBeInTheDocument();
    });
  });

  describe('device editing', () => {
    it('should open edit form when Edit is clicked', () => {
      render(<DeviceTableView />);

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId('device-form')).toBeInTheDocument();
      expect(screen.getByText('Edit Device')).toBeInTheDocument();
    });

    it('should call updateDevice when form is submitted', async () => {
      const mockUpdateDevice = jest.fn();
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        updateDevice: mockUpdateDevice,
      });

      render(<DeviceTableView />);

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockUpdateDevice).toHaveBeenCalled();
      });

      expect(mockUpdateDevice).toHaveBeenCalledWith({ id: '1', name: 'Updated' });

      await waitFor(() => {
        expect(screen.queryByTestId('device-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('device deletion', () => {
    it('should show delete confirmation when Delete is clicked', () => {
      render(<DeviceTableView />);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByTestId('delete-confirm')).toBeInTheDocument();
    });

    it('should call deleteDevice when confirmed', async () => {
      const mockDeleteDevice = jest.fn();
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        deleteDevice: mockDeleteDevice,
      });

      render(<DeviceTableView />);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      fireEvent.click(screen.getByText('Confirm Delete'));

      await waitFor(() => {
        expect(mockDeleteDevice).toHaveBeenCalledWith('1');
      });

      await waitFor(() => {
        expect(screen.queryByTestId('delete-confirm')).not.toBeInTheDocument();
      });
    });

    it('should close confirmation when cancel is clicked', () => {
      render(<DeviceTableView />);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByTestId('delete-confirm')).toBeInTheDocument();

      fireEvent.click(screen.getAllByText('Cancel')[0]);
      expect(screen.queryByTestId('delete-confirm')).not.toBeInTheDocument();
    });

    it('should show deleting state', () => {
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        deleting: true,
      });

      render(<DeviceTableView />);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });
  });

  describe('device selection', () => {
    it('should select device when row is clicked', () => {
      const mockSelectDevice = jest.fn();
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        selectDevice: mockSelectDevice,
      });

      render(<DeviceTableView />);

      // Click on the first device row
      const deviceRow = screen.getByText('Temperature Sensor').closest('tr');
      fireEvent.click(deviceRow!);

      expect(mockSelectDevice).toHaveBeenCalledWith('1');
    });

    it('should highlight selected device', () => {
      const mockDevices = getMockDevices();

      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        selectedDevice: mockDevices[0],
      });

      render(<DeviceTableView />);

      const deviceRow = screen.getByText('Temperature Sensor').closest('tr');
      expect(deviceRow).toHaveClass('bg-blue-50');
    });
  });

  describe('loading states', () => {
    it('should show creating state in form', () => {
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        creating: true,
      });

      render(<DeviceTableView />);
      fireEvent.click(screen.getByText('Add Device'));

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show updating state in form', () => {
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        updating: true,
      });

      render(<DeviceTableView />);
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should show empty message when no devices', () => {
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        devices: [],
        filteredDevices: [],
      });

      render(<DeviceTableView />);

      expect(screen.getByText('No devices found. Add your first device!')).toBeInTheDocument();
    });

    it('should show search empty message when no results', () => {
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        searchTerm: 'nonexistent',
        filteredDevices: [],
      });

      render(<DeviceTableView />);

      expect(screen.getByText('No devices found matching your search.')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    // Store the original console.error
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      // Mock console.error to silence it during tests
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('should handle createDevice errors gracefully', async () => {
      const mockCreateDevice = jest.fn().mockRejectedValue(new Error('Create failed'));
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        createDevice: mockCreateDevice,
      });

      render(<DeviceTableView />);

      fireEvent.click(screen.getByText('Add Device'));
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockCreateDevice).toHaveBeenCalled();
      });

      // Form should remain open on error
      expect(screen.getByTestId('device-form')).toBeInTheDocument();
    });

    it('should handle deleteDevice errors gracefully', async () => {
      const mockDeleteDevice = jest.fn().mockRejectedValue(new Error('Delete failed'));
      mockUseDevices.mockReturnValue({
        ...defaultMockReturn,
        deleteDevice: mockDeleteDevice,
      });

      render(<DeviceTableView />);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      fireEvent.click(screen.getByText('Confirm Delete'));

      await waitFor(() => {
        expect(mockDeleteDevice).toHaveBeenCalled();
      });

      // Modal should close even on error (error handled by ViewModel)
      await waitFor(() => {
        expect(screen.queryByTestId('delete-confirm')).not.toBeInTheDocument();
      });
    });
  });
});
