import React from 'react';
import RecipeCard from './RecipeCard';

// PUBLIC_INTERFACE
export default function RecipeGrid({ recipes, onOpen }) {
  /** Responsive recipe grid rendering a set of RecipeCard components. */
  if (!recipes?.length) {
    return (
      <div className="empty">
        No recipes found. Try another search term like "pasta" or "soup".
      </div>
    );
  }
  return (
    <div className="grid">
      {recipes.map((r) => (
        <div key={r.id} className="col-4 lg-col-4 sm-col-4">
          <RecipeCard recipe={r} onOpen={() => onOpen?.(r)} />
        </div>
      ))}
    </div>
  );
}
