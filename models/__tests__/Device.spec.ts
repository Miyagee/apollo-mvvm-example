import { DeviceModel } from '../Device';
import { Device, DeviceStatus, DeviceType } from '../../graphql/generated';

describe('DeviceModel', () => {
  const mockDevice: Device = {
    id: '1',
    name: 'Test Sensor',
    serialNumber: 'TS-001-A',
    type: DeviceType.Sensor,
    status: DeviceStatus.Online,
    lastSeenAt: new Date().toISOString(),
    firmwareVersion: '1.0.0',
    location: 'Building A',
    createdAt: new Date('2023-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('constructor and getters', () => {
    it('should create a DeviceModel instance with correct data', () => {
      const device = new DeviceModel(mockDevice);

      expect(device.id).toBe('1');
      expect(device.name).toBe('Test Sensor');
      expect(device.serialNumber).toBe('TS-001-A');
      expect(device.type).toBe(DeviceType.Sensor);
      expect(device.status).toBe(DeviceStatus.Online);
      expect(device.firmwareVersion).toBe('1.0.0');
      expect(device.location).toBe('Building A');
    });

    it('should handle null lastSeenAt', () => {
      const deviceData = { ...mockDevice, lastSeenAt: null };
      const device = new DeviceModel(deviceData);

      expect(device.lastSeenAt).toBeNull();
      expect(device.lastSeenFormatted).toBe('Never');
    });

    it('should handle null location', () => {
      const deviceData = { ...mockDevice, location: null };
      const device = new DeviceModel(deviceData);

      expect(device.location).toBeNull();
    });
  });

  describe('status methods', () => {
    it('should correctly identify online status', () => {
      const device = new DeviceModel(mockDevice);
      expect(device.isOnline).toBe(true);
      expect(device.isOffline).toBe(false);
      expect(device.needsAttention).toBe(false);
    });

    it('should correctly identify offline status', () => {
      const offlineDevice = { ...mockDevice, status: DeviceStatus.Offline };
      const device = new DeviceModel(offlineDevice);

      expect(device.isOnline).toBe(false);
      expect(device.isOffline).toBe(true);
      expect(device.needsAttention).toBe(false);
    });

    it('should correctly identify devices needing attention', () => {
      const errorDevice = { ...mockDevice, status: DeviceStatus.Error };
      const device1 = new DeviceModel(errorDevice);
      expect(device1.needsAttention).toBe(true);

      const maintenanceDevice = {
        ...mockDevice,
        status: DeviceStatus.Maintenance,
      };
      const device2 = new DeviceModel(maintenanceDevice);
      expect(device2.needsAttention).toBe(true);
    });
  });

  describe('styling methods', () => {
    it('should return correct status colors', () => {
      const testCases = [
        {
          status: DeviceStatus.Online,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
        {
          status: DeviceStatus.Offline,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        },
        {
          status: DeviceStatus.Error,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        },
        {
          status: DeviceStatus.Maintenance,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        },
      ];

      testCases.forEach(({ status, color, bgColor }) => {
        const device = new DeviceModel({ ...mockDevice, status });
        expect(device.statusColor).toBe(color);
        expect(device.statusBgColor).toBe(bgColor);
      });
    });

    it('should return correct type icons', () => {
      const testCases = [
        { type: DeviceType.Sensor, icon: '📡' },
        { type: DeviceType.Gateway, icon: '🌐' },
        { type: DeviceType.Camera, icon: '📷' },
        { type: DeviceType.Controller, icon: '🎛️' },
      ];

      testCases.forEach(({ type, icon }) => {
        const device = new DeviceModel({ ...mockDevice, type });
        expect(device.typeIcon).toBe(icon);
      });
    });
  });

  describe('lastSeenFormatted', () => {
    it('should format recent times correctly', () => {
      const now = new Date();
      const device = new DeviceModel({
        ...mockDevice,
        lastSeenAt: now.toISOString(),
      });
      expect(device.lastSeenFormatted).toBe('Just now');
    });

    it('should format minutes ago correctly', () => {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);
      const device = new DeviceModel({
        ...mockDevice,
        lastSeenAt: thirtyMinutesAgo.toISOString(),
      });
      expect(device.lastSeenFormatted).toBe('30 minutes ago');
    });

    it('should format hours ago correctly', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60000);
      const device = new DeviceModel({
        ...mockDevice,
        lastSeenAt: twoHoursAgo.toISOString(),
      });
      expect(device.lastSeenFormatted).toBe('2 hours ago');
    });

    it('should format days ago correctly', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60000);
      const device = new DeviceModel({
        ...mockDevice,
        lastSeenAt: threeDaysAgo.toISOString(),
      });
      expect(device.lastSeenFormatted).toBe('3 days ago');
    });
  });

  describe('validation methods', () => {
    describe('isValidSerialNumber', () => {
      it('should validate correct serial numbers', () => {
        expect(DeviceModel.isValidSerialNumber('TS-001-A')).toBe(true);
        expect(DeviceModel.isValidSerialNumber('GW-001-MAIN')).toBe(true);
        expect(DeviceModel.isValidSerialNumber('CAM-001-ENT')).toBe(true);
        expect(DeviceModel.isValidSerialNumber('CTRL-001-HVAC')).toBe(true);
      });

      it('should reject invalid serial numbers', () => {
        expect(DeviceModel.isValidSerialNumber('invalid')).toBe(false);
        expect(DeviceModel.isValidSerialNumber('TS001A')).toBe(false);
        expect(DeviceModel.isValidSerialNumber('TS-1-A')).toBe(false);
        expect(DeviceModel.isValidSerialNumber('')).toBe(false);
      });
    });

    describe('isValidFirmwareVersion', () => {
      it('should validate correct firmware versions', () => {
        expect(DeviceModel.isValidFirmwareVersion('1.0.0')).toBe(true);
        expect(DeviceModel.isValidFirmwareVersion('2.10.5')).toBe(true);
        expect(DeviceModel.isValidFirmwareVersion('10.0.0')).toBe(true);
      });

      it('should reject invalid firmware versions', () => {
        expect(DeviceModel.isValidFirmwareVersion('1.0')).toBe(false);
        expect(DeviceModel.isValidFirmwareVersion('1.0.0.0')).toBe(false);
        expect(DeviceModel.isValidFirmwareVersion('v1.0.0')).toBe(false);
        expect(DeviceModel.isValidFirmwareVersion('')).toBe(false);
      });
    });

    describe('isValidName', () => {
      it('should validate correct device names', () => {
        expect(DeviceModel.isValidName('Test Device')).toBe(true);
        expect(DeviceModel.isValidName('A B C')).toBe(true);
        expect(DeviceModel.isValidName('Temperature Sensor - Floor 1')).toBe(true);
      });

      it('should reject invalid device names', () => {
        expect(DeviceModel.isValidName('AB')).toBe(false);
        expect(DeviceModel.isValidName('  ')).toBe(false);
        expect(DeviceModel.isValidName('A'.repeat(51))).toBe(false);
        expect(DeviceModel.isValidName('')).toBe(false);
      });
    });
  });

  describe('matchesSearch', () => {
    it('should match by name', () => {
      const device = new DeviceModel(mockDevice);
      expect(device.matchesSearch('Test')).toBe(true);
      expect(device.matchesSearch('sensor')).toBe(true);
      expect(device.matchesSearch('TEST SENSOR')).toBe(true);
    });

    it('should match by serial number', () => {
      const device = new DeviceModel(mockDevice);
      expect(device.matchesSearch('TS-001')).toBe(true);
      expect(device.matchesSearch('001')).toBe(true);
      expect(device.matchesSearch('ts-001-a')).toBe(true);
    });

    it('should match by location', () => {
      const device = new DeviceModel(mockDevice);
      expect(device.matchesSearch('Building')).toBe(true);
      expect(device.matchesSearch('building a')).toBe(true);
    });

    it('should match by type', () => {
      const device = new DeviceModel(mockDevice);
      expect(device.matchesSearch('sensor')).toBe(true);
      expect(device.matchesSearch('SENSOR')).toBe(true);
    });

    it('should not match when location is null', () => {
      const deviceWithoutLocation = { ...mockDevice, location: null };
      const device = new DeviceModel(deviceWithoutLocation);
      expect(device.matchesSearch('Building')).toBe(false);
    });

    it('should not match unrelated search terms', () => {
      const device = new DeviceModel(mockDevice);
      expect(device.matchesSearch('xyz')).toBe(false);
      expect(device.matchesSearch('camera')).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return the original device data', () => {
      const device = new DeviceModel(mockDevice);
      const json = device.toJSON();

      expect(json).toEqual(mockDevice);
      expect(json).toBe(mockDevice); // Should be the same reference
    });
  });

  describe('date conversions', () => {
    it('should convert createdAt to Date object', () => {
      const device = new DeviceModel(mockDevice);
      expect(device.createdAt).toBeInstanceOf(Date);
      expect(device.createdAt.getFullYear()).toBe(2023);
    });

    it('should convert updatedAt to Date object', () => {
      const device = new DeviceModel(mockDevice);
      expect(device.updatedAt).toBeInstanceOf(Date);
    });

    it('should convert lastSeenAt to Date object when present', () => {
      const device = new DeviceModel(mockDevice);
      expect(device.lastSeenAt).toBeInstanceOf(Date);
    });
  });
});
