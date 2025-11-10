/**
 * API client with environment handling, timeout wrapper, JSON error normalization,
 * and deterministic mock fallback when API base is missing or network/5xx errors occur.
 *
 * Priority: REACT_APP_API_BASE -> REACT_APP_BACKEND_URL -> mock mode.
 *
 * Note: During development/tests, MSW-based mocks can be enabled (see src/mocks/* and setupTests.js)
 * to intercept fetch and return deterministic responses. This client will still gracefully
 * fallback to internal mock data if API is unreachable or base is unset.
 */
const API_BASE =
  (process.env.REACT_APP_API_BASE && String(process.env.REACT_APP_API_BASE).trim()) ||
  (process.env.REACT_APP_BACKEND_URL && String(process.env.REACT_APP_BACKEND_URL).trim()) ||
  '';

const isTestEnv =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.NODE_ENV === 'test' || process.env.REACT_APP_NODE_ENV === 'test')) ||
  false;

/**
 * Feature flags and environment helpers (kept for forward-compat)
 */
const EXPERIMENTS_ENABLED = String(process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase() === 'true';

/**
 * Normalize errors to a consistent shape and preserve original cause.
 */
function normalizeError(err, { action = 'perform the request' } = {}) {
  const msg = (err && err.message) || String(err) || '';
  let friendly;
  if (msg.includes('timeout')) friendly = `The request timed out while trying to ${action}. Please try again.`;
  else if (/NetworkError|Failed to fetch|network/i.test(msg)) friendly = `Cannot reach the server right now.`;
  else if (/HTTP\s+4\d{2}/.test(msg)) friendly = `There was a problem with your request.`;
  else if (/HTTP\s+5\d{2}/.test(msg)) friendly = `The server encountered an error. Please try again later.`;
  else friendly = `Unable to ${action}.`;
  const e = new Error(friendly);
  e.friendlyMessage = friendly;
  e.cause = err;
  return e;
}

/**
 * Fetch with timeout and JSON response handling.
 * Returns { ok: boolean, status, data, error }
 */
async function fetchJson(url, { timeoutMs = isTestEnv ? 200 : 8000, ...options } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort('timeout'), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      headers: { Accept: 'application/json', ...(options && options.headers) },
      signal: controller.signal,
    });
    const status = res.status;
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
      // create error with status context
      const err = new Error(`HTTP ${status}`);
      err.status = status;
      err.data = data;
      return { ok: false, status, data: null, error: normalizeError(err) };
    }
    return { ok: true, status, data, error: null };
  } catch (err) {
    const norm = normalizeError(err);
    return { ok: false, status: 0, data: null, error: norm };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Build URL against API base with optional params.
 */
function buildApiUrl(pathname, params = {}) {
  if (!API_BASE) return null;
  const url = new URL(pathname, API_BASE);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  if (EXPERIMENTS_ENABLED) url.searchParams.set('exp', '1');
  return url.toString();
}

/**
 * Deterministic local mock data for offline/fallback mode.
 * This is embedded to avoid external dependencies and to keep behavior deterministic in tests.
 */
const MOCK_DATA = [
  {
    id: 'mock-1',
    title: 'Garlic Butter Shrimp Pasta',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb86a?q=80&w=1200&auto=format&fit=crop',
    readyInMinutes: 25,
    servings: 2,
    ingredients: ['Shrimp', 'Spaghetti', 'Garlic', 'Butter', 'Parsley', 'Lemon'],
    instructions: [
      'Cook pasta until al dente.',
      'Sauté garlic in butter, add shrimp until pink.',
      'Toss with pasta, lemon juice, and parsley.',
    ],
  },
  {
    id: 'mock-2',
    title: 'Avocado Chicken Salad',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop',
    readyInMinutes: 15,
    servings: 3,
    ingredients: ['Chicken', 'Avocado', 'Lettuce', 'Tomatoes', 'Olive Oil', 'Lime'],
    instructions: ['Shred cooked chicken.', 'Dice avocado and tomatoes.', 'Toss with lettuce, olive oil, and lime juice.'],
  },
  {
    id: 'mock-3',
    title: 'Hearty Veggie Soup',
    image: 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?q=80&w=1200&auto=format&fit=crop',
    readyInMinutes: 40,
    servings: 4,
    ingredients: ['Carrots', 'Celery', 'Potatoes', 'Onion', 'Vegetable Broth', 'Herbs'],
    instructions: [
      'Sauté onion and celery.',
      'Add carrots, potatoes, broth; simmer until tender.',
      'Season with herbs and serve warm.',
    ],
  },
];

/**
 * Normalize list item from API into our UI model.
 */
function normalizeListItem(r, idx = 0) {
  return {
    id: r.id ?? String(idx),
    title: r.title ?? r.name ?? 'Recipe',
    image: r.image ?? r.thumbnail ?? '',
    readyInMinutes: r.readyInMinutes ?? r.time ?? r.duration ?? 30,
    servings: r.servings ?? r.yield ?? 2,
  };
}

/**
 * Decide if error should cause mock fallback.
 * We fallback on: no API base, network errors (status 0), and 5xx.
 */
function shouldFallback(errOrStatus) {
  if (!API_BASE) return true;
  if (typeof errOrStatus === 'number') {
    return errOrStatus >= 500; // server errors
  }
  // error object
  return true;
}

/**
 * PUBLIC_INTERFACE
 */
// PUBLIC_INTERFACE
export async function searchRecipes(query = '', page = 1) {
  /** Search recipes by query and optional page number, with mock fallback on network/5xx or missing base. */
  const q = String(query || '').trim();
  const url = buildApiUrl('/recipes', { q: q || undefined, page: page || undefined });

  // If no API base configured -> deterministic mock filter
  if (!url) {
    const lower = q.toLowerCase();
    return MOCK_DATA.filter((r) => r.title.toLowerCase().includes(lower));
  }

  const { ok, status, data, error } = await fetchJson(url);
  if (!ok) {
    if (shouldFallback(status || error)) {
      const lower = q.toLowerCase();
      return MOCK_DATA.filter((r) => r.title.toLowerCase().includes(lower));
    }
    // If we decide not to fallback (e.g., 4xx), propagate
    throw error || new Error('Unable to load recipes.');
  }

  const arr = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  return arr.map((r, i) => normalizeListItem(r, i));
}

/**
 * PUBLIC_INTERFACE
 */
// PUBLIC_INTERFACE
export async function getRecipe(id) {
  /** Load a single recipe by id; preference to API when configured and reachable, else return deterministic mock by id. */
  const fallback = () => {
    const m = MOCK_DATA.find((r) => r.id === id) || MOCK_DATA[0];
    return { ...m };
  };

  const url = buildApiUrl(`/recipes/${encodeURIComponent(id)}`);
  if (!url) return fallback();

  const { ok, status, data, error } = await fetchJson(url);
  if (!ok) {
    if (shouldFallback(status || error)) {
      return fallback();
    }
    throw error || new Error('Unable to load recipe.');
  }

  const r = data || {};
  const instructions =
    Array.isArray(r.instructions)
      ? r.instructions
      : typeof r.instructions === 'string'
      ? r.instructions.split(/\.\s+/).filter(Boolean)
      : [];

  return {
    id: r.id ?? id,
    title: r.title ?? r.name ?? 'Recipe',
    image: r.image ?? r.thumbnail ?? '',
    readyInMinutes: r.readyInMinutes ?? r.time ?? r.duration ?? 30,
    servings: r.servings ?? r.yield ?? 2,
    ingredients: r.ingredients ?? r.ingredientLines ?? [],
    instructions,
  };
}

// Backwards compatibility exports for existing hooks/tests that may import these names
export { getRecipe as getRecipeDetail };
