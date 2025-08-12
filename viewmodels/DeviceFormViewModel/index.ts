import { useEffect, useCallback } from 'react';

import {
  DeviceType,
  DeviceStatus,
  CreateDeviceInput,
  UpdateDeviceInput,
} from '@/graphql/generated';
import { DeviceModel } from '@/models/Device';
import { useForm, UseFormResult } from '../shared/useForm';

/**
 * Form values for device creation/editing
 */
export interface DeviceFormValues {
  name: string;
  serialNumber: string;
  type: DeviceType;
  status: DeviceStatus;
  firmwareVersion: string;
  location: string;
}

/**
 * Options for useDeviceForm hook
 */
export interface UseDeviceFormOptions {
  /** Device to edit (null for create mode) */
  device?: DeviceModel | null;
  /** Callback when form is submitted successfully */
  onSubmit: (data: CreateDeviceInput | UpdateDeviceInput) => Promise<void>;
  /** Callback after successful submission */
  onSuccess?: () => void;
}

/**
 * Return type for useDeviceForm hook
 */
export interface UseDeviceFormResult extends Omit<UseFormResult<DeviceFormValues>, 'handleSubmit'> {
  /** Whether form is in edit mode (vs create mode) */
  isEditMode: boolean;
  /** Handle form submission with device-specific logic */
  handleSubmit: () => Promise<void>;
  /** Get CreateDeviceInput from current form values */
  getCreateInput: () => CreateDeviceInput;
  /** Get UpdateDeviceInput from current form values (requires device) */
  getUpdateInput: () => UpdateDeviceInput;
}

/**
 * Default values for a new device form
 */
const getDefaultValues = (): DeviceFormValues => ({
  name: '',
  serialNumber: '',
  type: DeviceType.Sensor,
  status: DeviceStatus.Online,
  firmwareVersion: '',
  location: '',
});

/**
 * Get initial values from a device or defaults
 */
const getInitialValues = (device?: DeviceModel | null): DeviceFormValues => {
  if (!device) return getDefaultValues();

  return {
    name: device.name,
    serialNumber: device.serialNumber,
    type: device.type,
    status: device.status,
    firmwareVersion: device.firmwareVersion,
    location: device.location ?? '',
  };
};

/**
 * Device-specific form ViewModel
 *
 * Composes the generic useForm hook with device-specific:
 * - Validation rules using DeviceModel static methods
 * - Create/Update input transformation
 * - Edit mode detection
 *
 * @example
 * ```typescript
 * const form = useDeviceForm({
 *   device: editingDevice,
 *   onSubmit: async (input) => {
 *     if ('id' in input) await updateDevice(input);
 *     else await createDevice(input);
 *   },
 *   onSuccess: () => closeForm(),
 * });
 * ```
 */
export function useDeviceForm({
  device,
  onSubmit,
  onSuccess,
}: UseDeviceFormOptions): UseDeviceFormResult {
  const isEditMode = !!device;

  const form = useForm<DeviceFormValues>({
    initialValues: getInitialValues(device),
    validationRules: {
      name: (value) => {
        if (!value.trim()) return 'Name is required';
        if (!DeviceModel.isValidName(value)) return 'Name must be between 1 and 100 characters';
        return null;
      },
      serialNumber: (value) => {
        // Skip serial number validation in edit mode (can't change it)
        if (isEditMode) return null;
        if (!value.trim()) return 'Serial number is required';
        if (!DeviceModel.isValidSerialNumber(value)) return 'Serial number must be at least 3 characters';
        return null;
      },
      type: (value) => {
        // Skip type validation in edit mode (can't change it)
        if (isEditMode) return null;
        if (!value) return 'Type is required';
        return null;
      },
      firmwareVersion: (value) => {
        if (!value.trim()) return 'Firmware version is required';
        if (!DeviceModel.isValidFirmwareVersion(value)) return 'Invalid version format (e.g., 1.0, 2.1.3, v1.0.0)';
        return null;
      },
      // location is optional, no validation needed
    },
  });

  // Reset form when device changes
  useEffect(() => {
    form.reset(getInitialValues(device));
  }, [device?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Build CreateDeviceInput from form values
   */
  const getCreateInput = useCallback((): CreateDeviceInput => ({
    name: form.values.name.trim(),
    serialNumber: form.values.serialNumber.trim(),
    type: form.values.type,
    firmwareVersion: form.values.firmwareVersion.trim(),
    location: form.values.location.trim() || null,
  }), [form.values]);

  /**
   * Build UpdateDeviceInput from form values
   */
  const getUpdateInput = useCallback((): UpdateDeviceInput => {
    if (!device) throw new Error('Cannot get update input without a device');

    return {
      id: device.id,
      name: form.values.name.trim(),
      status: form.values.status,
      firmwareVersion: form.values.firmwareVersion.trim(),
      location: form.values.location.trim() || null,
    };
  }, [device, form.values]);

  /**
   * Handle form submission with device-specific transformation
   */
  const handleSubmit = useCallback(async () => {
    // Mark all fields as touched first
    Object.keys(form.values).forEach((field) => {
      form.touchField(field as keyof DeviceFormValues);
    });

    // Validate
    if (!form.validate()) return;

    // Build the appropriate input
    const input = isEditMode ? getUpdateInput() : getCreateInput();

    // Submit
    try {
      await onSubmit(input);
      onSuccess?.();
    } catch (error) {
      // Re-throw to let caller handle
      throw error;
    }
  }, [form, isEditMode, getCreateInput, getUpdateInput, onSubmit, onSuccess]);

  return {
    ...form,
    isEditMode,
    handleSubmit,
    getCreateInput,
    getUpdateInput,
  };
}
