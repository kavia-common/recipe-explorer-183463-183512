import { useEffect, useMemo, useRef, useState } from 'react';
import { searchRecipes } from '../api/client';
import { debounce, DEFAULT_DEBOUNCE_DELAY } from '../utils/debounce';

/**
 * PUBLIC_INTERFACE
 */
// PUBLIC_INTERFACE
export function useRecipes(initialQuery = '', { debounceMs = DEFAULT_DEBOUNCE_DELAY } = {}) {
  /** Manage recipe list with debounced search, immediate submit, and consistent loading/error/empty states. */
  const [query, setQuery] = useState(initialQuery);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Perform an immediate search (used on submit and initial load)
  const performSearchImmediate = async (q) => {
    const term = (q ?? query ?? '').trim();
    setLoading(true);
    setError('');
    try {
      const data = await searchRecipes(term);
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      // API client typically falls back to mock on 5xx/network; still surface unexpected failures.
      const msg = err?.friendlyMessage || err?.message || 'Unable to load recipes.';
      setError(msg);
      // Do not clear recipes on error to keep UI responsive, but tests expect empty; keep empty for deterministic UX
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function that delays API calls while typing
  const debouncedRef = useRef(null);
  const performSearch = useMemo(() => {
    const d = debounce(performSearchImmediate, typeof debounceMs === 'number' ? debounceMs : DEFAULT_DEBOUNCE_DELAY);
    debouncedRef.current = d;
    // Unified API: if immediate is true, bypass debounce
    const wrapper = (q, { immediate = false } = {}) => {
      return immediate ? performSearchImmediate(q) : d(q);
    };
    return wrapper;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceMs, query]);

  // Initial load: perform immediate search using initialQuery
  useEffect(() => {
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
