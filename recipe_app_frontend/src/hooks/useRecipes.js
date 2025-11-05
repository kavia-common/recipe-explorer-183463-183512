import { useEffect, useMemo, useRef, useState } from 'react';
import { searchRecipes } from '../api/client';
import { debounce, DEFAULT_DEBOUNCE_DELAY } from '../utils/debounce';

// PUBLIC_INTERFACE
export function useRecipes(initialQuery = '', { debounceMs = DEFAULT_DEBOUNCE_DELAY } = {}) {
  /** Manage listing recipes with query, loading, and error states. */
  const [query, setQuery] = useState(initialQuery);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performSearchImmediate = async (q) => {
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

  // Debounced search function reference for callers that want throttled behavior
  const debouncedRef = useRef(null);
  const performSearch = useMemo(() => {
    const d = debounce(performSearchImmediate, typeof debounceMs === 'number' ? debounceMs : DEFAULT_DEBOUNCE_DELAY);
    debouncedRef.current = d;
    // Return both immediate and debounced behavior through same function
    const wrapper = (q, { immediate = false } = {}) => {
      return immediate ? performSearchImmediate(q) : d(q);
    };
    return wrapper;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceMs, query]);

  useEffect(() => {
    // initial load is immediate to show results promptly
    performSearchImmediate(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    query,
    setQuery,
    recipes,
    loading,
    error,
    // PUBLIC_INTERFACE
    search: performSearch,
  };
}
