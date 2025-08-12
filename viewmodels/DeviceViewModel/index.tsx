import { useState, useCallback } from 'react';
import { NetworkStatus } from '@apollo/client';

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

/** Default polling interval in milliseconds (10 seconds) */
const DEFAULT_POLL_INTERVAL = 10000;

export interface UseDevicesResult {
  // Data
  devices: DeviceModel[];
  selectedDevice: DeviceModel | null;

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // Network status (from Apollo)
  networkStatus: NetworkStatus;
  /** Whether a polling request is currently in flight */
  isPolling: boolean;
  /** Whether a refetch request is currently in flight */
  isRefetching: boolean;

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

  // Polling controls
  startPolling: (interval?: number) => void;
  stopPolling: () => void;
}

export function useDevices(): UseDevicesResult {
  // Local state
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // GraphQL queries with cache-and-network for optimal UX
  const {
    data,
    loading,
    error,
    refetch,
    networkStatus,
    startPolling: apolloStartPolling,
    stopPolling,
  } = useGetDevicesQuery({
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
    pollInterval: DEFAULT_POLL_INTERVAL,
  });

  // Derived network states from Apollo's networkStatus
  const isPolling = networkStatus === NetworkStatus.poll;
  const isRefetching = networkStatus === NetworkStatus.refetch;

  // Wrapper for startPolling with default interval
  const startPolling = useCallback(
    (interval: number = DEFAULT_POLL_INTERVAL) => {
      apolloStartPolling(interval);
    },
    [apolloStartPolling]
  );

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

        await createDeviceMutation({
          variables: { input },
          refetchQueries: [{ query: GetDevicesDocument }],
        });
      } catch (error) {
        throw error;
      }
    },
    [createDeviceMutation]
  );

  const updateDevice = useCallback(
    async (input: UpdateDeviceInput) => {
      try {
        // Validate input if name is being updated (check for undefined/null to allow updating other fields)
        if (input.name !== undefined && input.name !== null && !DeviceModel.isValidName(input.name)) {
          throw new Error('Device name must be between 1 and 100 characters');
        }

        // Validate firmware version if being updated
        if (input.firmwareVersion && !DeviceModel.isValidFirmwareVersion(input.firmwareVersion)) {
          throw new Error('Invalid firmware version format (e.g., 1.0, 2.1.3, v1.0.0)');
        }

        await updateDeviceMutation({
          variables: { input },
          refetchQueries: [{ query: GetDevicesDocument }],
        });
      } catch (error) {
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

        // Clear selection if deleted device was selected
        if (selectedDeviceId === deviceId) {
          setSelectedDeviceId(null);
        }
      } catch (error) {
        throw error;
      }
    },
    [deleteDeviceMutation, selectedDeviceId]
  );

  const handleRefetch = useCallback(async () => {
    await refetch();
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

    // Network status
    networkStatus,
    isPolling,
    isRefetching,

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

    // Polling controls
    startPolling,
    stopPolling,
  };
}
