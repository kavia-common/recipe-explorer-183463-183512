import { useEffect, useState } from 'react';
import { searchRecipes } from '../api/client';

// PUBLIC_INTERFACE
export function useRecipes(initialQuery = '') {
  /** Manage listing recipes with query, loading, and error states. */
  const [query, setQuery] = useState(initialQuery);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performSearch = async (q) => {
    const term = q ?? query;
    setLoading(true);
    setError('');
    try {
      const data = await searchRecipes(term);
      setRecipes(data);
    } catch (err) {
      // In current client, errors are swallowed with mock fallback; this is here for future parity.
      const msg = err?.friendlyMessage || err?.message || 'Unable to load recipes.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { query, setQuery, recipes, loading, error, search: performSearch };
}
