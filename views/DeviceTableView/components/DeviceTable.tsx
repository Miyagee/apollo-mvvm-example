import React from 'react';

import { DeviceModel } from '@/models/Device';

import { StatusBadge } from './StatusBadge';

interface DeviceTableProps {
  devices: DeviceModel[];
  selectedDevice: DeviceModel | null;
  onSelectDevice: (deviceId: string | null) => void;
  onEditDevice: (device: DeviceModel) => void;
  onDeleteDevice: (deviceId: string) => void;
  emptyMessage: string;
}

export function DeviceTable({
  devices,
  selectedDevice,
  onSelectDevice,
  onEditDevice,
  onDeleteDevice,
  emptyMessage,
}: DeviceTableProps) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead>
          <tr className='border-b dark:border-gray-700'>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Name
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Serial Number
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Type
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Status
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Firmware
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Location
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Last Seen
            </th>
            <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='divide-y dark:divide-gray-700'>
          {devices.length === 0 ? (
            <tr>
              <td colSpan={8} className='px-6 py-4 text-center text-gray-500'>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            devices.map((device) => (
              <tr
                key={device.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  selectedDevice?.id === device.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => onSelectDevice(device.id)}
              >
                <td className='px-6 py-4 whitespace-nowrap font-medium'>{device.name}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm'>{device.serialNumber}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm'>{device.type}</td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <StatusBadge status={device.status} />
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm'>{device.firmwareVersion}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm'>{device.location || '-'}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm'>
                  {device.lastSeenAt ? device.lastSeenFormatted : 'Never'}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDevice(device);
                    }}
                    className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3'
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDevice(device.id);
                    }}
                    className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
