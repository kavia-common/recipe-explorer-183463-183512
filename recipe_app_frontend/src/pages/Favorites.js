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

  return (
    <div className="content" aria-label="Favorites Page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge">★</span>
          <h1 style={{ margin: 0, fontSize: 18 }}>Your Favorites</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/home')}>Back to Browse</button>
      </div>

      {!favorites.length && (
        <div className="empty">You haven't added any favorite recipes yet.</div>
      )}

      {!!favorites.length && (
        <div className="grid">
          {favorites.map((r) => (
            <div key={r.id} className="col-4 lg-col-4 sm-col-4">
              <article className="card">
                <div className="card-image">
                  <img src={r.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop'} alt={r.title} />
                </div>
                <div className="card-body">
                  <div className="card-title">{r.title}</div>
                  <div className="card-meta">
                    <span className="badge">⏱ {r.readyInMinutes ?? 30}m</span>
                    <span className="badge">🍽 {r.servings ?? 2}</span>
                  </div>
                  <div className="card-actions">
                    <button className="btn btn-primary" onClick={() => openRecipe(r)}>Open</button>
                    <button className="icon-btn danger" onClick={() => removeFavorite(r.id)} title="Remove from favorites" aria-label="Remove from favorites">
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
