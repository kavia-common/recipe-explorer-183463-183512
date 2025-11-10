import { setupServer } from 'msw/node';
import { setupWorker } from 'msw';
import { handlers } from './handlers';

/**
 * PUBLIC_INTERFACE
 */
// PUBLIC_INTERFACE
export function createMockServer() {
  /** Create an MSW server (Node in tests, Service Worker in browser) with predefined handlers. */
  if (typeof window === 'undefined') {
    // Node/Jest environment
    const server = setupServer(...handlers);
    return {
      type: 'node',
      server,
      start: (options = {}) => server.listen({ onUnhandledRequest: 'bypass', ...options }),
      stop: () => server.close(),
      reset: () => server.resetHandlers(),
    };
  }

  // Browser environment (development usage)
  const worker = setupWorker(...handlers);
  return {
    type: 'browser',
    worker,
    start: async (options = {}) =>
      worker.start({
        onUnhandledRequest: 'bypass',
        quiet: true,
        ...options,
      }),
    stop: async () => worker.stop(),
    reset: async () => worker.resetHandlers(),
  };
}
