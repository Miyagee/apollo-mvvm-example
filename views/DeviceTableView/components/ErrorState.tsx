import React from 'react';

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className='flex flex-col items-center justify-center h-64 space-y-4'>
      <div className='text-red-500'>Error: {error.message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Retry
        </button>
      )}
    </div>
  );
}
