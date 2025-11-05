import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { navigate } from '../RouterApp';

// PUBLIC_INTERFACE
export default function RecipeCard({ recipe, onOpen }) {
  /** Card showing a recipe with image, title, time, and favorite action. */
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const fav = isFavorite(recipe.id);

  const openDetail = () => {
    if (onOpen) onOpen(recipe);
    else navigate(`/recipe/${encodeURIComponent(recipe.id)}`);
  };

  const onKeyActivate = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetail();
    }
  };

  const toggleFav = (e) => {
    e.stopPropagation();
    if (fav) removeFavorite(recipe.id);
    else addFavorite(recipe);
  };

  const img =
    recipe.image ||
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop';

  return (
    <article
      className="card"
      onClick={openDetail}
      onKeyDown={onKeyActivate}
      role="listitem"
      aria-label={`Recipe card: ${recipe.title}`}
      tabIndex={0}
    >
      <div className="card-image">
        <img src={img} alt={recipe.title} />
      </div>
      <div className="card-body">
        <div className="card-title">{recipe.title}</div>
        <div className="card-meta" aria-label="Recipe metadata">
          <span className="badge" aria-label={`Ready in ${recipe.readyInMinutes ?? 30} minutes`}>
            ⏱ {recipe.readyInMinutes ?? 30}m
          </span>
          <span className="badge" aria-label={`Serves ${recipe.servings ?? 2}`}>
            🍽 {recipe.servings ?? 2}
          </span>
        </div>
        <div className="card-actions">
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              openDetail();
            }}
            aria-label={`View recipe ${recipe.title}`}
          >
            View
          </button>
          <button
            className={`icon-btn ${fav ? 'danger' : ''}`}
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={fav}
            title={fav ? 'Remove from favorites' : 'Add to favorites'}
            onClick={toggleFav}
            onKeyDown={(e) => {
              if (e.key === ' ') {
                e.preventDefault();
                toggleFav(e);
              }
            }}
          >
            {fav ? '★ Remove' : '☆ Favorite'}
          </button>
        </div>
      </div>
    </article>
  );
}
