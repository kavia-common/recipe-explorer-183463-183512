import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { navigate } from '../RouterApp';

// PUBLIC_INTERFACE
export default function FavoritesPanel({ open, onClose, onOpenRecipe }) {
  /** Right-side drawer that lists favorite recipes with quick actions. */
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

  if (!open) return null;

  const openRecipe = (r) => {
    if (onOpenRecipe) onOpenRecipe(r);
    else navigate(`/recipe/${encodeURIComponent(r.id)}`);
  };

  return (
    <aside className="fav-drawer" aria-label="Favorites panel">
      <div className="fav-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>★ Favorites</span>
          <div>
            {!!favorites.length && (
              <button className="icon-btn danger" onClick={clearFavorites} title="Clear all favorites">
                Clear
              </button>
            )}
            <button className="icon-btn" onClick={onClose} title="Close">✖</button>
          </div>
        </div>
      </div>
      <div className="fav-body">
        {!favorites.length && <div className="empty">Your favorite recipes will appear here.</div>}
        {favorites.map((r) => (
          <div className="card" key={r.id} style={{ display: 'grid', gridTemplateColumns: '72px 1fr auto' }}>
            <div className="card-image" style={{ paddingTop: 0, height: 72 }}>
              <img src={r.image} alt={r.title} />
            </div>
            <div className="card-body" style={{ padding: 10 }}>
              <div className="card-title" style={{ fontSize: 14 }}>{r.title}</div>
              <div className="card-meta">
                <span>⏱ {r.readyInMinutes ?? 30}m</span>
                <span>🍽 {r.servings ?? 2}</span>
              </div>
            </div>
            <div style={{ display: 'grid', alignItems: 'center', paddingRight: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn" onClick={() => openRecipe(r)} style={{ padding: '8px 10px' }}>
                  View
                </button>
                <button className="icon-btn danger" onClick={() => removeFavorite(r.id)} title="Remove">🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
