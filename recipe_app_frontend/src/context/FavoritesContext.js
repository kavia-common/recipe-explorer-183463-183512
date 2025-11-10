import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

/**
 * Favorites state is a list of recipe summary objects:
 * { id, title, image, readyInMinutes, servings }
 */
const KEY = 'recipe_favorites_v1';

const FavoritesContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return Array.isArray(action.payload) ? action.payload : [];
    case 'ADD': {
      const item = action.payload;
      if (!item || !item.id) return state;
      if (state.find((r) => r.id === item.id)) return state;
      return [item, ...state];
    }
    case 'REMOVE':
      return state.filter((r) => r.id !== action.payload);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function FavoritesProvider({ children }) {
  /**
   * Provides favorites state persisted in localStorage to the app.
   * Exposes utilities: addFavorite, removeFavorite, isFavorite, listFavorites, clearFavorites,
   * and a memoized selector favoritesCount for lightweight header display.
   */
  const [state, dispatch] = useReducer(reducer, []);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: 'INIT', payload: parsed });
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  // Derivations and stable API surface
  const api = useMemo(() => {
    // PUBLIC_INTERFACE
    const listFavorites = () => state.slice(); // shallow copy for safety
    // PUBLIC_INTERFACE
    const isFavorite = (id) => state.some((r) => r.id === id);
    // PUBLIC_INTERFACE
    const addFavorite = (recipe) => dispatch({ type: 'ADD', payload: recipe });
    // PUBLIC_INTERFACE
    const removeFavorite = (id) => dispatch({ type: 'REMOVE', payload: id });
    // PUBLIC_INTERFACE
    const clearFavorites = () => dispatch({ type: 'CLEAR' });

    // Memoized selector value for header badge
    const favoritesCount = state.length;

    return {
      favorites: state,
      favoritesCount,
      listFavorites,
      isFavorite,
      addFavorite,
      removeFavorite,
      clearFavorites,
    };
  }, [state]);

  return <FavoritesContext.Provider value={api}>{children}</FavoritesContext.Provider>;
}

// PUBLIC_INTERFACE
export function useFavorites() {
  /** Hook to access favorites context api and selectors. Must be used within FavoritesProvider. */
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
