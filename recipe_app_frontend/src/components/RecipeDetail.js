import React from 'react';
import { useRecipeDetail } from '../hooks/useRecipeDetail';
import { useFavorites } from '../context/FavoritesContext';

// PUBLIC_INTERFACE
export default function RecipeDetail({ id, onClose }) {
  /**
   * Modal-like detail view showing ingredients and instructions.
   * This component is route-driven: it renders when route is /recipe/:id and closes via navigation back to /home.
   */
  const { recipe, loading } = useRecipeDetail(id);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const toggleFav = () => {
    if (!recipe) return;
    if (isFavorite(recipe.id)) removeFavorite(recipe.id);
    else addFavorite({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings
    });
  };

  if (!id) return null;

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true" aria-label="Recipe details">
      <div className="detail-panel">
        <div className="detail-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge">Details</span>
            <strong>{recipe?.title || 'Loading...'}</strong>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={toggleFav}>
              {recipe && isFavorite(recipe.id) ? '★ In Favorites' : '☆ Add Favorite'}
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Close">✖</button>
          </div>
        </div>
        <div className="detail-body">
          {loading && <div className="empty">Loading...</div>}
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
                        <span className="chip">⏱ {recipe.readyInMinutes} minutes</span>
                        <span className="chip">🍽 {recipe.servings} servings</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-6 lg-col-8 sm-col-4">
                  <section>
                    <div className="section-title">Ingredients</div>
                    <ul>
                      {(recipe.ingredients || []).map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </section>
                  <hr className="divider" />
                  <section>
                    <div className="section-title">Instructions</div>
                    <ol>
                      {(recipe.instructions || []).map((step, i) => (
                        <li key={i} style={{ marginBottom: 6 }}>{step}</li>
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
