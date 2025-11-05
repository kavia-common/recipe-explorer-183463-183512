import { useEffect, useState } from 'react';
import { getRecipeDetail } from '../api/client';

// PUBLIC_INTERFACE
export function useRecipeDetail(id) {
  /** Load recipe details by id and expose loading state. */
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRecipeDetail(id)
      .then(setRecipe)
      .finally(() => setLoading(false));
  }, [id]);

  return { recipe, loading };
}
