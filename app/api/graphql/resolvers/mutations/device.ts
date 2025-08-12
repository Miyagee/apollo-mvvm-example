import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

import { Device, CreateDeviceInput, UpdateDeviceInput, DeviceStatus } from '@/graphql/generated';

import { deviceStore } from '../../data/deviceStore';
import { validateDevice } from '../../validators/deviceValidator';

export const deviceMutations = {
  createDevice: (_parent: unknown, args: { input: CreateDeviceInput }): Device => {
    // Validate input
    const validation = validateDevice.create(args.input);
    if (!validation.isValid) {
      throw new GraphQLError(validation.error!, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Check for duplicate serial number
    if (deviceStore.existsBySerialNumber(args.input.serialNumber)) {
      throw new GraphQLError('Device with this serial number already exists', {
        extensions: { code: 'DUPLICATE_ENTRY' },
      });
    }

    const newDevice: Device = {
      id: uuidv4(),
      name: args.input.name,
      serialNumber: args.input.serialNumber,
      type: args.input.type,
      status: DeviceStatus.Online,
      lastSeenAt: new Date().toISOString(),
      firmwareVersion: args.input.firmwareVersion,
      location: args.input.location || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return deviceStore.create(newDevice);
  },

  updateDevice: (_parent: unknown, args: { input: UpdateDeviceInput }): Device => {
    const existingDevice = deviceStore.getById(args.input.id);
    if (!existingDevice) {
      throw new GraphQLError('Device not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Validate updates
    const validation = validateDevice.update(args.input);
    if (!validation.isValid) {
      throw new GraphQLError(validation.error!, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Create a base updated device
    const updatedDevice: Device = {
      ...existingDevice,
      updatedAt: new Date().toISOString(),
    };

    // Apply updates conditionally
    if (args.input.name !== undefined && args.input.name !== null) {
      updatedDevice.name = args.input.name;
    }

    if (args.input.status !== undefined && args.input.status !== null) {
      updatedDevice.status = args.input.status;

      // Update lastSeenAt when device comes online
      if (args.input.status === DeviceStatus.Online) {
        updatedDevice.lastSeenAt = new Date().toISOString();
      }
    }

    if (args.input.firmwareVersion !== undefined) {
      // Only update if not null, otherwise keep existing value
      if (args.input.firmwareVersion !== null) {
        updatedDevice.firmwareVersion = args.input.firmwareVersion;
      }
    }

    if (args.input.location !== undefined) {
      // Location can be null (to clear it)
      updatedDevice.location = args.input.location;
    }

    return deviceStore.update(args.input.id, updatedDevice);
  },

  deleteDevice: (_parent: unknown, args: { id: string }): boolean => {
    if (!deviceStore.exists(args.id)) {
      throw new GraphQLError('Device not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    return deviceStore.delete(args.id);
  },
};
