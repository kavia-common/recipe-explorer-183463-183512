import React from 'react';

// PUBLIC_INTERFACE
export default function Header({ onOpenFavorites, children }) {
  /** App header with brand and action buttons. */
  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="brand" aria-label="Recipe Explorer Home">
          <div className="brand-icon">Rx</div>
          <div className="brand-text">Recipe Explorer</div>
        </a>
        {children}
        <div className="header-actions">
          <button className="btn secondary" onClick={onOpenFavorites} aria-label="Open favorites">
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
