 /**
 * API client with robust env handling and graceful fallbacks.
 * Priority: REACT_APP_API_BASE -> REACT_APP_BACKEND_URL -> mock mode.
 */
const API_BASE =
  (process.env.REACT_APP_API_BASE && String(process.env.REACT_APP_API_BASE).trim()) ||
  (process.env.REACT_APP_BACKEND_URL && String(process.env.REACT_APP_BACKEND_URL).trim()) ||
  '';

/**
 * Feature flags and environment helpers
 */
const EXPERIMENTS_ENABLED = String(process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase() === 'true';

/**
 * Convert low-level errors into user-friendly messages for UI
 */
function toFriendlyError(err, { action = 'load data' } = {}) {
  const msg = (err && err.message) || String(err) || '';
  if (msg.includes('timeout')) return `The request timed out while trying to ${action}. Please try again.`;
  if (/network/i.test(msg) || /failed to fetch/i.test(msg)) return `Cannot reach the server right now. Showing sample results.`;
  if (/HTTP\s+4\d{2}/.test(msg)) return `There was a problem with your request.`;
  if (/HTTP\s+5\d{2}/.test(msg)) return `The server encountered an error. Please try again later.`;
  return `Unable to ${action}. Showing sample results.`;
}

/**
 * Fetch wrapper with timeout and status checking
 */
const withTimeout = (promise, ms = 6000) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });

/**
 * Build URL against API base with optional experiments flag
 */
function buildApiUrl(pathname, params = {}) {
  if (!API_BASE) return null;
  const url = new URL(pathname, API_BASE);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  if (EXPERIMENTS_ENABLED) {
    url.searchParams.set('exp', '1');
  }
  return url;
}

const mockRecipes = [
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
      'Toss with pasta, lemon juice, and parsley.'
    ]
  },
  {
    id: 'mock-2',
    title: 'Avocado Chicken Salad',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop',
    readyInMinutes: 15,
    servings: 3,
    ingredients: ['Chicken', 'Avocado', 'Lettuce', 'Tomatoes', 'Olive Oil', 'Lime'],
    instructions: [
      'Shred cooked chicken.',
      'Dice avocado and tomatoes.',
      'Toss with lettuce, olive oil, and lime juice.'
    ]
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
      'Season with herbs and serve warm.'
    ]
  }
];

/**
 * PUBLIC_INTERFACE
 */
export async function searchRecipes(query = '') {
  /** Search recipes by query; uses live API when configured and reachable, else uses mock data. */
  const q = String(query || '').trim();
  const filterMock = () =>
    mockRecipes.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));

  const url = buildApiUrl('/recipes', q ? { q } : {});
  if (!url) {
    // no API configured; filter mock
    return filterMock();
  }
  try {
    const res = await withTimeout(
      fetch(url.toString(), { headers: { Accept: 'application/json' } }),
      8000
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // Expect array of recipes, normalize keys
    return (json || []).map((r, idx) => ({
      id: r.id ?? String(idx),
      title: r.title ?? r.name ?? 'Recipe',
      image: r.image ?? r.thumbnail ?? '',
      readyInMinutes: r.readyInMinutes ?? r.time ?? r.duration ?? 30,
      servings: r.servings ?? r.yield ?? 2,
    }));
  } catch (e) {
    // Attach friendly message for hooks/UI and fall back
    const friendly = toFriendlyError(e, { action: 'load recipes' });
    const err = new Error(friendly);
    err.friendlyMessage = friendly;
    err.cause = e;
    // Returning mock to keep UI responsive; hooks can surface error messaging.
    return filterMock();
  }
}

/**
 * PUBLIC_INTERFACE
 */
export async function getRecipeDetail(id) {
  /** Get single recipe details; prefers API, falls back to mock by id. */
  const fallback = () => mockRecipes.find((r) => r.id === id) || mockRecipes[0];
  const url = buildApiUrl(`/recipes/${encodeURIComponent(id)}`);
  if (!url) return fallback();
  try {
    const res = await withTimeout(
      fetch(url.toString(), { headers: { Accept: 'application/json' } }),
      8000
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const r = await res.json();
    return {
      id: r.id ?? id,
      title: r.title ?? r.name ?? 'Recipe',
      image: r.image ?? r.thumbnail ?? '',
      readyInMinutes: r.readyInMinutes ?? r.time ?? r.duration ?? 30,
      servings: r.servings ?? r.yield ?? 2,
      ingredients: r.ingredients ?? r.ingredientLines ?? [],
      instructions: Array.isArray(r.instructions)
        ? r.instructions
        : typeof r.instructions === 'string'
        ? r.instructions.split(/\.\s+/)
        : [],
    };
  } catch (e) {
    return fallback();
  }
}
