import { deviceQueries } from './queries/device';
import { deviceMutations } from './mutations/device';

export const resolvers = {
  Query: {
    ...deviceQueries,
  },
  Mutation: {
    ...deviceMutations,
  },
};
