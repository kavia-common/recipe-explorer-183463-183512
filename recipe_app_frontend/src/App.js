import React, { useState } from 'react';
import './theme.css';
import Header from './components/Header.js';
import SearchBar from './components/SearchBar.js';
import RecipeGrid from './components/RecipeGrid.js';
import RecipeDetail from './components/RecipeDetail.js';
import FavoritesPanel from './components/FavoritesPanel.js';
import { FavoritesProvider } from './context/FavoritesContext.js';
import { useRecipes } from './hooks/useRecipes.js';

// PUBLIC_INTERFACE
function HomeApp() {
  /** Main Recipe Explorer page with search, grid, detail, and favorites. */
  const { query, setQuery, recipes, loading, search } = useRecipes('');
  const [selected, setSelected] = useState(null);
  const [openFav, setOpenFav] = useState(false);

  const openDetail = (r) => setSelected(r?.id);
  const closeDetail = () => setSelected(null);

  return (
    <div className="app-shell">
      <Header onOpenFavorites={() => setOpenFav(true)}>
        <SearchBar
          defaultValue={query}
          onSearch={(q) => {
            setQuery(q);
            // Submit invokes immediate search; typing is debounced inside SearchBar
            search(q, { immediate: true });
          }}
        />
      </Header>

      <main className="content">
        {loading && <div className="empty">Loading recipes...</div>}
        {!loading && <RecipeGrid recipes={recipes} onOpen={openDetail} />}
      </main>

      <RecipeDetail id={selected} onClose={closeDetail} />
      <FavoritesPanel
        open={openFav}
        onClose={() => setOpenFav(false)}
        onOpenRecipe={(r) => {
          setOpenFav(false);
          openDetail(r);
        }}
      />
    </div>
  );
}

/* Kept for backwards compatibility; RouterApp is the entry via index.js when using hash routes. */
// PUBLIC_INTERFACE
export default function App() {
  /** App root wrapped with FavoritesProvider for state management. */
  return (
    <FavoritesProvider>
      <HomeApp />
    </FavoritesProvider>
  );
}
