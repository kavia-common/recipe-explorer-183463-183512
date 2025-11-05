import React, { useEffect, useRef } from 'react';
import { useRecipeDetail } from '../hooks/useRecipeDetail';
import { useFavorites } from '../context/FavoritesContext';

// PUBLIC_INTERFACE
export default function RecipeDetail({ id, onClose }) {
  /**
   * Modal-like detail view showing ingredients and instructions.
   * This component is route-driven: it renders when route is /recipe/:id and closes via navigation back to /home.
   */
  const { recipe, loading, error } = useRecipeDetail(id);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    // Focus the close button for keyboard users when opened
    const el = panelRef.current?.querySelector('#detailCloseBtn');
    el?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [id, onClose]);

  const toggleFav = () => {
    if (!recipe) return;
    if (isFavorite(recipe.id)) removeFavorite(recipe.id);
    else
      addFavorite({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
      });
  };

  if (!id) return null;

  return (
    <div
      className="detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-detail-title"
      aria-describedby={loading ? 'recipe-detail-loading' : undefined}
      aria-label="Recipe details"
    >
      <div className="detail-panel" ref={panelRef}>
        <div className="detail-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge" aria-hidden="true">Details</span>
            <strong id="recipe-detail-title">{recipe?.title || 'Loading...'}</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary focus-ring"
              onClick={toggleFav}
              aria-pressed={recipe ? !!isFavorite(recipe.id) : false}
              aria-label={recipe && isFavorite(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {recipe && isFavorite(recipe.id) ? '★ In Favorites' : '☆ Add Favorite'}
            </button>
            <button
              type="button"
              id="detailCloseBtn"
              className="icon-btn focus-ring"
              onClick={onClose}
              aria-label="Close details"
              title="Close details"
            >
              ✖
            </button>
          </div>
        </div>
        <div className="detail-body">
          {error && (
            <div
              role="alert"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#991b1b',
                padding: 10,
                borderRadius: 10,
                marginBottom: 8,
              }}
            >
              {error}
            </div>
          )}
          {loading && (
            <div id="recipe-detail-loading" className="empty" role="status" aria-live="polite" aria-busy="true">
              <span className="spinner" aria-hidden="true">⏳</span> Loading recipe...
            </div>
          )}
          {!loading && recipe && (
            <>
              <div className="grid">
                <div className="col-6 lg-col-8 sm-col-4">
                  <div className="card">
                    <div className="card-image">
                      <img src={recipe.image} alt={recipe.title} />
                    </div>
                    <div className="card-body">
                      <div className="chips">
                        <span className="chip" aria-label={`Ready in ${recipe.readyInMinutes} minutes`}>
                          ⏱ {recipe.readyInMinutes} minutes
                        </span>
                        <span className="chip" aria-label={`Serves ${recipe.servings} people`}>
                          🍽 {recipe.servings} servings
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-6 lg-col-8 sm-col-4">
                  <section aria-labelledby="ingredientsTitle">
                    <div id="ingredientsTitle" className="section-title">Ingredients</div>
                    <ul>
                      {(recipe.ingredients || []).map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </section>
                  <hr className="divider" />
                  <section aria-labelledby="instructionsTitle">
                    <div id="instructionsTitle" className="section-title">Instructions</div>
                    <ol>
                      {(recipe.instructions || []).map((step, i) => (
                        <li key={i} style={{ marginBottom: 6 }}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
