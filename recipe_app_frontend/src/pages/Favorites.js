import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { navigate } from '../RouterApp';

// PUBLIC_INTERFACE
export default function FavoritesPage() {
  /** Full-page Favorites view rendering saved recipes in a responsive grid with remove and open actions. */
  const { favorites, removeFavorite } = useFavorites();

  const openRecipe = (r) => {
    navigate(`/recipe/${encodeURIComponent(r.id)}`);
  };

  const goBack = () => navigate('/home');

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
          <h1 style={{ margin: 0, fontSize: 18, letterSpacing: 0.2 }}>Your Favorites</h1>
        </div>
        <button className="btn btn-secondary" onClick={goBack} aria-label="Back to Browse">
          Back to Browse
        </button>
      </div>

      {/* Empty state */}
      {!favorites.length && (
        <div className="empty" role="status">
          You haven't added any favorite recipes yet.
        </div>
      )}

      {/* Grid of favorites */}
      {!!favorites.length && (
        <div className="grid" role="list">
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
                  <div className="card-meta">
                    <span className="badge">⏱ {r.readyInMinutes ?? 30}m</span>
                    <span className="badge">🍽 {r.servings ?? 2}</span>
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
