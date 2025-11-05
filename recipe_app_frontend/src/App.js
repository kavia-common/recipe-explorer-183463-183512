import React, { useState } from 'react';
import './theme.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import RecipeGrid from './components/RecipeGrid';
import RecipeDetail from './components/RecipeDetail';
import FavoritesPanel from './components/FavoritesPanel';
import { FavoritesProvider } from './context/FavoritesContext';
import { useRecipes } from './hooks/useRecipes';

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
            search(q);
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

// PUBLIC_INTERFACE
export default function App() {
  /** App root wrapped with FavoritesProvider for state management. */
  return (
    <FavoritesProvider>
      <HomeApp />
    </FavoritesProvider>
  );
}
