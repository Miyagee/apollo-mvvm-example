import { deviceQueries } from './device';
import { deviceStore } from '../../data/deviceStore';
import { DeviceStatus } from '@/graphql/generated';

// Mock the deviceStore module
jest.mock('../../data/deviceStore', () => ({
  deviceStore: {
    getAll: jest.fn(),
    getById: jest.fn(),
    search: jest.fn(),
  },
}));

describe('Device Queries', () => {
  const mockDevices = [
    {
      id: '1',
      name: 'Test Device 1',
      serialNumber: 'TD-001',
      type: 'SENSOR',
      status: DeviceStatus.Online,
      firmwareVersion: '1.0.0',
      location: 'Lab 1',
      lastSeenAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Test Device 2',
      serialNumber: 'TD-002',
      type: 'GATEWAY',
      status: DeviceStatus.Offline,
      firmwareVersion: '2.0.0',
      location: 'Lab 2',
      lastSeenAt: '2024-01-02T00:00:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Given a devices query resolver', () => {
    describe('When querying all devices', () => {
      it('Then it should return all devices from the store', () => {
        (deviceStore.getAll as jest.Mock).mockReturnValue(mockDevices);

        const result = deviceQueries.devices();

        expect(result).toEqual(mockDevices);
        expect(deviceStore.getAll).toHaveBeenCalled();
      });
    });
  });

  describe('Given a device query resolver', () => {
    describe('When querying a device by ID', () => {
      it('Then it should return the device if found', () => {
        const mockDevice = mockDevices[0];
        (deviceStore.getById as jest.Mock).mockReturnValue(mockDevice);

        const result = deviceQueries.device(null, { id: mockDevice.id });

        expect(result).toEqual(mockDevice);
        expect(deviceStore.getById).toHaveBeenCalledWith(mockDevice.id);
      });

      it('Then it should throw an error if device not found', () => {
        (deviceStore.getById as jest.Mock).mockReturnValue(undefined);

        expect(() => {
          deviceQueries.device(null, { id: 'non-existent' });
        }).toThrow('Device not found');
      });
    });
  });
});