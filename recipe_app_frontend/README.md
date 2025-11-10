# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies. The app implements a recipe explorer with browsing, searching, favorites management, and a sign-in flow guarded by a simple client-only auth context.

## Features

- Lightweight: No heavy UI frameworks. Styling is implemented with CSS in `src/theme.css`.
- Modern UI: Clean, responsive design following the Ocean Professional theme.
- Fast: Minimal dependencies and deterministic tests with MSW.
- Simple: Easy to understand and modify; clear separation of components, hooks, contexts, and API client.
- Robust API client: Uses environment configuration with graceful mock fallback.

## Quickstart

Follow these steps to run the app locally.

1) Install dependencies:
- npm install

2) Configure environment (optional for local development):
- Copy .env.example to .env and adjust as needed. If you do not set REACT_APP_API_BASE or REACT_APP_BACKEND_URL, the app will use deterministic local mock data.

3) Start the development server:
- npm start
- Visit http://localhost:3000 (or the port you configured)

4) Run tests:
- npm test
- Tests run with Jest and Testing Library. If no API base is configured, MSW-based mocks are automatically started in tests via src/setupTests.js.

5) Build for production:
- npm run build

## Environment Variables

Create React App exposes only variables prefixed with REACT_APP_. Copy `.env.example` to `.env` and adjust. Below is a description of all available variables and how the code uses them.

- REACT_APP_API_BASE
  The primary base URL for all API calls. If this is not set, the client checks REACT_APP_BACKEND_URL. When both are empty, the client operates in mock/offline mode using deterministic in-memory data. In development you can leave this empty to use mock data immediately. Example: http://localhost:4000

- REACT_APP_BACKEND_URL
  A secondary/legacy base URL used only when REACT_APP_API_BASE is empty. The API client falls back to this value. If this is also empty, the client uses mock data. Example: https://api.example.com

- REACT_APP_FRONTEND_URL
  The public origin of the frontend if needed for absolute links or integrations. CRA does not require this for local usage. Example: http://localhost:3000

- REACT_APP_WS_URL
  The WebSocket base URL for forward-compatible real-time features. Not used by the current UI but reserved for future work. Example: ws://localhost:4000

- REACT_APP_NODE_ENV
  Optional override used in some utilities and tests to detect environment. Accepted values: development, test, production. Tests consider REACT_APP_NODE_ENV === "test" equivalent to NODE_ENV === "test".

- REACT_APP_NEXT_TELEMETRY_DISABLED
  Disables Next.js telemetry if Next tooling is present in your environment. Not used by CRA itself but included for consistency. Default: 1

- REACT_APP_ENABLE_SOURCE_MAPS
  Controls whether production source maps are generated alongside CRA’s GENERATE_SOURCEMAP. Set to "true" to keep source maps, or "false" to reduce build size. Default: true

- REACT_APP_PORT
  Port hint for local development. CRA’s dev server defaults to 3000 and may prompt or auto-adjust; set this to standardize in containerized setups. Default: 3000

- REACT_APP_TRUST_PROXY
  Hint for proxy-aware deployments. Not used by the SPA at runtime but maintained for parity with typical SSR stacks. Default: false

- REACT_APP_LOG_LEVEL
  Optional client log level for future logging utilities. Accepted values: trace, debug, info, warn, error, silent. Default: info

- REACT_APP_HEALTHCHECK_PATH
  Health endpoint path for orchestration to probe. The SPA does not serve a dynamic health route by default, but you can configure your host to return 200 for this path. Default: /healthz

- REACT_APP_FEATURE_FLAGS
  Comma-separated flags for future toggles. Current code does not parse this set directly but it is available for new features. Example: search-new,telemetry-off

- REACT_APP_EXPERIMENTS_ENABLED
  Enables experiments in the API client which may append an "exp=1" parameter to requests when an API base is configured. Default: false

## API Client and Mock Behavior

The API client is implemented in `src/api/client.js`. It chooses the API base in this priority:
1) REACT_APP_API_BASE
2) REACT_APP_BACKEND_URL
3) Neither set ⇒ mock mode

When neither base URL is configured, the app runs fully in mock mode using deterministic in-memory data embedded in the client. Even when an API base is set, the client falls back to local mock data if it encounters a network error or a server error (HTTP 5xx). This guarantees a resilient UX and deterministic tests.

- Search: `searchRecipes(query)` will call GET /recipes?q=... when an API base exists. On failure or when base is missing, it filters deterministic mock data client-side.
- Detail: `getRecipe(id)` will call GET /recipes/:id when an API base exists. On failure or when base is missing, it returns a deterministic mock recipe.

Error normalization: The client wraps low-level errors and returns friendly messages. Hooks surface these messages where needed.

## Test and Development Mock Server (MSW)

When running tests (`npm test`), if no API base is configured, `src/setupTests.js` automatically spins up an MSW (Mock Service Worker) server using handlers from `src/mocks/handlers.js`. This server returns deterministic JSON responses for /recipes and /recipes/:id.

- The Node-based MSW server is used in Jest via `setupServer`.
- In browser development, you can optionally use `createMockServer` from `src/mocks/server.js` to run a Service Worker mock if you prefer. By default, the app relies on the client’s internal mock data when no API base is present, so you do not need to run a separate mock service.

Summary:
- Dev without backend: Leave REACT_APP_API_BASE empty; the client uses embedded mock data.
- Tests without backend: MSW automatically intercepts requests when no API base is configured, ensuring deterministic test results.
- With a backend: Set REACT_APP_API_BASE to your API URL; the client uses it and still gracefully falls back to mock data on 5xx/network errors.

## Project Scripts

In the project directory:

- npm start
  Runs the app in development mode. Open http://localhost:3000.
- npm test
  Runs the tests in CI-friendly mode (no watch). MSW starts automatically if no API base is set.
- npm run build
  Builds the app for production to the build folder, optimizing for best performance.

## Code Map

- src/api/client.js: Environment-aware API client with timeout, error normalization, and mock fallback.
- src/hooks/useRecipes.js, src/hooks/useRecipeDetail.js: Data hooks providing loading, error states, and search mechanics.
- src/context/AuthContext.js, src/context/FavoritesContext.js: Auth and favorites state management with localStorage persistence.
- src/mocks/*: MSW handlers and server for tests and optional dev usage.
- src/RouterApp.js: Hash-based routing with auth guard, deep links, and query sync for search.
- src/components/* and src/pages/*: UI components and pages.
- src/theme.css: Ocean Professional theme variables and component styles.

## Notes on Accessibility and UX

The app includes ARIA roles, keyboard focus styles, and accessible labels. The search bar, cards, favorites panel, and detail dialog provide keyboard navigation and screen reader-friendly information. Loading states and error messages are surfaced to assistive technologies.

## Learn More

To learn React, visit the React documentation. For CRA-specific guidance, see the official Create React App docs, including topics like code splitting, analyzing bundle size, PWA guidance, advanced configuration, deployment, and troubleshooting.
