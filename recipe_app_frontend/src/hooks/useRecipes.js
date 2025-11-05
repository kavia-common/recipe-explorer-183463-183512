import { useEffect, useState } from 'react';
import { searchRecipes } from '../api/client';

// PUBLIC_INTERFACE
export function useRecipes(initialQuery = '') {
  /** Manage listing recipes with query and loading states. */
  const [query, setQuery] = useState(initialQuery);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (q) => {
    setLoading(true);
    try {
      const data = await searchRecipes(q ?? query);
      setRecipes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { query, setQuery, recipes, loading, search: performSearch };
}
