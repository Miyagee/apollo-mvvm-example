import { GraphQLError } from 'graphql';

import type { Device } from '@/graphql/generated';

import { deviceStore } from '../../data/deviceStore';

export const deviceQueries = {
  devices: (): Device[] => {
    return deviceStore.getAll();
  },

  device: (_parent: unknown, args: { id: string }): Device => {
    const device = deviceStore.getById(args.id);
    if (!device) {
      throw new GraphQLError('Device not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }
    return device;
  },
};
