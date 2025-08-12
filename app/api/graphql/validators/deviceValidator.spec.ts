import { CreateDeviceInput, UpdateDeviceInput, DeviceType } from '@/graphql/generated';
import { validateDevice } from './deviceValidator';

describe('Device Validator', () => {
  describe('Given device creation validation', () => {
    describe('When all fields are valid', () => {
      it('Then should return isValid true', () => {
        const input: CreateDeviceInput = {
          name: 'Test Device',
          serialNumber: 'TEST-001',
          type: DeviceType.Sensor,
          firmwareVersion: '1.0.0',
          location: 'Lab',
        };

        const result = validateDevice.create(input);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('When name is invalid', () => {
      it('Then should return error for empty name', () => {
        const input: CreateDeviceInput = {
          name: '',
          serialNumber: 'TEST-001',
          type: DeviceType.Sensor,
          firmwareVersion: '1.0.0',
        };

        const result = validateDevice.create(input);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Device name must be between 1 and 100 characters');
      });

      it('Then should return error for name too long', () => {
        const input: CreateDeviceInput = {
          name: 'A'.repeat(101),
          serialNumber: 'TEST-001',
          type: DeviceType.Sensor,
          firmwareVersion: '1.0.0',
        };

        const result = validateDevice.create(input);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Device name must be between 1 and 100 characters');
      });
    });

    describe('When serial number is invalid', () => {
      it('Then should return error for short serial number', () => {
        const input: CreateDeviceInput = {
          name: 'Test Device',
          serialNumber: 'AB',
          type: DeviceType.Sensor,
          firmwareVersion: '1.0.0',
        };

        const result = validateDevice.create(input);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Serial number must be at least 3 characters');
      });
    });

    describe('When firmware version is invalid', () => {
      it('Then should return error for invalid format', () => {
        const input: CreateDeviceInput = {
          name: 'Test Device',
          serialNumber: 'TEST-001',
          type: DeviceType.Sensor,
          firmwareVersion: 'not-a-version',
        };

        const result = validateDevice.create(input);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid firmware version format (e.g., 1.0, 2.1.3, v1.0.0)');
      });

      it('Then should accept flexible version formats', () => {
        const validVersions = ['1.0', '2.1.3', 'v1.0.0', 'v2', '10.0.0'];

        validVersions.forEach((version) => {
          const input: CreateDeviceInput = {
            name: 'Test Device',
            serialNumber: 'TEST-001',
            type: DeviceType.Sensor,
            firmwareVersion: version,
          };

          const result = validateDevice.create(input);
          expect(result.isValid).toBe(true);
        });
      });
    });
  });

  describe('Given device update validation', () => {
    describe('When updating with valid data', () => {
      it('Then should allow partial updates', () => {
        const input: UpdateDeviceInput = {
          id: '1',
          name: 'Updated Device',
        };

        const result = validateDevice.update(input);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('Then should allow updating only firmware', () => {
        const input: UpdateDeviceInput = {
          id: '1',
          firmwareVersion: '2.0.0',
        };

        const result = validateDevice.update(input);
        expect(result.isValid).toBe(true);
      });
    });

    describe('When updating with invalid data', () => {
      it('Then should validate name if provided', () => {
        const input: UpdateDeviceInput = {
          id: '1',
          name: 'A'.repeat(101),
        };

        const result = validateDevice.update(input);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Device name must be between 1 and 100 characters');
      });

      it('Then should validate firmware version if provided', () => {
        const input: UpdateDeviceInput = {
          id: '1',
          firmwareVersion: 'invalid',
        };

        const result = validateDevice.update(input);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid firmware version format (e.g., 1.0, 2.1.3, v1.0.0)');
      });
    });
  });
});
