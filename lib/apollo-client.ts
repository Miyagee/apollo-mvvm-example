import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Create error link for handling GraphQL errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);

    // Handle authentication errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // Redirect to login or refresh token
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
});

// HTTP link configuration
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || '/api/graphql',
  credentials: 'include', // Important: This ensures cookies are sent with requests (for NextJS cookie setup)
});

// Create and export the Apollo Client instance
export const apolloClient = new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: typeof window === 'undefined' ? 'network-only' : 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Helper functions
export const resetApolloCache = async (): Promise<void> => {
  await apolloClient.resetStore();
};

export const clearApolloCache = async (): Promise<void> => {
  await apolloClient.clearStore();
};
