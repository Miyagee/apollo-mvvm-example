import { Device, DeviceStatus, DeviceType } from '@/graphql/generated';

import { DeviceModel } from '.';

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

  describe('Given a device data object', () => {
    describe('When creating a new DeviceModel instance', () => {
      it('Then it should initialize all properties correctly', () => {
        const device = new DeviceModel(mockDevice);

        expect(device.id).toBe('1');
        expect(device.name).toBe('Test Sensor');
        expect(device.serialNumber).toBe('TS-001-A');
        expect(device.type).toBe(DeviceType.Sensor);
        expect(device.status).toBe(DeviceStatus.Online);
        expect(device.firmwareVersion).toBe('1.0.0');
        expect(device.location).toBe('Building A');
      });
    });

    describe('When the device has null lastSeenAt', () => {
      it('Then it should handle the null value and format as "Never"', () => {
        const deviceData = { ...mockDevice, lastSeenAt: null };
        const device = new DeviceModel(deviceData);

        expect(device.lastSeenAt).toBeNull();
        expect(device.lastSeenFormatted).toBe('Never');
      });
    });

    describe('When the device has null location', () => {
      it('Then it should handle the null value correctly', () => {
        const deviceData = { ...mockDevice, location: null };
        const device = new DeviceModel(deviceData);

        expect(device.location).toBeNull();
      });
    });
  });

  describe('Given a DeviceModel instance', () => {
    describe('When checking device status', () => {
      describe('And the device is online', () => {
        it('Then isOnline should return true and other status checks should return false', () => {
          const device = new DeviceModel(mockDevice);

          expect(device.isOnline).toBe(true);
          expect(device.isOffline).toBe(false);
          expect(device.needsAttention).toBe(false);
        });
      });

      describe('And the device is offline', () => {
        it('Then isOffline should return true and other status checks should return false', () => {
          const offlineDevice = { ...mockDevice, status: DeviceStatus.Offline };
          const device = new DeviceModel(offlineDevice);

          expect(device.isOnline).toBe(false);
          expect(device.isOffline).toBe(true);
          expect(device.needsAttention).toBe(false);
        });
      });

      describe('And the device has error status', () => {
        it('Then needsAttention should return true', () => {
          const errorDevice = { ...mockDevice, status: DeviceStatus.Error };
          const device = new DeviceModel(errorDevice);

          expect(device.needsAttention).toBe(true);
        });
      });

      describe('And the device is under maintenance', () => {
        it('Then needsAttention should return true', () => {
          const maintenanceDevice = {
            ...mockDevice,
            status: DeviceStatus.Maintenance,
          };
          const device = new DeviceModel(maintenanceDevice);

          expect(device.needsAttention).toBe(true);
        });
      });
    });
  });

  describe('Given a device with lastSeenAt timestamp', () => {
    describe('When formatting the last seen time', () => {
      describe('And the device was seen just now', () => {
        it('Then it should display "Just now"', () => {
          const now = new Date();
          const device = new DeviceModel({
            ...mockDevice,
            lastSeenAt: now.toISOString(),
          });

          expect(device.lastSeenFormatted).toBe('Just now');
        });
      });

      describe('And the device was seen 30 minutes ago', () => {
        it('Then it should display "30 minutes ago"', () => {
          const now = new Date();
          const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);
          const device = new DeviceModel({
            ...mockDevice,
            lastSeenAt: thirtyMinutesAgo.toISOString(),
          });

          expect(device.lastSeenFormatted).toBe('30 minutes ago');
        });
      });

      describe('And the device was seen 2 hours ago', () => {
        it('Then it should display "2 hours ago"', () => {
          const now = new Date();
          const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60000);
          const device = new DeviceModel({
            ...mockDevice,
            lastSeenAt: twoHoursAgo.toISOString(),
          });

          expect(device.lastSeenFormatted).toBe('2 hours ago');
        });
      });

      describe('And the device was seen 3 days ago', () => {
        it('Then it should display "3 days ago"', () => {
          const now = new Date();
          const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60000);
          const device = new DeviceModel({
            ...mockDevice,
            lastSeenAt: threeDaysAgo.toISOString(),
          });

          expect(device.lastSeenFormatted).toBe('3 days ago');
        });
      });
    });
  });

  describe('Given DeviceModel validation methods', () => {
    describe('When validating serial numbers', () => {
      describe('And the serial number follows the correct format', () => {
        it('Then isValidSerialNumber should return true', () => {
          expect(DeviceModel.isValidSerialNumber('TS-001-A')).toBe(true);
          expect(DeviceModel.isValidSerialNumber('GW-001-MAIN')).toBe(true);
          expect(DeviceModel.isValidSerialNumber('CAM-001-ENT')).toBe(true);
          expect(DeviceModel.isValidSerialNumber('CTRL-001-HVAC')).toBe(true);
        });
      });

      describe('And the serial number is too short', () => {
        it('Then isValidSerialNumber should return false', () => {
          expect(DeviceModel.isValidSerialNumber('AB')).toBe(false);
          expect(DeviceModel.isValidSerialNumber('  ')).toBe(false);
          expect(DeviceModel.isValidSerialNumber('')).toBe(false);
        });
      });

      describe('And the serial number uses flexible format', () => {
        it('Then isValidSerialNumber should return true for formats with at least 3 characters', () => {
          expect(DeviceModel.isValidSerialNumber('invalid')).toBe(true);
          expect(DeviceModel.isValidSerialNumber('TS001A')).toBe(true);
          expect(DeviceModel.isValidSerialNumber('TS-1-A')).toBe(true);
          expect(DeviceModel.isValidSerialNumber('ABC')).toBe(true);
        });
      });
    });

    describe('When validating firmware versions', () => {
      describe('And the version follows semantic versioning', () => {
        it('Then isValidFirmwareVersion should return true', () => {
          expect(DeviceModel.isValidFirmwareVersion('1.0.0')).toBe(true);
          expect(DeviceModel.isValidFirmwareVersion('2.10.5')).toBe(true);
          expect(DeviceModel.isValidFirmwareVersion('10.0.0')).toBe(true);
        });
      });

      describe('And the version uses alternative formats', () => {
        it('Then isValidFirmwareVersion should return true for flexible formats', () => {
          expect(DeviceModel.isValidFirmwareVersion('1.0')).toBe(true);
          expect(DeviceModel.isValidFirmwareVersion('v1.0.0')).toBe(true);
          expect(DeviceModel.isValidFirmwareVersion('2.1')).toBe(true);
          expect(DeviceModel.isValidFirmwareVersion('v3')).toBe(true);
        });
      });

      describe('And the version format is invalid', () => {
        it('Then isValidFirmwareVersion should return false', () => {
          expect(DeviceModel.isValidFirmwareVersion('abc')).toBe(false);
          expect(DeviceModel.isValidFirmwareVersion('version1')).toBe(false);
          expect(DeviceModel.isValidFirmwareVersion('')).toBe(false);
          expect(DeviceModel.isValidFirmwareVersion('not-a-version')).toBe(false);
          expect(DeviceModel.isValidFirmwareVersion('1.a.0')).toBe(false);
        });
      });
    });

    describe('When validating device names', () => {
      describe('And the name is valid', () => {
        it('Then isValidName should return true', () => {
          expect(DeviceModel.isValidName('Test Device')).toBe(true);
          expect(DeviceModel.isValidName('A B C')).toBe(true);
          expect(DeviceModel.isValidName('Temperature Sensor - Floor 1')).toBe(true);
        });
      });

      describe('And the name is empty or only spaces', () => {
        it('Then isValidName should return false', () => {
          expect(DeviceModel.isValidName('')).toBe(false);
          expect(DeviceModel.isValidName('  ')).toBe(false);
        });
      });

      describe('And the name exceeds maximum length', () => {
        it('Then isValidName should return false', () => {
          expect(DeviceModel.isValidName('A'.repeat(101))).toBe(false);
        });
      });

      describe('And the name is very short', () => {
        it('Then isValidName should return true for single character names', () => {
          expect(DeviceModel.isValidName('A')).toBe(true);
          expect(DeviceModel.isValidName('AB')).toBe(true);
        });
      });
    });
  });

  describe('Given a device with search capabilities', () => {
    describe('When searching by device properties', () => {
      const device = new DeviceModel(mockDevice);

      describe('And searching by name', () => {
        it('Then it should match case-insensitively', () => {
          expect(device.matchesSearch('Test')).toBe(true);
          expect(device.matchesSearch('sensor')).toBe(true);
          expect(device.matchesSearch('TEST SENSOR')).toBe(true);
        });
      });

      describe('And searching by serial number', () => {
        it('Then it should match partial serial numbers', () => {
          expect(device.matchesSearch('TS-001')).toBe(true);
          expect(device.matchesSearch('001')).toBe(true);
          expect(device.matchesSearch('ts-001-a')).toBe(true);
        });
      });

      describe('And searching by location', () => {
        it('Then it should match location text', () => {
          expect(device.matchesSearch('Building')).toBe(true);
          expect(device.matchesSearch('building a')).toBe(true);
        });
      });

      describe('And searching by device type', () => {
        it('Then it should match type name', () => {
          expect(device.matchesSearch('sensor')).toBe(true);
          expect(device.matchesSearch('SENSOR')).toBe(true);
        });
      });

      describe('And the device has no location', () => {
        it('Then it should not match location searches', () => {
          const deviceWithoutLocation = { ...mockDevice, location: null };
          const deviceNoLocation = new DeviceModel(deviceWithoutLocation);

          expect(deviceNoLocation.matchesSearch('Building')).toBe(false);
        });
      });

      describe('And searching with unrelated terms', () => {
        it('Then it should not match', () => {
          expect(device.matchesSearch('xyz')).toBe(false);
          expect(device.matchesSearch('camera')).toBe(false);
        });
      });
    });
  });

  describe('Given a DeviceModel instance', () => {
    describe('When converting to JSON', () => {
      it('Then it should return the original device data', () => {
        const device = new DeviceModel(mockDevice);
        const json = device.toJSON();

        expect(json).toEqual(mockDevice);
        expect(json).toBe(mockDevice);
      });
    });

    describe('When accessing date properties', () => {
      const device = new DeviceModel(mockDevice);

      it('Then createdAt should be a Date object', () => {
        expect(device.createdAt).toBeInstanceOf(Date);
        expect(device.createdAt.getFullYear()).toBe(2023);
      });

      it('Then updatedAt should be a Date object', () => {
        expect(device.updatedAt).toBeInstanceOf(Date);
      });

      it('Then lastSeenAt should be a Date object when present', () => {
        expect(device.lastSeenAt).toBeInstanceOf(Date);
      });
    });
  });
});
