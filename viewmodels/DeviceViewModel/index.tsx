import { useState, useCallback } from 'react';

import {
  GetDevicesDocument,
  CreateDeviceInput,
  UpdateDeviceInput,
  Device,
  useGetDevicesQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
} from '@/graphql/generated';
import { DeviceModel } from '@/models/Device';

export interface UseDevicesResult {
  // Data
  devices: DeviceModel[];
  selectedDevice: DeviceModel | null;

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // Error states
  error: Error | null;

  // Search
  searchTerm: string;
  setSearchInput: (input: string) => void;
  filteredDevices: DeviceModel[];

  // Actions
  selectDevice: (deviceId: string | null) => void;
  createDevice: (input: CreateDeviceInput) => Promise<void>;
  updateDevice: (input: UpdateDeviceInput) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useDevices(): UseDevicesResult {
  // Local state
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // GraphQL queries
  const { data, loading, error, refetch } = useGetDevicesQuery({
    errorPolicy: 'all',
  });

  // GraphQL mutations
  const [createDeviceMutation, { loading: creating }] = useCreateDeviceMutation();
  const [updateDeviceMutation, { loading: updating }] = useUpdateDeviceMutation();
  const [deleteDeviceMutation, { loading: deleting }] = useDeleteDeviceMutation();

  // Transform raw devices to DeviceModel instances
  const devices = (data?.devices || []).map((device: Device) => new DeviceModel(device));

  // Get selected device
  const selectedDevice = selectedDeviceId
    ? devices.find((device: DeviceModel) => device.id === selectedDeviceId) || null
    : null;

  // Filter devices based on search term
  const filteredDevices = searchTerm
    ? devices.filter((device: DeviceModel) => device.matchesSearch(searchTerm))
    : devices;

  // Actions
  const selectDevice = useCallback((deviceId: string | null) => {
    setSelectedDeviceId(deviceId);
  }, []);

  const createDevice = useCallback(
    async (input: CreateDeviceInput) => {
      try {
        // Validate input
        if (!DeviceModel.isValidName(input.name)) {
          throw new Error('Device name must be between 1 and 100 characters');
        }
        if (!DeviceModel.isValidSerialNumber(input.serialNumber)) {
          throw new Error('Serial number must be at least 3 characters');
        }
        if (!DeviceModel.isValidFirmwareVersion(input.firmwareVersion)) {
          throw new Error('Invalid firmware version format (e.g., 1.0, 2.1.3, v1.0.0)');
        }

        const result = await createDeviceMutation({
          variables: { input },
          refetchQueries: [{ query: GetDevicesDocument }],
        });
        console.log('Device created successfully:', result.data?.createDevice);
      } catch (error) {
        console.error('Failed to create device:', error);
        throw error;
      }
    },
    [createDeviceMutation]
  );

  const updateDevice = useCallback(
    async (input: UpdateDeviceInput) => {
      try {
        // Validate input if name is being updated
        if (input.name && !DeviceModel.isValidName(input.name)) {
          throw new Error('Device name must be between 1 and 100 characters');
        }

        // Validate firmware version if being updated
        if (input.firmwareVersion && !DeviceModel.isValidFirmwareVersion(input.firmwareVersion)) {
          throw new Error('Invalid firmware version format (e.g., 1.0, 2.1.3, v1.0.0)');
        }

        const result = await updateDeviceMutation({
          variables: { input },
          refetchQueries: [{ query: GetDevicesDocument }],
        });
        console.log('Device updated successfully:', result.data?.updateDevice);
      } catch (error) {
        console.error('Failed to update device:', error);
        throw error;
      }
    },
    [updateDeviceMutation]
  );

  const deleteDevice = useCallback(
    async (deviceId: string) => {
      try {
        const result = await deleteDeviceMutation({
          variables: { id: deviceId },
          refetchQueries: [{ query: GetDevicesDocument }],
          awaitRefetchQueries: true, // Wait for refetch to complete
        });

        if (!result.data?.deleteDevice) {
          throw new Error('Failed to delete device');
        }

        console.log('Device deleted successfully:', deviceId);

        // Clear selection if deleted device was selected
        if (selectedDeviceId === deviceId) {
          setSelectedDeviceId(null);
        }
      } catch (error) {
        console.error('Failed to delete device:', error);
        throw error;
      }
    },
    [deleteDeviceMutation, selectedDeviceId]
  );

  const handleRefetch = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refetch devices:', error);
      throw error;
    }
  }, [refetch]);

  return {
    // Data
    devices,
    selectedDevice,

    // Loading states
    loading,
    creating,
    updating,
    deleting,

    // Error states
    error: error || null,

    // Search
    searchTerm,
    setSearchInput: setSearchTerm,
    filteredDevices,

    // Actions
    selectDevice,
    createDevice,
    updateDevice,
    deleteDevice,
    refetch: handleRefetch,
  };
}
