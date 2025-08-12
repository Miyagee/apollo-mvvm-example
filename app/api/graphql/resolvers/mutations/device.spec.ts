import { deviceMutations } from './device';
import { deviceStore } from '../../data/deviceStore';
import { DeviceStatus, DeviceType, CreateDeviceInput, UpdateDeviceInput } from '@/graphql/generated';
import { validateDevice } from '../../validators/deviceValidator';

// Mock the dependencies
jest.mock('../../data/deviceStore', () => ({
  deviceStore: {
    existsBySerialNumber: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    exists: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../validators/deviceValidator', () => ({
  validateDevice: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('Device Mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Given a createDevice mutation', () => {
    describe('When creating a valid device', () => {
      it('Then it should create and return the new device', () => {
        const input: CreateDeviceInput = {
          name: 'New Device',
          serialNumber: 'ND-001',
          type: DeviceType.Sensor,
          firmwareVersion: '1.0.0',
          location: 'Lab 1',
        };

        const expectedDevice = {
          id: 'mocked-uuid',
          name: input.name,
          serialNumber: input.serialNumber,
          type: input.type,
          status: DeviceStatus.Online,
          lastSeenAt: expect.any(String),
          firmwareVersion: input.firmwareVersion,
          location: input.location,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        };

        (validateDevice.create as jest.Mock).mockReturnValue({ isValid: true });
        (deviceStore.existsBySerialNumber as jest.Mock).mockReturnValue(false);
        (deviceStore.create as jest.Mock).mockReturnValue(expectedDevice);

        const result = deviceMutations.createDevice(null, { input });

        expect(validateDevice.create).toHaveBeenCalledWith(input);
        expect(deviceStore.existsBySerialNumber).toHaveBeenCalledWith(input.serialNumber);
        expect(deviceStore.create).toHaveBeenCalledWith(expect.objectContaining({
          id: 'mocked-uuid',
          name: input.name,
          serialNumber: input.serialNumber,
          type: input.type,
          status: DeviceStatus.Online,
          firmwareVersion: input.firmwareVersion,
          location: input.location,
        }));
        expect(result).toEqual(expectedDevice);
      });
    });

    describe('When creating a device with invalid data', () => {
      it('Then it should throw a validation error', () => {
        const input: CreateDeviceInput = {
          name: 'ab',
          serialNumber: 'ND-001',
          type: DeviceType.Sensor,
          firmwareVersion: '1.0.0',
        };

        (validateDevice.create as jest.Mock).mockReturnValue({
          isValid: false,
          error: 'Invalid device name',
        });

        expect(() => {
          deviceMutations.createDevice(null, { input });
        }).toThrow('Invalid device name');
      });
    });

    describe('When creating a device with duplicate serial number', () => {
      it('Then it should throw a duplicate error', () => {
        const input: CreateDeviceInput = {
          name: 'New Device',
          serialNumber: 'ND-001',
          type: DeviceType.Sensor,
          firmwareVersion: '1.0.0',
        };

        (validateDevice.create as jest.Mock).mockReturnValue({ isValid: true });
        (deviceStore.existsBySerialNumber as jest.Mock).mockReturnValue(true);

        expect(() => {
          deviceMutations.createDevice(null, { input });
        }).toThrow('Device with this serial number already exists');
      });
    });
  });

  describe('Given an updateDevice mutation', () => {
    describe('When updating an existing device', () => {
      it('Then it should update and return the device', () => {
        const existingDevice = {
          id: 'device-1',
          name: 'Original Device',
          serialNumber: 'OD-001',
          type: DeviceType.Gateway,
          status: DeviceStatus.Online,
          lastSeenAt: '2024-01-01T00:00:00Z',
          firmwareVersion: '1.0.0',
          location: 'Lab 1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        };

        const input: UpdateDeviceInput = {
          id: 'device-1',
          name: 'Updated Device',
          status: DeviceStatus.Offline,
        };

        const updatedDevice = {
          ...existingDevice,
          name: input.name,
          status: input.status,
          updatedAt: expect.any(String),
        };

        (deviceStore.getById as jest.Mock).mockReturnValue(existingDevice);
        (validateDevice.update as jest.Mock).mockReturnValue({ isValid: true });
        (deviceStore.update as jest.Mock).mockReturnValue(updatedDevice);

        const result = deviceMutations.updateDevice(null, { input });

        expect(deviceStore.getById).toHaveBeenCalledWith(input.id);
        expect(validateDevice.update).toHaveBeenCalledWith(input);
        expect(deviceStore.update).toHaveBeenCalledWith(input.id, expect.objectContaining({
          name: input.name,
          status: input.status,
        }));
        expect(result).toEqual(updatedDevice);
      });

      it('Then it should update lastSeenAt when device comes online', () => {
        const existingDevice = {
          id: 'device-1',
          name: 'Device',
          serialNumber: 'D-001',
          type: DeviceType.Gateway,
          status: DeviceStatus.Offline,
          lastSeenAt: '2024-01-01T00:00:00Z',
          firmwareVersion: '1.0.0',
          location: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        };

        const input: UpdateDeviceInput = {
          id: 'device-1',
          status: DeviceStatus.Online,
        };

        (deviceStore.getById as jest.Mock).mockReturnValue(existingDevice);
        (validateDevice.update as jest.Mock).mockReturnValue({ isValid: true });
        (deviceStore.update as jest.Mock).mockImplementation((id, device) => device);

        const result = deviceMutations.updateDevice(null, { input });

        expect(deviceStore.update).toHaveBeenCalledWith(input.id, expect.objectContaining({
          status: DeviceStatus.Online,
          lastSeenAt: expect.any(String),
        }));
        expect(result.lastSeenAt).not.toBe(existingDevice.lastSeenAt);
      });
    });

    describe('When updating a non-existent device', () => {
      it('Then it should throw an error', () => {
        const input: UpdateDeviceInput = {
          id: 'non-existent',
          name: 'Updated Device',
        };

        (deviceStore.getById as jest.Mock).mockReturnValue(undefined);

        expect(() => {
          deviceMutations.updateDevice(null, { input });
        }).toThrow('Device not found');
      });
    });

    describe('When updating with invalid data', () => {
      it('Then it should throw a validation error', () => {
        const existingDevice = {
          id: 'device-1',
          name: 'Device',
          serialNumber: 'D-001',
          type: DeviceType.Gateway,
          status: DeviceStatus.Online,
          lastSeenAt: '2024-01-01T00:00:00Z',
          firmwareVersion: '1.0.0',
          location: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        };

        const input: UpdateDeviceInput = {
          id: 'device-1',
          name: 'ab', // Too short
        };

        (deviceStore.getById as jest.Mock).mockReturnValue(existingDevice);
        (validateDevice.update as jest.Mock).mockReturnValue({
          isValid: false,
          error: 'Invalid device name',
        });

        expect(() => {
          deviceMutations.updateDevice(null, { input });
        }).toThrow('Invalid device name');
      });
    });
  });

  describe('Given a deleteDevice mutation', () => {
    describe('When deleting an existing device', () => {
      it('Then it should delete the device and return true', () => {
        const deviceId = 'device-1';

        (deviceStore.exists as jest.Mock).mockReturnValue(true);
        (deviceStore.delete as jest.Mock).mockReturnValue(true);

        const result = deviceMutations.deleteDevice(null, { id: deviceId });

        expect(deviceStore.exists).toHaveBeenCalledWith(deviceId);
        expect(deviceStore.delete).toHaveBeenCalledWith(deviceId);
        expect(result).toBe(true);
      });
    });

    describe('When deleting a non-existent device', () => {
      it('Then it should throw an error', () => {
        const deviceId = 'non-existent';

        (deviceStore.exists as jest.Mock).mockReturnValue(false);

        expect(() => {
          deviceMutations.deleteDevice(null, { id: deviceId });
        }).toThrow('Device not found');

        expect(deviceStore.delete).not.toHaveBeenCalled();
      });
    });
  });
});