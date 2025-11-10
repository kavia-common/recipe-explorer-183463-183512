import { rest } from 'msw';

/**
 * Deterministic in-memory recipes used by mocks and tests.
 * Keep IDs and fields in sync with client.js MOCK_DATA for consistent UX.
 */
export const MOCK_RECIPES = [
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
 * Utility: normalize list response shape similar to client expectations
 */
function normalizeListItem(r, idx = 0) {
  return {
    id: r.id ?? String(idx),
    title: r.title ?? 'Recipe',
    image: r.image ?? '',
    readyInMinutes: r.readyInMinutes ?? 30,
    servings: r.servings ?? 2,
  };
}

/**
 * Resolve API base: if env base is missing, accept any host path for handlers.
 * We register generic path patterns to be resilient across envs.
 */
const API_BASE =
  (process.env.REACT_APP_API_BASE && String(process.env.REACT_APP_API_BASE).trim()) ||
  (process.env.REACT_APP_BACKEND_URL && String(process.env.REACT_APP_BACKEND_URL).trim()) ||
  '';

/**
 * Build path matchers: if API_BASE is absolute, derive pathname; otherwise use relative.
 */
function pathFor(p) {
  if (!API_BASE) return p;
  try {
    const u = new URL(p, API_BASE);
    return u.toString();
  } catch {
    return p;
  }
}

/**
 * Handlers:
 * - GET /recipes?q=term&page=n -> returns array of recipe summaries
 * - GET /recipes/:id -> returns full recipe detail
 */
export const handlers = [
  rest.get(pathFor('/recipes'), (req, res, ctx) => {
    const q = (req.url.searchParams.get('q') || '').toLowerCase();
    const page = Number(req.url.searchParams.get('page') || '1');
    // Filter deterministically
    const filtered = MOCK_RECIPES.filter((r) => r.title.toLowerCase().includes(q));
    // Simple paging (page size 50 to effectively no-op here but deterministic)
    const pageSize = 50;
    const start = (page - 1) * pageSize;
    const results = filtered.slice(start, start + pageSize).map((r, i) => normalizeListItem(r, i));
    return res(ctx.status(200), ctx.json(results));
  }),

  rest.get(pathFor('/recipes/:id'), (req, res, ctx) => {
    const { id } = req.params;
    const found = MOCK_RECIPES.find((r) => r.id === id);
    if (!found) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Recipe not found' })
      );
    }
    return res(ctx.status(200), ctx.json(found));
  }),
];
