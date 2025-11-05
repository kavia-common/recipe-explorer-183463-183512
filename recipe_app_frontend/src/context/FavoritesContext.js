import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const KEY = 'recipe_favorites_v1';

const FavoritesContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload || [];
    case 'ADD':
      if (state.find((r) => r.id === action.payload.id)) return state;
      return [action.payload, ...state];
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
  /** Provides favorites state persisted in localStorage to the app. */
  const [state, dispatch] = useReducer(reducer, []);

  // load initial
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: 'INIT', payload: JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const api = useMemo(() => ({
    favorites: state,
    addFavorite: (recipe) => dispatch({ type: 'ADD', payload: recipe }),
    removeFavorite: (id) => dispatch({ type: 'REMOVE', payload: id }),
    clearFavorites: () => dispatch({ type: 'CLEAR' }),
    isFavorite: (id) => state.some((r) => r.id === id)
  }), [state]);

  return (
    <FavoritesContext.Provider value={api}>
      {children}
    </FavoritesContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useFavorites() {
  /** Hook to access favorites context api. */
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
