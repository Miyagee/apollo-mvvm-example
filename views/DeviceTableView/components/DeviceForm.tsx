import React, { useState } from 'react';

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!DeviceModel.isValidName(formData.name)) {
      newErrors.name = 'Name must be between 3 and 50 characters';
    }

    if (!device && !DeviceModel.isValidSerialNumber(formData.serialNumber)) {
      newErrors.serialNumber = 'Format: XX-000-XXX (e.g., TS-001-A)';
    }

    if (!DeviceModel.isValidFirmwareVersion(formData.firmwareVersion)) {
      newErrors.firmwareVersion = 'Format: X.Y.Z (e.g., 1.0.0)';
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
      onCancel();
    } catch (error) {
      // Handle error appropriately
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
        <h2 className='text-xl font-semibold mb-4'>{device ? 'Edit Device' : 'Add New Device'}</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <FormField label='Name' error={errors.name} required>
            <input
              type='text'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
            />
          </FormField>

          {!device && (
            <FormField label='Serial Number' error={errors.serialNumber} required>
              <input
                type='text'
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
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

          {device && (
            <FormField label='Status'>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as DeviceStatus })
                }
                className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              >
                {Object.values(DeviceStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <FormField label='Firmware Version' error={errors.firmwareVersion} required>
            <input
              type='text'
              value={formData.firmwareVersion}
              onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
              className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              placeholder='1.0.0'
            />
          </FormField>

          <FormField label='Location (Optional)'>
            <input
              type='text'
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
            />
          </FormField>

          <div className='flex gap-3 pt-4'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'Saving...' : device ? 'Update' : 'Create'}
            </button>
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
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
