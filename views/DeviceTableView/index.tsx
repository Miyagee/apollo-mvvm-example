'use client';
import React, { useState } from 'react';

import { CreateDeviceInput, UpdateDeviceInput } from '@/graphql/generated';

import { useDevices } from '../../viewmodels/DeviceViewModel';
import { DeviceModel } from '../../models/Device';
import { DeviceForm } from './components/DeviceForm';
import { DeviceTable } from './components/DeviceTable';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { SearchBar } from './components/SearchBar';

export function DeviceTableView() {
  const {
    devices,
    filteredDevices,
    selectedDevice,
    loading,
    creating,
    updating,
    deleting,
    error,
    searchTerm,
    setSearchInput,
    selectDevice,
    createDevice,
    updateDevice,
    deleteDevice,
    refetch,
  } = useDevices();

  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceModel | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingDevice(null);
    setShowForm(true);
  };

  const handleEdit = (device: DeviceModel) => {
    setEditingDevice(device);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreateDeviceInput | UpdateDeviceInput) => {
    try {
      if ('id' in data) {
        await updateDevice(data);
      } else {
        await createDevice(data);
      }
      // Only close form on success
      setShowForm(false);
      setEditingDevice(null);
    } catch (error) {
      // Keep form open on error
      console.error('Failed to save device:', error);
    }
  };

  const handleDelete = async (deviceId: string) => {
    try {
      await deleteDevice(deviceId);
      // Only close modal on success
      setDeviceToDelete(null);
    } catch (error) {
      // The error is handled by the ViewModel but keep modal open on error
      setDeviceToDelete(null);
      console.error('Failed to delete device:', error);
    }
  };

  if (loading && devices.length === 0) {
    return <LoadingState message='Loading devices...' />;
  }

  if (error && devices.length === 0) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
        {/* Header */}
        <div className='p-6 border-b dark:border-gray-700'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <h1 className='text-2xl font-bold'>Device Management</h1>
            <button
              onClick={handleCreate}
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
            value={searchTerm}
            onChange={setSearchInput}
            placeholder='Search devices by name or serial number...'
          />
        </div>

        {/* Table */}
        <DeviceTable
          devices={filteredDevices}
          selectedDevice={selectedDevice}
          onSelectDevice={selectDevice}
          onEditDevice={handleEdit}
          onDeleteDevice={setDeviceToDelete}
          emptyMessage={
            searchTerm
              ? 'No devices found matching your search.'
              : 'No devices found. Add your first device!'
          }
        />

        {/* Footer */}
        <div className='px-6 py-3 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400'>
          Showing {filteredDevices.length} of {devices.length} devices
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <DeviceForm
          device={editingDevice}
          onSubmit={(data: CreateDeviceInput | UpdateDeviceInput) => handleFormSubmit(data)}
          onCancel={() => {
            setShowForm(false);
            setEditingDevice(null);
          }}
          isSubmitting={creating || updating}
        />
      )}

      {deviceToDelete && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(deviceToDelete)}
          onCancel={() => setDeviceToDelete(null)}
          isDeleting={deleting}
        />
      )}
    </div>
  );
}
