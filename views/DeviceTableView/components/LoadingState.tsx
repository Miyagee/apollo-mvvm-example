import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className='flex items-center justify-center h-64'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        <div className='text-lg text-gray-600 dark:text-gray-400'>{message}</div>
      </div>
    </div>
  );
}
