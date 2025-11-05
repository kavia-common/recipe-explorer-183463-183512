import React from 'react';
import { useMemo, useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import RecipeGrid from './components/RecipeGrid';
import RecipeDetail from './components/RecipeDetail';
import FavoritesPanel from './components/FavoritesPanel';
import { FavoritesProvider } from './context/FavoritesContext';
import { useRecipes } from './hooks/useRecipes';
import SignIn from './pages/SignIn';
import FavoritesPage from './pages/Favorites';
import { AuthProvider, useAuth } from './context/AuthContext';

/**
 * Simple hash router helpers
 */

// PUBLIC_INTERFACE
export function parseHash(hash = window.location.hash) {
  /** Parse window.location.hash into a pathname and params (supports /recipe/:id). */
  const raw = (hash || '').replace(/^#/, '') || '/';
  const pathname = raw.startsWith('/') ? raw : `/${raw}`;

  // routes:
  // /, /signin, /home, /favorites, /recipe/:id
  const parts = pathname.split('/').filter(Boolean);
  const route = {
    pathname,
    name: 'unknown',
    params: {}
  };

  if (pathname === '/' || pathname === '/signin') {
    route.name = 'signin';
  } else if (pathname === '/home') {
    route.name = 'home';
  } else if (pathname === '/favorites') {
    route.name = 'favorites';
  } else if (parts[0] === 'recipe' && parts[1]) {
    route.name = 'recipe';
    route.params.id = decodeURIComponent(parts[1]);
  }

  return route;
}

// PUBLIC_INTERFACE
export function navigate(path, { replace = false } = {}) {
  /** Programmatic navigation using location.hash, enabling deep-link/back support. */
  const normalized = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : `/${path}`}`;
  if (replace) {
    const newUrl = `${window.location.pathname}${normalized}`;
    window.history.replaceState(null, '', newUrl);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = normalized;
  }
}

function useHashRoute() {
  const normalize = () => parseHash(window.location.hash);
  const [route, setRoute] = useState(normalize);
  React.useEffect(() => {
    const onHashChange = () => setRoute(normalize());
    window.addEventListener('hashchange', onHashChange);
    // ensure default landing has a hash for SPA routing
    if (!window.location.hash) {
      navigate('/'); // default to SignIn
    }
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return route;
}

function HomeApp() {
  const { query, setQuery, recipes, loading, search } = useRecipes('');
  const route = useHashRoute();

  // open states are derived from route
  const selectedId = route.name === 'recipe' ? route.params.id : null;
  const favoritesOpen = route.name === 'favorites';

  const actions = useMemo(
    () => ({
      openFavorites: () => navigate('/favorites'),
      closeFavorites: () => navigate('/home'),
      openDetail: (r) => navigate(`/recipe/${encodeURIComponent(r?.id)}`),
      closeDetail: () => navigate('/home'),
      goHome: () => navigate('/home')
    }),
    []
  );

  return (
    <div className="app-shell">
      <Header
        onOpenFavorites={actions.openFavorites}
        onNavigateHome={actions.goHome}
      >
        <SearchBar
          defaultValue={query}
          onSearch={(q) => {
            setQuery(q);
            // Submit invokes immediate search; typing is debounced inside SearchBar
            search(q, { immediate: true });
          }}
        />
      </Header>

      <main className="content" role="main" aria-live="polite">
        {route.name === 'favorites' ? (
          <FavoritesPage />
        ) : (
          <>
            {loading && (
              <div id="recipes-loading" className="empty" role="status" aria-busy="true">
                <span className="spinner" aria-hidden="true">⏳</span> Loading recipes...
              </div>
            )}
            {!loading && (
              <RecipeGrid
                recipes={recipes}
                onOpen={(r) => actions.openDetail(r)}
              />
            )}
          </>
        )}
      </main>

      {/* Route-driven panels */}
      <RecipeDetail id={selectedId} onClose={actions.closeDetail} />
      <FavoritesPanel
        open={favoritesOpen}
        onClose={actions.closeFavorites}
        onOpenRecipe={(r) => {
          actions.openDetail(r);
        }}
      />
    </div>
  );
}

function GuardedRoutes() {
  const route = useHashRoute();
  const { user } = useAuth();

  // Unauthenticated users can only see signin route
  if (!user) {
    if (route.name !== 'signin') {
      navigate('/signin', { replace: true });
      return null;
    }
    return <SignIn />;
  }

  // Authenticated users shouldn't stay on signin
  if (route.name === 'signin') {
    navigate('/home', { replace: true });
    return null;
  }

  if (route.name === 'home' || route.name === 'favorites' || route.name === 'recipe') {
    return (
      <FavoritesProvider>
        <HomeApp />
      </FavoritesProvider>
    );
  }

  // Fallback
  navigate('/signin', { replace: true });
  return null;
}

// PUBLIC_INTERFACE
export default function RouterApp() {
  /**
   * Hash-based router with authentication guard.
   * - '/signin' and '/' render the Sign In when not authenticated
   * - Authenticated users can access '/home', '/recipe/:id', '/favorites'
   */
  return (
    <AuthProvider>
      <GuardedRoutes />
    </AuthProvider>
  );
}
