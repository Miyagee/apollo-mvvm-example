import React, { useState, useEffect } from 'react';

import {
  DeviceType,
  DeviceStatus,
  CreateDeviceInput,
  UpdateDeviceInput,
} from '@/graphql/generated';
import { DeviceModel } from '@/models/Device';

export interface DeviceFormProps {
  device?: DeviceModel | null;
  onSubmit: (data: CreateDeviceInput | UpdateDeviceInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function DeviceForm({ device, onSubmit, onCancel, isSubmitting }: DeviceFormProps) {
  const [formData, setFormData] = useState({
    name: device?.name || '',
    serialNumber: device?.serialNumber || '',
    type: device?.type || DeviceType.Sensor,
    status: device?.status || DeviceStatus.Online,
    firmwareVersion: device?.firmwareVersion || '',
    location: device?.location || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onCancel]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!DeviceModel.isValidName(formData.name)) {
      newErrors.name = 'Name must be between 1 and 100 characters';
    }

    if (!device) {
      if (!formData.serialNumber.trim()) {
        newErrors.serialNumber = 'Serial number is required';
      } else if (!DeviceModel.isValidSerialNumber(formData.serialNumber)) {
        newErrors.serialNumber = 'Serial number must be at least 3 characters';
      }

      if (!formData.type) {
        newErrors.type = 'Type is required';
      }
    }

    if (!formData.firmwareVersion.trim()) {
      newErrors.firmwareVersion = 'Firmware version is required';
    } else if (!DeviceModel.isValidFirmwareVersion(formData.firmwareVersion)) {
      newErrors.firmwareVersion = 'Invalid version format (e.g., 1.0, 2.1.3, v1.0.0)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (device) {
        const updateData: UpdateDeviceInput = {
          id: device.id,
          name: formData.name,
          status: formData.status,
          firmwareVersion: formData.firmwareVersion,
          location: formData.location || null,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateDeviceInput = {
          name: formData.name,
          serialNumber: formData.serialNumber,
          type: formData.type,
          firmwareVersion: formData.firmwareVersion,
          location: formData.location || null,
        };
        await onSubmit(createData);
      }
      // Success - the parent's handleFormSubmit will close the form
      // No need to call onCancel here as parent handles it
    } catch (error) {
      // Handle error appropriately - form stays open
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div
        className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'
        data-testid='device-form'
      >
        <h2 className='text-xl font-semibold mb-4'>{device ? 'Edit Device' : 'Add New Device'}</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <FormField label='Name' error={errors.name} required>
            <input
              type='text'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid='device-name-input'
              className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
            />
          </FormField>

          {!device && (
            <FormField label='Serial Number' error={errors.serialNumber} required>
              <input
                type='text'
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                data-testid='serial-number-input'
                className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='XX-000-XXX'
              />
            </FormField>
          )}

          {!device && (
            <FormField label='Type'>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DeviceType })}
                data-testid='device-type-select'
                className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              >
                {Object.values(DeviceType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <FormField label='Status'>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as DeviceStatus })}
              data-testid='device-status-select'
              className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
            >
              {Object.values(DeviceStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label='Firmware Version' error={errors.firmwareVersion} required>
            <input
              type='text'
              value={formData.firmwareVersion}
              onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
              data-testid='firmware-version-input'
              className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              placeholder='1.0.0'
            />
          </FormField>

          <FormField label='Location (Optional)'>
            <input
              type='text'
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              data-testid='location-input'
              className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
            />
          </FormField>

          <div className='flex gap-3 pt-4'>
            <button
              type='submit'
              disabled={isSubmitting}
              data-testid='submit-button'
              className='flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'Saving...' : device ? 'Update' : 'Create'}
            </button>
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              data-testid='cancel-button'
              className='flex-1 bg-gray-300 dark:bg-gray-600 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 disabled:opacity-50'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div>
      <label className='block text-sm font-medium mb-1'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      {children}
      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </div>
  );
}
