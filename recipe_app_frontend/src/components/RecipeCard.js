import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { navigate } from '../RouterApp';

// PUBLIC_INTERFACE
function RecipeCardBase({ recipe, onOpen }) {
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
      className="card focus-ring"
      onClick={openDetail}
      onKeyDown={onKeyActivate}
      role="listitem"
      aria-label={`Recipe card: ${recipe.title}`}
      data-testid="recipe-card"
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
            type="button"
            className="btn btn-primary focus-ring"
            onClick={(e) => {
              e.stopPropagation();
              openDetail();
            }}
            aria-label={`View recipe ${recipe.title}`}
          >
            View
          </button>
          <button
            type="button"
            className={`icon-btn focus-ring ${fav ? 'danger' : ''}`}
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

// PUBLIC_INTERFACE
const RecipeCard = React.memo(RecipeCardBase, (prev, next) => {
  // Shallow compare key fields to prevent re-render unless recipe identity/fields or onOpen ref change
  const a = prev.recipe;
  const b = next.recipe;
  const sameRecipe =
    a === b ||
    (a?.id === b?.id &&
      a?.title === b?.title &&
      a?.image === b?.image &&
      a?.readyInMinutes === b?.readyInMinutes &&
      a?.servings === b?.servings);
  const sameOnOpen = prev.onOpen === next.onOpen;
  return sameRecipe && sameOnOpen;
});

export default RecipeCard;
