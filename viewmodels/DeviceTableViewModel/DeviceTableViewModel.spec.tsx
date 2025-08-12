import { renderHook, act, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';

import { useDeviceTableViewModel } from './index';
import {
  GetDevicesDocument,
  CreateDeviceDocument,
  UpdateDeviceDocument,
  DeleteDeviceDocument,
  DeviceType,
  DeviceStatus,
  Device,
} from '@/graphql/generated';

// Mock device data with __typename for Apollo Client
const mockDevices: Device[] = [
  {
    __typename: 'Device',
    id: '1',
    name: 'Device 1',
    serialNumber: 'SN-001',
    type: DeviceType.Sensor,
    status: DeviceStatus.Online,
    firmwareVersion: '1.0.0',
    location: 'Lab 1',
    lastSeenAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    __typename: 'Device',
    id: '2',
    name: 'Device 2',
    serialNumber: 'SN-002',
    type: DeviceType.Gateway,
    status: DeviceStatus.Offline,
    firmwareVersion: '2.0.0',
    location: 'Lab 2',
    lastSeenAt: '2024-01-02T00:00:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

// Default mocks for GraphQL operations
const createMocks = (overrides?: MockedResponse[]): MockedResponse[] => {
  const defaultMocks: MockedResponse[] = [
    {
      request: { query: GetDevicesDocument },
      result: { data: { devices: mockDevices } },
    },
  ];

  return overrides ? [...defaultMocks, ...overrides] : defaultMocks;
};

// Wrapper component for Apollo Provider
const createWrapper = (mocks: MockedResponse[]) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MockedProvider mocks={mocks}>{children}</MockedProvider>;
  };
};

describe('useDeviceTableViewModel', () => {
  describe('Given the table ViewModel is initialized', () => {
    describe('When loading devices', () => {
      it('Then exposes loading state initially', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });
      });

      it('Then exposes devices after loading', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        expect(result.current.devices[0].name).toBe('Device 1');
        expect(result.current.devices[1].name).toBe('Device 2');
      });

      it('Then has form closed initially', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.isFormOpen).toBe(false);
        expect(result.current.editingDevice).toBeNull();
      });

      it('Then has no device to delete initially', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.deviceToDelete).toBeNull();
      });
    });
  });

  describe('Given the create form workflow', () => {
    describe('When opening the create form', () => {
      it('Then sets isFormOpen to true', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.openCreateForm();
        });

        expect(result.current.isFormOpen).toBe(true);
      });

      it('Then sets editingDevice to null', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.openCreateForm();
        });

        expect(result.current.editingDevice).toBeNull();
      });

      it('Then has empty form values', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.openCreateForm();
        });

        expect(result.current.formData.name).toBe('');
        expect(result.current.formData.serialNumber).toBe('');
        expect(result.current.formData.firmwareVersion).toBe('');
      });

      it('Then isEditMode is false', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.openCreateForm();
        });

        expect(result.current.isEditMode).toBe(false);
      });
    });

    describe('When closing the form', () => {
      it('Then sets isFormOpen to false', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.openCreateForm();
        });

        expect(result.current.isFormOpen).toBe(true);

        act(() => {
          result.current.closeForm();
        });

        expect(result.current.isFormOpen).toBe(false);
      });

      it('Then clears editingDevice', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Open edit form first
        act(() => {
          result.current.openEditForm(result.current.devices[0]);
        });

        expect(result.current.editingDevice).not.toBeNull();

        act(() => {
          result.current.closeForm();
        });

        expect(result.current.editingDevice).toBeNull();
      });
    });

    describe('When filling form fields', () => {
      it('Then updates formData when setFormField is called', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.openCreateForm();
        });

        act(() => {
          result.current.setFormField('name', 'New Device');
        });

        expect(result.current.formData.name).toBe('New Device');
      });

      it('Then tracks touched state when touchFormField is called', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.openCreateForm();
        });

        act(() => {
          result.current.touchFormField('name');
        });

        expect(result.current.formTouched.name).toBe(true);
      });

      it('Then shows validation errors for touched empty fields', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.openCreateForm();
        });

        act(() => {
          result.current.touchFormField('name');
        });

        expect(result.current.formErrors.name).toBe('Name is required');
      });
    });

    describe('When submitting the create form', () => {
      it('Then calls createDevice mutation with form data', async () => {
        const newDevice: Device = {
          __typename: 'Device',
          id: '3',
          name: 'New Device',
          serialNumber: 'NEW-001',
          type: DeviceType.Sensor,
          status: DeviceStatus.Online,
          firmwareVersion: '1.0.0',
          location: null,
          lastSeenAt: '2024-01-03T00:00:00Z',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        };

        const createMock: MockedResponse = {
          request: {
            query: CreateDeviceDocument,
            variables: {
              input: {
                name: 'New Device',
                serialNumber: 'NEW-001',
                type: DeviceType.Sensor,
                firmwareVersion: '1.0.0',
                location: null,
              },
            },
          },
          result: {
            data: {
              createDevice: newDevice,
            },
          },
        };

        const refetchMock: MockedResponse = {
          request: { query: GetDevicesDocument },
          result: { data: { devices: [...mockDevices, newDevice] } },
        };

        const mocks = createMocks([createMock, refetchMock]);
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.openCreateForm();
        });

        act(() => {
          result.current.setFormField('name', 'New Device');
          result.current.setFormField('serialNumber', 'NEW-001');
          result.current.setFormField('firmwareVersion', '1.0.0');
        });

        await act(async () => {
          await result.current.submitForm();
        });

        // Form should close on success
        expect(result.current.isFormOpen).toBe(false);
      });

      it('Then does not submit if validation fails', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.openCreateForm();
        });

        // Don't fill required fields
        await act(async () => {
          await result.current.submitForm();
        });

        // Form should stay open
        expect(result.current.isFormOpen).toBe(true);
        expect(result.current.formErrors.name).toBe('Name is required');
      });
    });
  });

  describe('Given the edit form workflow', () => {
    describe('When opening the edit form', () => {
      it('Then sets isFormOpen to true', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.openEditForm(result.current.devices[0]);
        });

        expect(result.current.isFormOpen).toBe(true);
      });

      it('Then sets editingDevice to the selected device', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.openEditForm(result.current.devices[0]);
        });

        expect(result.current.editingDevice?.id).toBe('1');
      });

      it('Then isEditMode is true', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.openEditForm(result.current.devices[0]);
        });

        expect(result.current.isEditMode).toBe(true);
      });
    });

    describe('When submitting the edit form', () => {
      it('Then calls updateDevice mutation with changed data', async () => {
        const updateMock: MockedResponse = {
          request: {
            query: UpdateDeviceDocument,
            variables: {
              input: {
                id: '1',
                name: 'Updated Device',
                status: DeviceStatus.Online,
                firmwareVersion: '1.0.0',
                location: 'Lab 1',
              },
            },
          },
          result: {
            data: {
              updateDevice: {
                ...mockDevices[0],
                name: 'Updated Device',
              },
            },
          },
        };

        const refetchMock: MockedResponse = {
          request: { query: GetDevicesDocument },
          result: {
            data: {
              devices: [{ ...mockDevices[0], name: 'Updated Device' }, mockDevices[1]],
            },
          },
        };

        const mocks = createMocks([updateMock, refetchMock]);
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.openEditForm(result.current.devices[0]);
        });

        act(() => {
          result.current.setFormField('name', 'Updated Device');
        });

        await act(async () => {
          await result.current.submitForm();
        });

        // Form should close on success
        expect(result.current.isFormOpen).toBe(false);
      });
    });
  });

  describe('Given the delete workflow', () => {
    describe('When confirming delete', () => {
      it('Then sets deviceToDelete', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.confirmDelete('1');
        });

        expect(result.current.deviceToDelete).toBe('1');
      });
    });

    describe('When canceling delete', () => {
      it('Then clears deviceToDelete', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.confirmDelete('1');
        });

        expect(result.current.deviceToDelete).toBe('1');

        act(() => {
          result.current.cancelDelete();
        });

        expect(result.current.deviceToDelete).toBeNull();
      });
    });

    describe('When executing delete', () => {
      it('Then calls deleteDevice mutation', async () => {
        const deleteMock: MockedResponse = {
          request: {
            query: DeleteDeviceDocument,
            variables: { id: '1' },
          },
          result: { data: { deleteDevice: true } },
        };

        const refetchMock: MockedResponse = {
          request: { query: GetDevicesDocument },
          result: { data: { devices: [mockDevices[1]] } },
        };

        const mocks = createMocks([deleteMock, refetchMock]);
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.confirmDelete('1');
        });

        await act(async () => {
          await result.current.executeDelete();
        });

        // deviceToDelete should be cleared on success
        expect(result.current.deviceToDelete).toBeNull();
      });

      it('Then does nothing if no device to delete', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // executeDelete without confirmDelete first
        await act(async () => {
          await result.current.executeDelete();
        });

        // Should not throw, just return early
        expect(result.current.deviceToDelete).toBeNull();
      });
    });
  });

  describe('Given search functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('When setting search input', () => {
      it('Then updates searchInputValue immediately', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.setSearchInput('Device 1');
        });

        // searchInputValue updates immediately
        expect(result.current.searchInputValue).toBe('Device 1');
      });

      it('Then filters devices after debounce delay', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.setSearchInput('Device 1');
        });

        // Filtering doesn't happen immediately (debounced)
        expect(result.current.filteredDevices.length).toBe(2);

        // Wait for debounce
        act(() => {
          jest.advanceTimersByTime(300);
        });

        // Now filtering should be applied
        expect(result.current.filteredDevices.length).toBe(1);
        expect(result.current.filteredDevices[0].name).toBe('Device 1');
      });

      it('Then sets isSearchDebouncing while debouncing', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.setSearchInput('Device 1');
        });

        // Should be debouncing
        expect(result.current.isSearchDebouncing).toBe(true);

        // Wait for debounce
        act(() => {
          jest.advanceTimersByTime(300);
        });

        // No longer debouncing
        expect(result.current.isSearchDebouncing).toBe(false);
      });
    });

    describe('When clearing search', () => {
      it('Then clears both searchInputValue and searchTerm immediately', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.setSearchInput('Device 1');
        });

        act(() => {
          jest.advanceTimersByTime(300);
        });

        expect(result.current.filteredDevices.length).toBe(1);

        act(() => {
          result.current.clearSearch();
        });

        expect(result.current.searchInputValue).toBe('');
        expect(result.current.filteredDevices.length).toBe(2);
      });
    });
  });

  describe('Given device selection', () => {
    describe('When selecting a device', () => {
      it('Then updates selectedDevice', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.selectDevice('1');
        });

        expect(result.current.selectedDevice?.id).toBe('1');
      });

      it('Then clears selection when null is passed', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.devices.length).toBe(2);
        });

        act(() => {
          result.current.selectDevice('1');
        });

        expect(result.current.selectedDevice?.id).toBe('1');

        act(() => {
          result.current.selectDevice(null);
        });

        expect(result.current.selectedDevice).toBeNull();
      });
    });
  });

  describe('Given polling controls', () => {
    describe('When polling functions are called', () => {
      it('Then exposes startPolling and stopPolling', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(typeof result.current.startPolling).toBe('function');
        expect(typeof result.current.stopPolling).toBe('function');
      });
    });
  });

  describe('Given refetch functionality', () => {
    describe('When refetch is called', () => {
      it('Then exposes refetch function', async () => {
        const mocks = createMocks();
        const { result } = renderHook(() => useDeviceTableViewModel(), {
          wrapper: createWrapper(mocks),
        });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(typeof result.current.refetch).toBe('function');
      });
    });
  });
});
