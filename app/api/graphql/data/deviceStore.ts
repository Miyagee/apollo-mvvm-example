import { Device, DeviceStatus, DeviceType } from '@/graphql/generated';

/** Simulation interval in milliseconds (5 seconds) */
const SIMULATION_INTERVAL = 5000;

// In-memory data store (replace with real database in production)
class DeviceStore {
  private simulationInterval: NodeJS.Timeout | null = null;
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

  /**
   * Start device simulation
   *
   * Simulates real-world device behavior by randomly:
   * - Toggling device status between ONLINE/OFFLINE (30% chance)
   * - Updating lastSeenAt timestamp (70% chance)
   *
   * This demonstrates how polling will pick up changes from the server.
   */
  startSimulation(): void {
    if (this.simulationInterval) return;

    console.log('[DeviceStore] Starting device simulation...');

    this.simulationInterval = setInterval(() => {
      if (this.devices.length === 0) return;

      // Pick a random device
      const randomIndex = Math.floor(Math.random() * this.devices.length);
      const device = this.devices[randomIndex];

      // Randomly update status or lastSeenAt
      const action = Math.random();
      const now = new Date().toISOString();

      if (action < 0.3) {
        // 30% chance: toggle status between ONLINE/OFFLINE
        const newStatus =
          device.status === DeviceStatus.Online ? DeviceStatus.Offline : DeviceStatus.Online;

        this.devices[randomIndex] = {
          ...device,
          status: newStatus,
          lastSeenAt: now,
          updatedAt: now,
        };

        console.log(`[DeviceStore] Simulation: ${device.name} status changed to ${newStatus}`);
      } else {
        // 70% chance: update lastSeenAt timestamp
        this.devices[randomIndex] = {
          ...device,
          lastSeenAt: now,
          updatedAt: now,
        };
      }
    }, SIMULATION_INTERVAL);
  }

  /**
   * Stop device simulation
   */
  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      console.log('[DeviceStore] Device simulation stopped.');
    }
  }
}

// Export singleton instance
export const deviceStore = new DeviceStore();

// Start simulation when module loads (for demo purposes)
// In production, you would not have this auto-start
deviceStore.startSimulation();
