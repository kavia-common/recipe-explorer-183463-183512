import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { navigate } from '../RouterApp';

// PUBLIC_INTERFACE
export default function FavoritesPage() {
  /** Full-page Favorites view rendering saved recipes in a responsive grid with remove, clear-all, and open actions. */
  const { favorites, removeFavorite, clearFavorites, favoritesCount } = useFavorites();

  const openRecipe = (r) => {
    navigate(`/recipe/${encodeURIComponent(r.id)}`);
  };

  const goBack = () => navigate('/home');

  const hasFavorites = Array.isArray(favorites) && favorites.length > 0;

  return (
    <div className="content" aria-label="Favorites Page">
      {/* Page Header - Ocean Professional styling */}
      <div
        className="surface shadow-sm rounded"
        style={{
          padding: 12,
          marginBottom: 14,
          border: '1px solid rgba(17,24,39,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background:
            'linear-gradient(180deg, rgba(37,99,235,0.05), rgba(255,255,255,1))'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" aria-hidden="true">★</span>
          <h1 style={{ margin: 0, fontSize: 18, letterSpacing: 0.2 }}>
            Your Favorites{typeof favoritesCount === 'number' ? ` (${favoritesCount})` : ''}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {hasFavorites && (
            <button
              className="icon-btn danger focus-ring"
              onClick={clearFavorites}
              title="Clear all favorites"
              aria-label="Clear all favorites"
            >
              Clear All
            </button>
          )}
          <button className="btn btn-secondary" onClick={goBack} aria-label="Back to Browse">
            Back to Browse
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!hasFavorites && (
        <div
          className="empty"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="No favorites yet"
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>No favorites yet</div>
          <div style={{ marginBottom: 10 }}>
            Save recipes you love and they will appear here.
          </div>
          <button
            className="btn btn-primary focus-ring"
            onClick={goBack}
            aria-label="Browse recipes to add favorites"
          >
            Browse Recipes
          </button>
        </div>
      )}

      {/* Grid of favorites */}
      {hasFavorites && (
        <div className="grid" role="list" aria-label="Favorite recipes">
          {favorites.map((r) => (
            <div key={r.id} className="col-4 lg-col-4 sm-col-4" role="listitem">
              <article className="card" aria-label={`Favorite recipe: ${r.title}`}>
                <div className="card-image">
                  <img
                    src={
                      r.image ||
                      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop'
                    }
                    alt={r.title}
                  />
                </div>
                <div className="card-body">
                  <div className="card-title" title={r.title}>{r.title}</div>
                  <div className="card-meta" aria-label="Recipe metadata">
                    <span className="badge" aria-label={`Ready in ${r.readyInMinutes ?? 30} minutes`}>⏱ {r.readyInMinutes ?? 30}m</span>
                    <span className="badge" aria-label={`Serves ${r.servings ?? 2}`}>🍽 {r.servings ?? 2}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => openRecipe(r)}
                      aria-label={`Open recipe ${r.title}`}
                    >
                      Open
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => removeFavorite(r.id)}
                      title="Remove from favorites"
                      aria-label={`Remove ${r.title} from favorites`}
                    >
                      🗑 Remove
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
