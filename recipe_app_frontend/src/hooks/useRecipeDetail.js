import { useEffect, useState } from 'react';
import { getRecipeDetail } from '../api/client';

// PUBLIC_INTERFACE
export function useRecipeDetail(id) {
  /** Load recipe details by id and expose loading and error state. */
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError('');
    getRecipeDetail(id)
      .then((r) => {
        if (mounted) setRecipe(r);
      })
      .catch((err) => {
        // In practice getRecipeDetail falls back to mock; this captures unexpected failures.
        const msg = err?.friendlyMessage || err?.message || 'Unable to load recipe.';
        if (mounted) setError(msg);
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
