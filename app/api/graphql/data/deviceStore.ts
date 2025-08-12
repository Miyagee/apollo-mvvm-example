import { Device, DeviceStatus, DeviceType } from '@/graphql/generated';

// In-memory data store (replace with real database in production)
class DeviceStore {
  private devices: Device[] = [
    {
      id: '1',
      name: 'Temperature Sensor - Office',
      serialNumber: 'TS-001-A',
      type: DeviceType.Sensor,
      status: DeviceStatus.Online,
      lastSeenAt: new Date().toISOString(),
      firmwareVersion: '1.0.0',
      location: 'Building A - Floor 2',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Security Camera - Entrance',
      serialNumber: 'CAM-001-ENT',
      type: DeviceType.Camera,
      status: DeviceStatus.Online,
      lastSeenAt: new Date().toISOString(),
      firmwareVersion: '2.1.0',
      location: 'Main Entrance',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Gateway - Main',
      serialNumber: 'GW-001-MAIN',
      type: DeviceType.Gateway,
      status: DeviceStatus.Online,
      lastSeenAt: new Date().toISOString(),
      firmwareVersion: '3.0.1',
      location: 'Server Room',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Door Actuator - Lab',
      serialNumber: 'ACT-001-LAB',
      type: DeviceType.Controller,
      status: DeviceStatus.Maintenance,
      lastSeenAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      firmwareVersion: '1.2.0',
      location: 'Lab Entry',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Humidity Sensor - Storage',
      serialNumber: 'HS-001-STG',
      type: DeviceType.Sensor,
      status: DeviceStatus.Offline,
      lastSeenAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      firmwareVersion: '1.0.0',
      location: 'Storage Room B',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  getAll(): Device[] {
    return this.devices;
  }

  getById(id: string): Device | undefined {
    return this.devices.find((d) => d.id === id);
  }

  exists(id: string): boolean {
    return this.devices.some((d) => d.id === id);
  }

  existsBySerialNumber(serialNumber: string): boolean {
    return this.devices.some((d) => d.serialNumber === serialNumber);
  }

  create(device: Device): Device {
    this.devices.push(device);
    return device;
  }

  update(id: string, device: Device): Device {
    const index = this.devices.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.devices[index] = device;
    }
    return device;
  }

  delete(id: string): boolean {
    const index = this.devices.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.devices.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const deviceStore = new DeviceStore();
