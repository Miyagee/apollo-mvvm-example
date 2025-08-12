import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useDevices } from './index';
import {
  GetDevicesDocument,
  CreateDeviceDocument,
  UpdateDeviceDocument,
  DeleteDeviceDocument,
  DeviceStatus,
  DeviceType,
} from '@/graphql/generated';

// NOTE: We use the REAL DeviceModel, not a mock
// This ensures our tests verify actual validation and search behavior

describe('DeviceViewModel', () => {
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
      __typename: 'Device',
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
      __typename: 'Device',
    },
  ];

  const baseGetDevicesMock = {
    request: {
      query: GetDevicesDocument,
      variables: {},
    },
    result: {
      data: {
        devices: mockDevices,
      },
    },
  };

  describe('Given a DeviceViewModel', () => {
    describe('When loading devices', () => {
      it('Then it should fetch and display devices', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        // Initially loading
        expect(result.current.loading).toBe(true);
        expect(result.current.devices).toEqual([]);

        // Wait for data to load
        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.devices).toHaveLength(2);
        expect(result.current.devices[0].name).toBe('Test Device 1');
        expect(result.current.error).toBeNull();
      });

      it('Then devices are wrapped in DeviceModel instances', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Verify DeviceModel methods work
        const device = result.current.devices[0];
        expect(device.isOnline).toBe(true);
        expect(device.isOffline).toBe(false);
        expect(typeof device.matchesSearch).toBe('function');
      });
    });

    describe('When searching devices', () => {
      it('Then it should filter devices by name', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Set search term
        act(() => {
          result.current.setSearchInput('Device 1');
        });

        expect(result.current.searchTerm).toBe('Device 1');
        expect(result.current.filteredDevices).toHaveLength(1);
        expect(result.current.filteredDevices[0].name).toBe('Test Device 1');
      });

      it('Then it should filter devices by serial number', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSearchInput('TD-002');
        });

        expect(result.current.filteredDevices).toHaveLength(1);
        expect(result.current.filteredDevices[0].serialNumber).toBe('TD-002');
      });

      it('Then it should filter devices by location', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSearchInput('Lab 2');
        });

        expect(result.current.filteredDevices).toHaveLength(1);
        expect(result.current.filteredDevices[0].location).toBe('Lab 2');
      });

      it('Then it should filter devices by type', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSearchInput('gateway');
        });

        expect(result.current.filteredDevices).toHaveLength(1);
        expect(result.current.filteredDevices[0].type).toBe(DeviceType.Gateway);
      });

      it('Then it should be case insensitive', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        act(() => {
          result.current.setSearchInput('TEST DEVICE 1');
        });

        expect(result.current.filteredDevices).toHaveLength(1);
        expect(result.current.filteredDevices[0].name).toBe('Test Device 1');
      });

      it('Then it should show all devices when search is empty', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Set and clear search term
        act(() => {
          result.current.setSearchInput('Device 1');
        });

        act(() => {
          result.current.setSearchInput('');
        });

        expect(result.current.searchTerm).toBe('');
        expect(result.current.filteredDevices).toHaveLength(2);
      });
    });

    describe('When selecting a device', () => {
      it('Then it should set the selected device', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Select device
        act(() => {
          result.current.selectDevice('1');
        });

        expect(result.current.selectedDevice?.id).toBe('1');
        expect(result.current.selectedDevice?.name).toBe('Test Device 1');

        // Deselect device
        act(() => {
          result.current.selectDevice(null);
        });

        expect(result.current.selectedDevice).toBeNull();
      });
    });

    describe('When creating a device', () => {
      it('Then it should call createDevice mutation', async () => {
        const newDevice = {
          id: '3',
          name: 'New Device',
          serialNumber: 'ND-001',
          type: DeviceType.Sensor,
          status: DeviceStatus.Online,
          firmwareVersion: '1.0.0',
          location: 'Lab 3',
          lastSeenAt: '2024-01-03T00:00:00Z',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
          __typename: 'Device',
        };

        const createMock = {
          request: {
            query: CreateDeviceDocument,
            variables: {
              input: {
                name: 'New Device',
                serialNumber: 'ND-001',
                type: DeviceType.Sensor,
                firmwareVersion: '1.0.0',
                location: 'Lab 3',
              },
            },
          },
          result: {
            data: {
              createDevice: newDevice,
            },
          },
        };

        const refetchMock = {
          request: {
            query: GetDevicesDocument,
            variables: {},
          },
          result: {
            data: {
              devices: [...mockDevices, newDevice],
            },
          },
        };

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock, createMock, refetchMock]}>
            {children}
          </MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          await result.current.createDevice({
            name: 'New Device',
            serialNumber: 'ND-001',
            type: DeviceType.Sensor,
            firmwareVersion: '1.0.0',
            location: 'Lab 3',
          });
        });

        expect(result.current.creating).toBe(false);
      });

      it('Then it should validate name using DeviceModel.isValidName', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Test empty name (uses real DeviceModel.isValidName)
        await act(async () => {
          await expect(
            result.current.createDevice({
              name: '',
              serialNumber: 'ND-001',
              type: DeviceType.Sensor,
              firmwareVersion: '1.0.0',
            })
          ).rejects.toThrow('Device name must be between 1 and 100 characters');
        });

        // Test whitespace-only name
        await act(async () => {
          await expect(
            result.current.createDevice({
              name: '   ',
              serialNumber: 'ND-001',
              type: DeviceType.Sensor,
              firmwareVersion: '1.0.0',
            })
          ).rejects.toThrow('Device name must be between 1 and 100 characters');
        });
      });

      it('Then it should validate serial number using DeviceModel.isValidSerialNumber', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Serial number must be at least 3 characters (uses real DeviceModel.isValidSerialNumber)
        await act(async () => {
          await expect(
            result.current.createDevice({
              name: 'Valid Device',
              serialNumber: 'ab',
              type: DeviceType.Sensor,
              firmwareVersion: '1.0.0',
            })
          ).rejects.toThrow('Serial number must be at least 3 characters');
        });
      });

      it('Then it should validate firmware version using DeviceModel.isValidFirmwareVersion', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Invalid firmware version format (uses real DeviceModel.isValidFirmwareVersion)
        await act(async () => {
          await expect(
            result.current.createDevice({
              name: 'Valid Device',
              serialNumber: 'ND-001',
              type: DeviceType.Sensor,
              firmwareVersion: 'invalid',
            })
          ).rejects.toThrow('Invalid firmware version format (e.g., 1.0, 2.1.3, v1.0.0)');
        });
      });

      it('Then it should accept valid firmware versions', async () => {
        // This test verifies the REAL validation accepts various formats
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // These should NOT throw validation errors
        // (they will fail at the GraphQL level since we don't mock those mutations,
        // but the validation should pass)
        const validVersions = ['1.0', '2.1.3', 'v1.0.0', 'v2.3'];

        for (const version of validVersions) {
          try {
            await act(async () => {
              await result.current.createDevice({
                name: 'Valid Device',
                serialNumber: 'ND-001',
                type: DeviceType.Sensor,
                firmwareVersion: version,
              });
            });
          } catch (error: unknown) {
            // Should not be a validation error
            const errorMessage = error instanceof Error ? error.message : String(error);
            expect(errorMessage).not.toContain('Invalid firmware version');
          }
        }
      });
    });

    describe('When updating a device', () => {
      it('Then it should call updateDevice mutation', async () => {
        const updatedDevice = {
          ...mockDevices[0],
          name: 'Updated Device',
          status: DeviceStatus.Offline,
          updatedAt: '2024-01-03T00:00:00Z',
        };

        const updateMock = {
          request: {
            query: UpdateDeviceDocument,
            variables: {
              input: {
                id: '1',
                name: 'Updated Device',
                status: DeviceStatus.Offline,
              },
            },
          },
          result: {
            data: {
              updateDevice: updatedDevice,
            },
          },
        };

        const refetchMock = {
          request: {
            query: GetDevicesDocument,
            variables: {},
          },
          result: {
            data: {
              devices: [updatedDevice, mockDevices[1]],
            },
          },
        };

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock, updateMock, refetchMock]}>
            {children}
          </MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          await result.current.updateDevice({
            id: '1',
            name: 'Updated Device',
            status: DeviceStatus.Offline,
          });
        });

        expect(result.current.updating).toBe(false);
      });

      it('Then it should validate name if provided', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Update with empty name should fail validation
        await act(async () => {
          await expect(
            result.current.updateDevice({
              id: '1',
              name: '',
            })
          ).rejects.toThrow('Device name must be between 1 and 100 characters');
        });
      });
    });

    describe('When deleting a device', () => {
      it('Then it should call deleteDevice mutation', async () => {
        const deleteMock = {
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
        };

        const refetchMock = {
          request: {
            query: GetDevicesDocument,
            variables: {},
          },
          result: {
            data: {
              devices: [mockDevices[1]],
            },
          },
        };

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock, deleteMock, refetchMock]}>
            {children}
          </MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          await result.current.deleteDevice('1');
        });

        expect(result.current.deleting).toBe(false);
      });
    });

    describe('When handling errors', () => {
      it('Then it should capture GraphQL errors', async () => {
        const errorMock = {
          request: {
            query: GetDevicesDocument,
            variables: {},
          },
          error: new Error('Failed to fetch devices'),
        };

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[errorMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toContain('Failed to fetch devices');
      });
    });

    describe('When refetching data', () => {
      it('Then it should refetch devices', async () => {
        const refetchMock = {
          request: {
            query: GetDevicesDocument,
            variables: {},
          },
          result: {
            data: {
              devices: mockDevices,
            },
          },
        };

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock, refetchMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await act(async () => {
          const refetchPromise = result.current.refetch();
          expect(refetchPromise).toBeInstanceOf(Promise);
          await refetchPromise;
        });
      });
    });

    describe('When checking network status', () => {
      it('Then it should expose networkStatus, isPolling, and isRefetching', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(typeof result.current.networkStatus).toBe('number');
        expect(typeof result.current.isPolling).toBe('boolean');
        expect(typeof result.current.isRefetching).toBe('boolean');
      });
    });

    describe('When controlling polling', () => {
      it('Then it should expose startPolling and stopPolling', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(typeof result.current.startPolling).toBe('function');
        expect(typeof result.current.stopPolling).toBe('function');
      });
    });
  });
});
