import React from 'react';
import RecipeCard from './RecipeCard';

// PUBLIC_INTERFACE
export default function RecipeGrid({ recipes, onOpen }) {
  /** Responsive recipe grid rendering a set of RecipeCard components. */
  if (!recipes?.length) {
    return (
      <div className="empty" role="status" aria-live="polite">
        No recipes found. Try another search term like “pasta”, “soup”, or “salad”.
      </div>
    );
  }
  return (
    <div className="grid" role="list" aria-label="Recipe results">
      {recipes.map((r) => (
        <div key={r.id} className="col-4 lg-col-4 sm-col-4">
          <RecipeCard recipe={r} onOpen={onOpen ? () => onOpen(r) : undefined} />
        </div>
      ))}
    </div>
  );
}
