import { useEffect, useState } from 'react';
import { getRecipeDetail } from '../api/client';

/**
 * PUBLIC_INTERFACE
 */
// PUBLIC_INTERFACE
export function useRecipeDetail(id) {
  /** Load recipe details by id using the API client with consistent loading and error states. */
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Do not fetch when id is falsy
    if (!id) {
      setRecipe(null);
      setLoading(false);
      setError('');
      return;
    }
    let mounted = true;
    setLoading(true);
    setError('');

    getRecipeDetail(id)
      .then((r) => {
        if (!mounted) return;
        setRecipe(r || null);
      })
      .catch((err) => {
        // In practice the client falls back to mock on network/5xx; still surface unexpected failures
        const msg = err?.friendlyMessage || err?.message || 'Unable to load recipe.';
        if (!mounted) return;
        setError(msg);
        setRecipe(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return { recipe, loading, error };
}
