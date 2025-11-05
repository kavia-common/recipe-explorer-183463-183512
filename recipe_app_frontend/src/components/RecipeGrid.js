import React, { useMemo } from 'react';
import RecipeCard from './RecipeCard.js';

// PUBLIC_INTERFACE
function RecipeGridBase({ recipes, onOpen }) {
  /** Responsive recipe grid rendering a set of RecipeCard components. */

  // Build a stable map of open callbacks keyed by id to avoid re-creating closures on each render.
  // Hooks must run unconditionally; compute even for empty array (cheap).
  const openHandlers = useMemo(() => {
    if (!onOpen || !Array.isArray(recipes)) return null;
    const map = new Map();
    for (const r of recipes) {
      map.set(r.id, () => onOpen(r));
    }
    return map;
  }, [onOpen, recipes]);

  if (!recipes?.length) {
    return (
      <div className="empty" role="status" aria-live="polite">
        No recipes found. Try another search term like “pasta”, “soup”, or “salad”.
      </div>
    );
  }

  return (
    <div id="recipe-results" className="grid" role="list" aria-label="Recipe results">
      {recipes.map((r) => (
        <div key={r.id} className="col-4 lg-col-4 sm-col-4">
          <RecipeCard recipe={r} onOpen={openHandlers ? openHandlers.get(r.id) : undefined} />
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
const RecipeGrid = React.memo(RecipeGridBase, (prev, next) => {
  // Re-render only when recipes array reference changes or onOpen reference changes
  return prev.recipes === next.recipes && prev.onOpen === next.onOpen;
});

export default RecipeGrid;
