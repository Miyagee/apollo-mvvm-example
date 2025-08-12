import { Device, DeviceStatus, DeviceType } from '@/graphql/generated';

/**
 * Device Model - Business logic and data validation
 * This is the Model in MVVM pattern
 */
export class DeviceModel {
  constructor(private readonly data: Device) {}

  // Getters for accessing data
  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get serialNumber(): string {
    return this.data.serialNumber;
  }

  get type(): DeviceType {
    return this.data.type;
  }

  get status(): DeviceStatus {
    return this.data.status;
  }

  get lastSeenAt(): Date | null {
    return this.data.lastSeenAt ? new Date(this.data.lastSeenAt) : null;
  }

  get firmwareVersion(): string {
    return this.data.firmwareVersion;
  }

  get location(): string | null {
    return this.data.location || null;
  }

  get createdAt(): Date {
    return new Date(this.data.createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.data.updatedAt);
  }

  // Business logic methods
  get isOnline(): boolean {
    return this.data.status === DeviceStatus.Online;
  }

  get isOffline(): boolean {
    return this.data.status === DeviceStatus.Offline;
  }

  get needsAttention(): boolean {
    return this.data.status === DeviceStatus.Error || this.data.status === DeviceStatus.Maintenance;
  }

  get lastSeenFormatted(): string {
    if (!this.lastSeenAt) return 'Never';

    const now = new Date();
    const diff = now.getTime() - this.lastSeenAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  // Validation methods
  static isValidSerialNumber(serialNumber: string): boolean {
    // More flexible: any string with at least 3 characters
    return serialNumber.trim().length >= 3;
  }

  static isValidFirmwareVersion(version: string): boolean {
    // More flexible: any string that looks like a version (e.g., "1.0", "2.1.3", "v1.0.0")
    const pattern = /^v?\d+(\.\d+)*$/;
    return pattern.test(version);
  }

  static isValidName(name: string): boolean {
    return name.trim().length >= 1 && name.trim().length <= 100;
  }

  // Utility methods
  matchesSearch(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return (
      this.name.toLowerCase().includes(term) ||
      this.serialNumber.toLowerCase().includes(term) ||
      (this.location?.toLowerCase().includes(term) ?? false) ||
      this.type.toLowerCase().includes(term)
    );
  }

  toJSON(): Device {
    return this.data;
  }
}
