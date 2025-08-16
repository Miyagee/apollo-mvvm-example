import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { useDevices } from '../DeviceViewModel';
import {
  GetDevicesDocument,
  CreateDeviceDocument,
  UpdateDeviceDocument,
  DeleteDeviceDocument,
  Device,
  DeviceStatus,
  DeviceType,
} from '../../graphql/generated';
import { InMemoryCache } from '@apollo/client';

// Mock device data
const createMockDevices = (): Device[] => [
  {
    __typename: 'Device' as const,
    id: '1',
    name: 'Temperature Sensor',
    serialNumber: 'TS-001-A',
    type: DeviceType.Sensor,
    status: DeviceStatus.Online,
    lastSeenAt: new Date().toISOString(),
    firmwareVersion: '1.0.0',
    location: 'Building A',
    createdAt: new Date('2023-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    __typename: 'Device' as const,
    id: '2',
    name: 'Gateway Device',
    serialNumber: 'GW-001-MAIN',
    type: DeviceType.Gateway,
    status: DeviceStatus.Offline,
    lastSeenAt: null,
    firmwareVersion: '2.1.0',
    location: 'Server Room',
    createdAt: new Date('2023-01-02').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to create wrapper with mocked Apollo Provider
const createWrapper = (mocks: MockedResponse[]) => {
  function TestWrapper({ children }: { children: React.ReactNode }) {
    // Create a new cache instance for each test
    const cache = new InMemoryCache();

    return (
      <MockedProvider mocks={mocks} cache={cache}>
        {children}
      </MockedProvider>
    );
  }

  return TestWrapper;
};

describe('useDevices', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.error to suppress errors during testing
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
  });

  describe('fetching devices', () => {
    it('should fetch and return devices successfully', async () => {
      const mockDevices = createMockDevices();
      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      // Initial state
      expect(result.current.loading).toBe(true);
      expect(result.current.devices).toEqual([]);
      expect(result.current.error).toBeNull();

      // Wait for data
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check devices are transformed to DeviceModel instances
      expect(result.current.devices).toHaveLength(2);
      expect(result.current.devices[0].name).toBe('Temperature Sensor');
      expect(result.current.devices[0].isOnline).toBe(true);
      expect(result.current.devices[1].name).toBe('Gateway Device');
      expect(result.current.devices[1].isOffline).toBe(true);
    });

    it('should handle fetch errors', async () => {
      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          error: new Error('Network error'),
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Network error');
      expect(result.current.devices).toEqual([]);
    });

    it('should handle GraphQL errors', async () => {
      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            errors: [new GraphQLError('GraphQL error occurred')],
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.devices).toEqual([]);
    });
  });

  describe('device selection', () => {
    it('should select and deselect devices', async () => {
      const mockDevices = createMockDevices();
      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initially no device selected
      expect(result.current.selectedDevice).toBeNull();

      // Select device
      act(() => {
        result.current.selectDevice('1');
      });

      expect(result.current.selectedDevice?.id).toBe('1');
      expect(result.current.selectedDevice?.name).toBe('Temperature Sensor');

      // Deselect device
      act(() => {
        result.current.selectDevice(null);
      });

      expect(result.current.selectedDevice).toBeNull();
    });
  });

  describe('search functionality', () => {
    it('should filter devices based on search term', async () => {
      const mockDevices = createMockDevices();
      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initially all devices shown
      expect(result.current.filteredDevices).toHaveLength(2);

      // Search by name
      act(() => {
        result.current.setSearchTerm('temperature');
      });

      expect(result.current.filteredDevices).toHaveLength(1);
      expect(result.current.filteredDevices[0].name).toBe('Temperature Sensor');

      // Search by serial number
      act(() => {
        result.current.setSearchTerm('GW-001');
      });

      expect(result.current.filteredDevices).toHaveLength(1);
      expect(result.current.filteredDevices[0].name).toBe('Gateway Device');

      // Clear search
      act(() => {
        result.current.setSearchTerm('');
      });

      expect(result.current.filteredDevices).toHaveLength(2);
    });
  });

  describe('creating devices', () => {
    it('should create a device successfully', async () => {
      const mockDevices = createMockDevices();
      const newDevice: Device = {
        id: '3',
        name: 'New Camera',
        serialNumber: 'CAM-001-ENT',
        type: DeviceType.Camera,
        status: DeviceStatus.Online,
        lastSeenAt: new Date().toISOString(),
        firmwareVersion: '1.0.0',
        location: 'Entrance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
        {
          request: {
            query: CreateDeviceDocument,
            variables: {
              input: {
                name: 'New Camera',
                serialNumber: 'CAM-001-ENT',
                type: DeviceType.Camera,
                firmwareVersion: '1.0.0',
                location: 'Entrance',
              },
            },
          },
          result: {
            data: {
              createDevice: newDevice,
            },
          },
        },
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: [...mockDevices, newDevice],
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.creating).toBe(false);

      // Create device
      await act(async () => {
        await result.current.createDevice({
          name: 'New Camera',
          serialNumber: 'CAM-001-ENT',
          type: DeviceType.Camera,
          firmwareVersion: '1.0.0',
          location: 'Entrance',
        });
      });

      await waitFor(() => {
        expect(result.current.devices).toHaveLength(3);
      });
    });

    it('should validate device input before creating', async () => {
      const mockDevices = createMockDevices();
      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Test invalid name
      await act(async () => {
        await expect(
          result.current.createDevice({
            name: 'AB', // Too short
            serialNumber: 'CAM-001-ENT',
            type: DeviceType.Camera,
            firmwareVersion: '1.0.0',
          })
        ).rejects.toThrow('Device name must be between 3 and 50 characters');
      });

      // Test invalid serial number
      await act(async () => {
        await expect(
          result.current.createDevice({
            name: 'Valid Name',
            serialNumber: 'invalid-serial',
            type: DeviceType.Camera,
            firmwareVersion: '1.0.0',
          })
        ).rejects.toThrow('Invalid serial number format');
      });

      // Test invalid firmware version
      await act(async () => {
        await expect(
          result.current.createDevice({
            name: 'Valid Name',
            serialNumber: 'CAM-001-ENT',
            type: DeviceType.Camera,
            firmwareVersion: '1.0', // Invalid format
          })
        ).rejects.toThrow('Invalid firmware version format');
      });
    });
  });

  describe('updating devices', () => {
    it('should update a device successfully', async () => {
      const mockDevices = createMockDevices();
      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
        {
          request: {
            query: UpdateDeviceDocument,
            variables: {
              input: {
                id: '1',
                name: 'Updated Sensor',
                status: DeviceStatus.Maintenance,
              },
            },
          },
          result: {
            data: {
              updateDevice: {
                ...mockDevices[0],
                name: 'Updated Sensor',
                status: DeviceStatus.Maintenance,
              },
            },
          },
        },
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: [
                {
                  ...mockDevices[0],
                  name: 'Updated Sensor',
                  status: DeviceStatus.Maintenance,
                },
                mockDevices[1],
              ],
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update device
      await act(async () => {
        await result.current.updateDevice({
          id: '1',
          name: 'Updated Sensor',
          status: DeviceStatus.Maintenance,
        });
      });

      await waitFor(() => {
        const updatedDevice = result.current.devices.find((d) => d.id === '1');
        expect(updatedDevice?.name).toBe('Updated Sensor');
        expect(updatedDevice?.status).toBe(DeviceStatus.Maintenance);
      });
    });

    it('should validate update input', async () => {
      const mockDevices = createMockDevices();
      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Test invalid name update
      await act(async () => {
        await expect(
          result.current.updateDevice({
            id: '1',
            name: 'A', // Too short
          })
        ).rejects.toThrow('Device name must be between 3 and 50 characters');
      });

      // Test invalid firmware version update
      await act(async () => {
        await expect(
          result.current.updateDevice({
            id: '1',
            firmwareVersion: 'invalid',
          })
        ).rejects.toThrow('Invalid firmware version format');
      });
    });
  });

  describe('deleting devices', () => {
    it('should delete a device successfully', async () => {
      const mockDevices = createMockDevices();
      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
        {
          request: {
            query: DeleteDeviceDocument,
            variables: {
              id: '1',
            },
          },
          result: {
            data: {
              deleteDevice: true,
            },
          },
        },
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: [mockDevices[1]],
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.devices).toHaveLength(2);

      // Delete device
      await act(async () => {
        await result.current.deleteDevice('1');
      });

      await waitFor(() => {
        expect(result.current.devices).toHaveLength(1);
        expect(result.current.devices[0].id).toBe('2');
      });
    });

    it('should clear selection when deleting selected device', async () => {
      const mockDevices = createMockDevices();
      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
        {
          request: {
            query: DeleteDeviceDocument,
            variables: {
              id: '1',
            },
          },
          result: {
            data: {
              deleteDevice: true,
            },
          },
        },
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: [mockDevices[1]],
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Select device first
      act(() => {
        result.current.selectDevice('1');
      });

      expect(result.current.selectedDevice?.id).toBe('1');

      // Delete the selected device
      await act(async () => {
        await result.current.deleteDevice('1');
      });

      await waitFor(() => {
        expect(result.current.selectedDevice).toBeNull();
      });
    });
  });

  describe('refetch', () => {
    it('should refetch devices', async () => {
      const mockDevices = createMockDevices();

      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: [
                ...mockDevices,
                {
                  id: '3',
                  name: 'New Device',
                  serialNumber: 'ND-001-A',
                  type: DeviceType.Sensor,
                  status: DeviceStatus.Online,
                  lastSeenAt: new Date().toISOString(),
                  firmwareVersion: '1.0.0',
                  location: 'Building B',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.devices).toHaveLength(2);

      // Refetch
      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.devices).toHaveLength(3);
      });
    });
  });

  describe('loading states', () => {
    it('should track loading states correctly', async () => {
      const mockDevices = createMockDevices();

      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
        {
          request: {
            query: CreateDeviceDocument,
            variables: {
              input: {
                name: 'New Device',
                serialNumber: 'ND-001-A',
                type: DeviceType.Sensor,
                firmwareVersion: '1.0.0',
              },
            },
          },
          result: {
            data: {
              createDevice: {
                id: '3',
                name: 'New Device',
                serialNumber: 'ND-001-A',
                type: DeviceType.Sensor,
                status: DeviceStatus.Online,
                lastSeenAt: new Date().toISOString(),
                firmwareVersion: '1.0.0',
                location: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          },
          delay: 100,
        },
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: [
                ...mockDevices,
                {
                  id: '3',
                  name: 'New Device',
                  serialNumber: 'ND-001-A',
                  type: DeviceType.Sensor,
                  status: DeviceStatus.Online,
                  lastSeenAt: new Date().toISOString(),
                  firmwareVersion: '1.0.0',
                  location: null,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start creating - don't await yet
      let createPromise: Promise<void>;
      act(() => {
        createPromise = result.current.createDevice({
          name: 'New Device',
          serialNumber: 'ND-001-A',
          type: DeviceType.Sensor,
          firmwareVersion: '1.0.0',
        });
      });

      // Check creating state immediately
      expect(result.current.creating).toBe(true);

      // Now wait for completion
      await act(async () => {
        await createPromise!;
      });

      // Check creating state is false after completion
      expect(result.current.creating).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle and throw mutation errors', async () => {
      const mockDevices = createMockDevices();

      const mocks: MockedResponse[] = [
        {
          request: {
            query: GetDevicesDocument,
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        },
        {
          request: {
            query: CreateDeviceDocument,
            variables: {
              input: {
                name: 'New Device',
                serialNumber: 'ND-001-A',
                type: DeviceType.Sensor,
                firmwareVersion: '1.0.0',
              },
            },
          },
          result: {
            errors: [new GraphQLError('Failed to create device')],
          },
        },
      ];

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Attempt to create device
      let errorThrown = false;
      await act(async () => {
        await result.current
          .createDevice({
            name: 'New Device',
            serialNumber: 'ND-001-A',
            type: DeviceType.Sensor,
            firmwareVersion: '1.0.0',
          })
          .catch(() => {
            errorThrown = true;
          });
      });

      // Verify error was thrown
      expect(errorThrown).toBe(true);

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toBe('Failed to create device:');
    });
  });
});
