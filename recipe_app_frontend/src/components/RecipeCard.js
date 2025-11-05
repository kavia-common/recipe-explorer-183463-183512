import React from 'react';
import { useFavorites } from '../context/FavoritesContext';

// PUBLIC_INTERFACE
export default function RecipeCard({ recipe, onOpen }) {
  /** Card showing a recipe with image, title, time, and favorite action. */
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const fav = isFavorite(recipe.id);

  const toggleFav = (e) => {
    e.stopPropagation();
    if (fav) removeFavorite(recipe.id);
    else addFavorite(recipe);
  };

  const img = recipe.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop';

  return (
    <article className="card" onClick={() => onOpen?.(recipe)} role="button" tabIndex={0}>
      <div className="card-image">
        <img src={img} alt={recipe.title} />
      </div>
      <div className="card-body">
        <div className="card-title">{recipe.title}</div>
        <div className="card-meta">
          <span className="badge">⏱ {recipe.readyInMinutes ?? 30}m</span>
          <span className="badge">🍽 {recipe.servings ?? 2}</span>
        </div>
        <div className="card-actions">
          <button className="btn" onClick={(e) => { e.stopPropagation(); onOpen?.(recipe); }}>View</button>
          <button
            className={`icon-btn ${fav ? 'danger' : ''}`}
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            title={fav ? 'Remove from favorites' : 'Add to favorites'}
            onClick={toggleFav}
          >
            {fav ? '★ Remove' : '☆ Favorite'}
          </button>
        </div>
      </div>
    </article>
  );
}
