import { DeviceTableView } from '@/views/DeviceTableView';

export default function Home() {
  return (
    <main className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Device Management</h1>
          <p className='mt-2 text-gray-600 dark:text-gray-400'>
            MVVM Pattern Example with Apollo GraphQL
          </p>
        </div>

        <DeviceTableView />
      </div>
    </main>
  );
}
