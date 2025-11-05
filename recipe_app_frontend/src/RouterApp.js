import React from 'react';
import { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import RecipeGrid from './components/RecipeGrid';
import RecipeDetail from './components/RecipeDetail';
import FavoritesPanel from './components/FavoritesPanel';
import { FavoritesProvider } from './context/FavoritesContext';
import { useRecipes } from './hooks/useRecipes';
import SignIn from './pages/SignIn';

// Lightweight router without extra dependencies
function useHashRoute() {
  const [path, setPath] = useState(() => window.location.hash.replace(/^#/, '') || '/');
  React.useEffect(() => {
    const onHashChange = () => setPath(window.location.hash.replace(/^#/, '') || '/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return [path, (p) => { window.location.hash = p; }];
}

function HomeApp() {
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
export default function RouterApp() {
  /** Minimal hash-based router with / and /signin routes without adding dependencies. */
  const [route] = useHashRoute();

  if (route === '/signin') {
    return <SignIn />;
  }
  return (
    <FavoritesProvider>
      <HomeApp />
    </FavoritesProvider>
  );
}
