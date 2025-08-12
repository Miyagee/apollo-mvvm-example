import { useState, useCallback, useEffect } from 'react';
import { NetworkStatus } from '@apollo/client';

import { DeviceModel } from '@/models/Device';
import { CreateDeviceInput, UpdateDeviceInput } from '@/graphql/generated';
import { useDevices } from '../DeviceViewModel';
import { useDeviceForm, DeviceFormValues } from '../DeviceFormViewModel';
import { useSearchInput } from '../shared/useSearchInput';
import { useSnackbar, SnackbarMessage } from '../shared/useSnackbar';

/**
 * Return type for useDeviceTableViewModel hook
 *
 * This is the single source of truth for the DeviceTableView.
 * Views should be completely stateless and receive all state/actions from here.
 */
export interface UseDeviceTableViewModelResult {
  // === Data (from useDevices) ===
  devices: DeviceModel[];
  filteredDevices: DeviceModel[];
  selectedDevice: DeviceModel | null;

  // === Loading states ===
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // === Network status ===
  networkStatus: NetworkStatus;
  isPolling: boolean;
  isRefetching: boolean;

  // === Error states ===
  error: Error | null;

  // === Search ===
  /** Current search input value (updates immediately as user types) */
  searchInputValue: string;
  /** Debounced search term (used for filtering) */
  searchTerm: string;
  /** Whether search is being debounced */
  isSearchDebouncing: boolean;
  /** Set search input value */
  setSearchInput: (input: string) => void;
  /** Clear search input */
  clearSearch: () => void;

  // === Selection ===
  selectDevice: (deviceId: string | null) => void;

  // === Form state ===
  isFormOpen: boolean;
  editingDevice: DeviceModel | null;
  formData: DeviceFormValues;
  formErrors: Partial<Record<keyof DeviceFormValues, string>>;
  formTouched: Partial<Record<keyof DeviceFormValues, boolean>>;
  isSubmitting: boolean;
  isEditMode: boolean;

  // === Form actions ===
  setFormField: <K extends keyof DeviceFormValues>(field: K, value: DeviceFormValues[K]) => void;
  touchFormField: (field: keyof DeviceFormValues) => void;
  submitForm: () => Promise<void>;
  openCreateForm: () => void;
  openEditForm: (device: DeviceModel) => void;
  closeForm: () => void;

  // === Delete state & actions ===
  deviceToDelete: string | null;
  confirmDelete: (deviceId: string) => void;
  cancelDelete: () => void;
  executeDelete: () => Promise<void>;

  // === Polling controls ===
  startPolling: (interval?: number) => void;
  stopPolling: () => void;

  // === Refetch ===
  refetch: () => Promise<void>;

  // === Snackbar ===
  snackbarMessages: SnackbarMessage[];
  dismissSnackbar: (id: string) => void;
}

/**
 * Coordinating ViewModel for the DeviceTableView
 *
 * This hook composes:
 * - useDevices() for data operations (GraphQL queries/mutations)
 * - useDeviceForm() for form state management
 * - Local UI state (modal visibility, delete confirmation)
 *
 * The View layer should be completely stateless - all state comes from here.
 *
 * @example
 * ```tsx
 * function DeviceTableView() {
 *   const vm = useDeviceTableViewModel();
 *
 *   // No useState in the View - everything from ViewModel
 *   return (
 *     <div>
 *       <DeviceTable devices={vm.filteredDevices} onEdit={vm.openEditForm} />
 *       {vm.isFormOpen && <DeviceForm formData={vm.formData} ... />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDeviceTableViewModel(): UseDeviceTableViewModelResult {
  // === Compose Data ViewModel ===
  const dataVM = useDevices();

  // === Compose Snackbar ViewModel ===
  const snackbar = useSnackbar();

  // === Compose Search ViewModel (with debouncing) ===
  const searchVM = useSearchInput({
    debounceMs: 300,
    onDebouncedChange: dataVM.setSearchInput,
  });

  // === UI State ===
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceModel | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  // === Compose Form ViewModel ===
  const handleFormSubmit = useCallback(
    async (input: CreateDeviceInput | UpdateDeviceInput) => {
      if ('id' in input) {
        await dataVM.updateDevice(input);
      } else {
        await dataVM.createDevice(input);
      }
    },
    [dataVM]
  );

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setEditingDevice(null);
    snackbar.showSuccess(editingDevice ? 'Device updated successfully' : 'Device created successfully');
  }, [editingDevice, snackbar]);

  const formVM = useDeviceForm({
    device: editingDevice,
    onSubmit: handleFormSubmit,
    onSuccess: handleFormSuccess,
  });

  // Wrap submitForm to show error snackbar on failure
  const submitFormWithSnackbar = useCallback(async () => {
    try {
      await formVM.handleSubmit();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      snackbar.showError(message);
    }
  }, [formVM, snackbar]);

  // === Form Actions ===
  const openCreateForm = useCallback(() => {
    setEditingDevice(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((device: DeviceModel) => {
    setEditingDevice(device);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingDevice(null);
  }, []);

  // Reset form when editingDevice changes
  useEffect(() => {
    if (isFormOpen) {
      formVM.reset();
    }
  }, [editingDevice?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Delete Actions ===
  const confirmDelete = useCallback((deviceId: string) => {
    setDeviceToDelete(deviceId);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeviceToDelete(null);
  }, []);

  const executeDelete = useCallback(async () => {
    if (!deviceToDelete) return;

    try {
      await dataVM.deleteDevice(deviceToDelete);
      setDeviceToDelete(null);
      snackbar.showSuccess('Device deleted successfully');
    } catch (error) {
      snackbar.showError('Failed to delete device');
      throw error;
    }
  }, [deviceToDelete, dataVM, snackbar]);

  // === Return unified interface ===
  return {
    // Data
    devices: dataVM.devices,
    filteredDevices: dataVM.filteredDevices,
    selectedDevice: dataVM.selectedDevice,

    // Loading states
    loading: dataVM.loading,
    creating: dataVM.creating,
    updating: dataVM.updating,
    deleting: dataVM.deleting,

    // Network status
    networkStatus: dataVM.networkStatus,
    isPolling: dataVM.isPolling,
    isRefetching: dataVM.isRefetching,

    // Error states
    error: dataVM.error,

    // Search (debounced via searchVM)
    searchInputValue: searchVM.inputValue,
    searchTerm: dataVM.searchTerm,
    isSearchDebouncing: searchVM.isDebouncing,
    setSearchInput: searchVM.setInputValue,
    clearSearch: searchVM.clear,

    // Selection
    selectDevice: dataVM.selectDevice,

    // Form state
    isFormOpen,
    editingDevice,
    formData: formVM.values,
    formErrors: formVM.errors,
    formTouched: formVM.touched,
    isSubmitting: formVM.isSubmitting,
    isEditMode: formVM.isEditMode,

    // Form actions
    setFormField: formVM.setField,
    touchFormField: formVM.touchField,
    submitForm: submitFormWithSnackbar,
    openCreateForm,
    openEditForm,
    closeForm,

    // Delete state & actions
    deviceToDelete,
    confirmDelete,
    cancelDelete,
    executeDelete,

    // Polling controls
    startPolling: dataVM.startPolling,
    stopPolling: dataVM.stopPolling,

    // Refetch
    refetch: dataVM.refetch,

    // Snackbar
    snackbarMessages: snackbar.messages,
    dismissSnackbar: snackbar.dismiss,
  };
}
