import React from 'react';
import { render } from '@testing-library/react';
import { FavoritesProvider } from './context/FavoritesContext.js';
import { AuthProvider } from './context/AuthContext.js';

// PUBLIC_INTERFACE
export function renderWithProviders(ui, { withAuth = true, withFavorites = true } = {}) {
  /** Render a component wrapped with default providers for tests. */
  let tree = ui;
  if (withFavorites) {
    tree = <FavoritesProvider>{tree}</FavoritesProvider>;
  }
  if (withAuth) {
    tree = <AuthProvider>{tree}</AuthProvider>;
  }
  return render(tree);
}

// PUBLIC_INTERFACE
export function setHash(path) {
  /** Programmatically update hash for hash-based routing tests and dispatch event. */
  const normalized = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : `/${path}`}`;
  window.location.hash = normalized;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

// PUBLIC_INTERFACE
export function clearLocalStorage() {
  /** Helper to clear localStorage across tests. */
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
}
