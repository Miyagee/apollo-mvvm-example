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

  get statusColor(): string {
    switch (this.data.status) {
      case DeviceStatus.Online:
        return 'text-green-600';
      case DeviceStatus.Offline:
        return 'text-gray-600';
      case DeviceStatus.Error:
        return 'text-red-600';
      case DeviceStatus.Maintenance:
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }

  get statusBgColor(): string {
    switch (this.data.status) {
      case DeviceStatus.Online:
        return 'bg-green-100';
      case DeviceStatus.Offline:
        return 'bg-gray-100';
      case DeviceStatus.Error:
        return 'bg-red-100';
      case DeviceStatus.Maintenance:
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  }

  get typeIcon(): string {
    switch (this.data.type) {
      case DeviceType.Sensor:
        return '📡';
      case DeviceType.Gateway:
        return '🌐';
      case DeviceType.Camera:
        return '📷';
      case DeviceType.Controller:
        return '🎛️';
      default:
        return '📱';
    }
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
    // Example: XX-000-XXX format
    const pattern = /^[A-Z]{2,4}-\d{3,4}-[A-Z0-9]{1,4}$/;
    return pattern.test(serialNumber);
  }

  static isValidFirmwareVersion(version: string): boolean {
    // Semantic versioning: X.Y.Z
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(version);
  }

  static isValidName(name: string): boolean {
    return name.trim().length >= 3 && name.trim().length <= 50;
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
