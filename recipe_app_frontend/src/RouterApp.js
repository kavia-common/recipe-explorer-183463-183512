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
  // Normalize to always have a leading "/" in our hash path
  const normalize = () => {
    const raw = window.location.hash.replace(/^#/, '') || '/';
    return raw.startsWith('/') ? raw : `/${raw}`;
  };
  const [path, setPath] = useState(normalize);
  React.useEffect(() => {
    const onHashChange = () => setPath(normalize());
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
  /**
   * Minimal hash-based router with three routes:
   * - '/' and '/signin' render the pixel-perfect Figma Sign In screen
   * - '/home' renders the original recipe explorer
   * This keeps Sign In as default landing while preserving access to Home.
   */
  const [route] = useHashRoute();

  if (route === '/' || route === '/signin') {
    return <SignIn />;
  }

  if (route === '/home') {
    return (
      <FavoritesProvider>
        <HomeApp />
      </FavoritesProvider>
    );
  }

  // Fallback: redirect unknown paths to Sign In
  return <SignIn />;
}
