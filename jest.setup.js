import '@testing-library/jest-dom';

// Suppress noisy warnings/errors in tests
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  // Suppress Apollo Client deprecation warnings
  if (message.includes('go.apollo.dev/c/err')) {
    return;
  }
  // Suppress "No more mocked responses" warnings (expected in some validation tests)
  if (message.includes('No more mocked responses')) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args[0]?.toString() || '';
  // Suppress expected Apollo errors from validation tests without mocked mutations
  if (message.includes('No more mocked responses')) {
    return;
  }
  originalError.apply(console, args);
};

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));
