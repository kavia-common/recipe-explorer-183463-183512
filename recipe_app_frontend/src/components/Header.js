import React from 'react';
import { navigate } from '../RouterApp';

// PUBLIC_INTERFACE
export default function Header({ onOpenFavorites, onNavigateHome, children }) {
  /** App header with brand and action buttons. */
  const goHome = () => {
    if (onNavigateHome) onNavigateHome();
    else navigate('/home');
  };

  const openFav = () => {
    if (onOpenFavorites) onOpenFavorites();
    else navigate('/favorites');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <button
          type="button"
          className="brand"
          aria-label="Recipe Explorer Home"
          onClick={goHome}
          style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
        >
          <div className="brand-icon">Rx</div>
          <div className="brand-text">Recipe Explorer</div>
        </button>
        {children}
        <div className="header-actions">
          <button className="btn secondary" onClick={openFav} aria-label="Open favorites">
            ★ Favorites
          </button>
          <a
            className="icon-btn"
            href="https://reactjs.org"
            target="_blank"
            rel="noreferrer"
            aria-label="Learn React"
            title="Learn React"
          >
            ℹ️
          </a>
        </div>
      </div>
    </header>
  );
}
