import { CreateDeviceInput, UpdateDeviceInput } from '@/graphql/generated';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

class DeviceValidator {
  private validateName(name: string): boolean {
    return name.length >= 1 && name.length <= 100;
  }

  private validateSerialNumber(serialNumber: string): boolean {
    // More flexible: any string with at least 3 characters
    return serialNumber.length >= 3;
  }

  private validateFirmwareVersion(version: string): boolean {
    // More flexible: any string that looks like a version (e.g., "1.0", "2.1.3", "v1.0.0")
    return /^v?\d+(\.\d+)*$/.test(version);
  }

  create(input: CreateDeviceInput): ValidationResult {
    if (!this.validateName(input.name)) {
      return {
        isValid: false,
        error: 'Device name must be between 1 and 100 characters',
      };
    }

    if (!this.validateSerialNumber(input.serialNumber)) {
      return {
        isValid: false,
        error: 'Serial number must be at least 3 characters',
      };
    }

    if (!this.validateFirmwareVersion(input.firmwareVersion)) {
      return {
        isValid: false,
        error: 'Invalid firmware version format (e.g., 1.0, 2.1.3, v1.0.0)',
      };
    }

    return { isValid: true };
  }

  update(input: UpdateDeviceInput): ValidationResult {
    if (input.name !== undefined && input.name !== null && !this.validateName(input.name)) {
      return {
        isValid: false,
        error: 'Device name must be between 1 and 100 characters',
      };
    }

    if (
      input.firmwareVersion !== undefined &&
      input.firmwareVersion !== null &&
      !this.validateFirmwareVersion(input.firmwareVersion)
    ) {
      return {
        isValid: false,
        error: 'Invalid firmware version format (e.g., 1.0, 2.1.3, v1.0.0)',
      };
    }

    return { isValid: true };
  }
}

export const validateDevice = new DeviceValidator();
