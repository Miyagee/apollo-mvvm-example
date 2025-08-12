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

// Mock the DeviceModel
jest.mock('@/models/Device', () => ({
  DeviceModel: jest.fn().mockImplementation((device) => ({
    ...device,
    matchesSearch: jest.fn(
      (searchTerm) =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.location?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })),
}));

// Import DeviceModel after mocking
import { DeviceModel } from '@/models/Device';

// Mock the static validation methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(DeviceModel as any).isValidName = jest.fn(
  (name: string) => name && name.length >= 1 && name.length <= 100
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(DeviceModel as any).isValidSerialNumber = jest.fn(
  (serialNumber: string) => serialNumber && serialNumber.length >= 3
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(DeviceModel as any).isValidFirmwareVersion = jest.fn(
  (version: string) => /^\d+\.\d+(\.\d+)?$/.test(version) || /^v\d+\.\d+(\.\d+)?$/.test(version)
);

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
    });

    describe('When searching devices', () => {
      it('Then it should filter devices by search term', async () => {
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

      it('Then it should validate input before creating', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <MockedProvider mocks={[baseGetDevicesMock]}>{children}</MockedProvider>
        );

        const { result } = renderHook(() => useDevices(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        // Test invalid name
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

        // Test invalid serial number
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

        // Test invalid firmware version
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
  });
});
