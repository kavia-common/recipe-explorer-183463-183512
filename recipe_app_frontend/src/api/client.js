const BASE =
  process.env.REACT_APP_API_BASE?.trim() ||
  process.env.REACT_APP_BACKEND_URL?.trim() ||
  '';

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

// PUBLIC_INTERFACE
export async function searchRecipes(query = '') {
  /** Search recipes by query; uses live API when configured and reachable, else uses mock data. */
  if (!BASE) {
    // no API configured; filter mock
    return mockRecipes.filter((r) =>
      r.title.toLowerCase().includes(query.trim().toLowerCase())
    );
  }
  const url = new URL('/recipes', BASE);
  if (query) url.searchParams.set('q', query);
  try {
    const res = await withTimeout(fetch(url.toString(), { headers: { 'Accept': 'application/json' } }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // Expect array of recipes, normalize keys
    return (json || []).map((r, idx) => ({
      id: r.id ?? String(idx),
      title: r.title ?? r.name ?? 'Recipe',
      image: r.image ?? r.thumbnail ?? '',
      readyInMinutes: r.readyInMinutes ?? r.time ?? r.duration ?? 30,
      servings: r.servings ?? r.yield ?? 2
    }));
  } catch (e) {
    // Fallback to mock on error
    return mockRecipes.filter((r) =>
      r.title.toLowerCase().includes(query.trim().toLowerCase())
    );
  }
}

// PUBLIC_INTERFACE
export async function getRecipeDetail(id) {
  /** Get single recipe details; prefers API, falls back to mock by id. */
  if (!BASE) return mockRecipes.find((r) => r.id === id) || mockRecipes[0];
  const url = new URL(`/recipes/${encodeURIComponent(id)}`, BASE);
  try {
    const res = await withTimeout(fetch(url.toString(), { headers: { 'Accept': 'application/json' } }));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const r = await res.json();
    return {
      id: r.id ?? id,
      title: r.title ?? r.name ?? 'Recipe',
      image: r.image ?? r.thumbnail ?? '',
      readyInMinutes: r.readyInMinutes ?? r.time ?? r.duration ?? 30,
      servings: r.servings ?? r.yield ?? 2,
      ingredients: r.ingredients ?? r.ingredientLines ?? [],
      instructions: Array.isArray(r.instructions) ? r.instructions : (typeof r.instructions === 'string' ? r.instructions.split(/\.\s+/) : [])
    };
  } catch {
    return mockRecipes.find((r) => r.id === id) || mockRecipes[0];
  }
}
