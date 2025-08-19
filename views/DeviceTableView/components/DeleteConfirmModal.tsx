import React from 'react';

export interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmModal({ onConfirm, onCancel, isDeleting }: DeleteConfirmModalProps) {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full'>
        <h3 className='text-lg font-semibold mb-4'>Confirm Delete</h3>
        <p className='text-gray-600 dark:text-gray-400 mb-6'>
          Are you sure you want to delete this device? This action cannot be undone.
        </p>
        <div className='flex gap-3'>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className='flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50'
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className='flex-1 bg-gray-300 dark:bg-gray-600 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
