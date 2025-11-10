/* jest-dom adds custom jest matchers for asserting on DOM nodes.
   allows you to do things like:
   expect(element).toHaveTextContent(/react/i)
   learn more: https://github.com/testing-library/jest-dom
*/
import '@testing-library/jest-dom';

// Optional MSW-based mock fetch during tests.
// We enable this when no REACT_APP_API_BASE is provided so tests are deterministic
// without having to mock the API client in each test.
const API_BASE =
  (process.env.REACT_APP_API_BASE && String(process.env.REACT_APP_API_BASE).trim()) ||
  (process.env.REACT_APP_BACKEND_URL && String(process.env.REACT_APP_BACKEND_URL).trim()) ||
  '';

if (!API_BASE) {
  // Lazy import so environments without msw installed won't throw at import time.
  // In this project we add msw as a devDependency, see package.json.
  // eslint-disable-next-line no-undef
  const setup = async () => {
    const mod = await import('./mocks/server');
    const { createMockServer } = mod;
    const mock = createMockServer();
    // Start before any tests run
    beforeAll(() => mock.start());
    // Reset any request handlers that may be added during the tests,
    // so they don't affect other tests.
    afterEach(() => mock.reset());
    // Clean up after the tests are finished.
    afterAll(() => mock.stop());
  };
  // Kick off async setup (Jest will await hooks automatically)
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  setup();
}
