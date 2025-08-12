import React, { useEffect } from 'react';

import { DeviceType, DeviceStatus } from '@/graphql/generated';
import { DeviceFormValues } from '@/viewmodels/DeviceFormViewModel';

/**
 * Props for the stateless DeviceForm component
 *
 * All state is managed by the ViewModel and passed in via props.
 * The form is completely presentational.
 */
export interface DeviceFormProps {
  /** Current form values */
  formData: DeviceFormValues;
  /** Validation errors for each field */
  errors: Partial<Record<keyof DeviceFormValues, string>>;
  /** Which fields have been touched (blurred) */
  touched: Partial<Record<keyof DeviceFormValues, boolean>>;
  /** Whether form is in edit mode (vs create mode) */
  isEditMode: boolean;
  /** Whether form submission is in progress */
  isSubmitting: boolean;
  /** Callback when a field value changes */
  onFieldChange: <K extends keyof DeviceFormValues>(field: K, value: DeviceFormValues[K]) => void;
  /** Callback when a field is blurred */
  onFieldBlur: (field: keyof DeviceFormValues) => void;
  /** Callback to submit the form */
  onSubmit: () => void;
  /** Callback to cancel/close the form */
  onCancel: () => void;
}

/**
 * DeviceForm - Stateless Form Component
 *
 * This form component has NO internal state. All form state (values, errors,
 * touched fields) comes from props, making it:
 * - Easy to test (just render with props)
 * - Predictable (all state changes come from ViewModel)
 * - Reusable (can be used with different ViewModels)
 *
 * @example
 * ```tsx
 * <DeviceForm
 *   formData={vm.formData}
 *   errors={vm.formErrors}
 *   touched={vm.formTouched}
 *   isEditMode={vm.isEditMode}
 *   isSubmitting={vm.isSubmitting}
 *   onFieldChange={vm.setFormField}
 *   onFieldBlur={vm.touchFormField}
 *   onSubmit={vm.submitForm}
 *   onCancel={vm.closeForm}
 * />
 * ```
 */
export function DeviceForm({
  formData,
  errors,
  touched,
  isEditMode,
  isSubmitting,
  onFieldChange,
  onFieldBlur,
  onSubmit,
  onCancel,
}: DeviceFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Helper to show error only when field is touched
  const getFieldError = (field: keyof DeviceFormValues) => {
    return touched[field] ? errors[field] : undefined;
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div
        className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'
        data-testid='device-form'
      >
        <h2 className='text-xl font-semibold mb-4'>
          {isEditMode ? 'Edit Device' : 'Add New Device'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <FormField label='Name' error={getFieldError('name')} required>
            <input
              type='text'
              value={formData.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              onBlur={() => onFieldBlur('name')}
              data-testid='device-name-input'
              className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
            />
          </FormField>

          {!isEditMode && (
            <FormField label='Serial Number' error={getFieldError('serialNumber')} required>
              <input
                type='text'
                value={formData.serialNumber}
                onChange={(e) => onFieldChange('serialNumber', e.target.value)}
                onBlur={() => onFieldBlur('serialNumber')}
                data-testid='serial-number-input'
                className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
                placeholder='XX-000-XXX'
              />
            </FormField>
          )}

          {!isEditMode && (
            <FormField label='Type'>
              <select
                value={formData.type}
                onChange={(e) => onFieldChange('type', e.target.value as DeviceType)}
                onBlur={() => onFieldBlur('type')}
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
              onChange={(e) => onFieldChange('status', e.target.value as DeviceStatus)}
              onBlur={() => onFieldBlur('status')}
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

          <FormField label='Firmware Version' error={getFieldError('firmwareVersion')} required>
            <input
              type='text'
              value={formData.firmwareVersion}
              onChange={(e) => onFieldChange('firmwareVersion', e.target.value)}
              onBlur={() => onFieldBlur('firmwareVersion')}
              data-testid='firmware-version-input'
              className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              placeholder='1.0.0'
            />
          </FormField>

          <FormField label='Location (Optional)'>
            <input
              type='text'
              value={formData.location}
              onChange={(e) => onFieldChange('location', e.target.value)}
              onBlur={() => onFieldBlur('location')}
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
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
