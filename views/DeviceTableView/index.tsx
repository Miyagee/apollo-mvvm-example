'use client';
import React from 'react';

import { useDeviceTableViewModel } from '../../viewmodels/DeviceTableViewModel';
import { DeviceForm } from './components/DeviceForm';
import { DeviceTable } from './components/DeviceTable';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { SearchBar } from './components/SearchBar';
import { SnackbarContainer } from './components/Snackbar';

/**
 * DeviceTableView - Stateless View Component
 *
 * This View is completely stateless. All state and actions come from
 * the useDeviceTableViewModel hook. The View only handles:
 * - Rendering the UI based on ViewModel state
 * - Passing user interactions to ViewModel actions
 *
 * @example
 * ```tsx
 * // The View has NO useState - everything comes from the ViewModel
 * function DeviceTableView() {
 *   const vm = useDeviceTableViewModel();
 *   return <div>{vm.devices.map(...)}</div>;
 * }
 * ```
 */
export function DeviceTableView() {
  // Single source of truth - all state and actions from ViewModel
  const vm = useDeviceTableViewModel();

  // Loading state - show skeleton when no cached data
  if (vm.loading && vm.devices.length === 0) {
    return <LoadingState message='Loading devices...' />;
  }

  // Error state - show error when no cached data
  if (vm.error && vm.devices.length === 0) {
    return <ErrorState error={vm.error} onRetry={vm.refetch} />;
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
        {/* Header */}
        <div className='p-6 border-b dark:border-gray-700'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className='flex items-center gap-3'>
              <h1 className='text-2xl font-bold'>Device Management</h1>
              {/* Polling/Refetch indicator */}
              {(vm.isPolling || vm.isRefetching) && (
                <span className='text-xs text-gray-400 animate-pulse' data-testid='sync-indicator'>
                  Syncing...
                </span>
              )}
            </div>
            <button
              onClick={vm.openCreateForm}
              data-testid='add-device-button'
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
              Add Device
            </button>
          </div>

          <SearchBar
            value={vm.searchInputValue}
            isDebouncing={vm.isSearchDebouncing}
            onChange={vm.setSearchInput}
            onClear={vm.clearSearch}
            placeholder='Search devices by name or serial number...'
          />
        </div>

        {/* Table */}
        <DeviceTable
          devices={vm.filteredDevices}
          selectedDevice={vm.selectedDevice}
          onSelectDevice={vm.selectDevice}
          onEditDevice={vm.openEditForm}
          onDeleteDevice={vm.confirmDelete}
          emptyMessage={
            vm.searchTerm
              ? 'No devices found matching your search.'
              : 'No devices found. Add your first device!'
          }
        />

        {/* Footer */}
        <div className='px-6 py-3 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400'>
          Showing {vm.filteredDevices.length} of {vm.devices.length} devices
        </div>
      </div>

      {/* Modals - controlled by ViewModel state */}
      {vm.isFormOpen && (
        <DeviceForm
          formData={vm.formData}
          errors={vm.formErrors}
          touched={vm.formTouched}
          isEditMode={vm.isEditMode}
          isSubmitting={vm.isSubmitting}
          onFieldChange={vm.setFormField}
          onFieldBlur={vm.touchFormField}
          onSubmit={vm.submitForm}
          onCancel={vm.closeForm}
        />
      )}

      {vm.deviceToDelete && (
        <DeleteConfirmModal
          onConfirm={vm.executeDelete}
          onCancel={vm.cancelDelete}
          isDeleting={vm.deleting}
        />
      )}

      {/* Snackbar notifications - controlled by ViewModel state */}
      <SnackbarContainer messages={vm.snackbarMessages} onDismiss={vm.dismissSnackbar} />
    </div>
  );
}
