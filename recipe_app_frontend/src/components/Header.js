import React from 'react';
import { navigate } from '../RouterApp.js';
import { useAuth } from '../context/AuthContext.js';

// PUBLIC_INTERFACE
export default function Header({ onOpenFavorites, onNavigateHome, children }) {
  /** App header with brand and action buttons. */
  const { signOut } = useAuth();

  const goHome = () => {
    if (onNavigateHome) onNavigateHome();
    else navigate('/home');
  };

  const openFav = () => {
    if (onOpenFavorites) onOpenFavorites();
    else navigate('/favorites');
  };

  const onSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <button
          type="button"
          className="brand focus-ring"
          aria-label="Recipe Explorer Home"
          onClick={goHome}
        >
          <div className="brand-icon">Rx</div>
          <div className="brand-text">Recipe Explorer</div>
        </button>
        {children}
        <div className="header-actions" role="group" aria-label="Header actions">
          <a
            className="btn btn-secondary focus-ring"
            href="#/favorites"
            onClick={(e) => { e.preventDefault(); openFav(); }}
            aria-label="Open favorites"
            role="button"
          >
            ★ Favorites
          </a>
          <button
            type="button"
            className="icon-btn focus-ring"
            onClick={onSignOut}
            aria-label="Sign out"
            title="Sign out"
          >
            🚪
          </button>
          <a
            className="icon-btn focus-ring"
            href="https://reactjs.org"
            target="_blank"
            rel="noreferrer"
            aria-label="Learn React"
            title="Learn React"
            role="button"
          >
            ℹ️
          </a>
        </div>
      </div>
    </header>
  );
}
