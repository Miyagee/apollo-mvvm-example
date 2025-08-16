import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GetDevicesDocument,
  CreateDeviceDocument,
  UpdateDeviceDocument,
  DeleteDeviceDocument,
  CreateDeviceInput,
  UpdateDeviceInput,
  Device,
} from '../graphql/generated';
import { DeviceModel } from '../models/Device';

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
  setSearchTerm: (term: string) => void;
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
  const { data, loading, error, refetch } = useQuery(GetDevicesDocument, {
    errorPolicy: 'all',
  });

  // GraphQL mutations
  const [createDeviceMutation, { loading: creating }] = useMutation(CreateDeviceDocument);
  const [updateDeviceMutation, { loading: updating }] = useMutation(UpdateDeviceDocument);
  const [deleteDeviceMutation, { loading: deleting }] = useMutation(DeleteDeviceDocument);

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
          throw new Error('Device name must be between 3 and 50 characters');
        }
        if (!DeviceModel.isValidSerialNumber(input.serialNumber)) {
          throw new Error('Invalid serial number format (expected: XX-000-XXX)');
        }
        if (!DeviceModel.isValidFirmwareVersion(input.firmwareVersion)) {
          throw new Error('Invalid firmware version format (expected: X.Y.Z)');
        }

        await createDeviceMutation({
          variables: { input },
          refetchQueries: [{ query: GetDevicesDocument }],
        });
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
          throw new Error('Device name must be between 3 and 50 characters');
        }

        // Validate firmware version if being updated
        if (input.firmwareVersion && !DeviceModel.isValidFirmwareVersion(input.firmwareVersion)) {
          throw new Error('Invalid firmware version format (expected: X.Y.Z)');
        }

        await updateDeviceMutation({
          variables: { input },
          refetchQueries: [{ query: GetDevicesDocument }],
        });
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
        await deleteDeviceMutation({
          variables: { id: deviceId },
          refetchQueries: [{ query: GetDevicesDocument }],
          update: (cache) => {
            // Remove device from cache
            cache.evict({ id: `Device:${deviceId}` });
            cache.gc();
          },
        });

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
    setSearchTerm,
    filteredDevices,

    // Actions
    selectDevice,
    createDevice,
    updateDevice,
    deleteDevice,
    refetch: handleRefetch,
  };
}
