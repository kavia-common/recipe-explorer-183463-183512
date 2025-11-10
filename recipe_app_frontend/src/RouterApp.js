import React, { useEffect, useMemo, useState } from 'react';
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
 * Simple hash router helpers with query param support
 */

// PUBLIC_INTERFACE
export function parseHash(hash = window.location.hash) {
  /** Parse window.location.hash into a pathname, search params and params (supports /recipe/:id). */
  const raw = (hash || '').replace(/^#/, '') || '/';
  const url = new URL(raw.startsWith('/') ? raw : `/${raw}`, 'http://local'); // base for parsing
  const pathname = url.pathname;

  // routes:
  // / (signin), /signin, /home, /favorites, /search, /recipe/:id
  const parts = pathname.split('/').filter(Boolean);
  const route = {
    pathname,
    name: 'unknown',
    params: {},
    query: Object.fromEntries(url.searchParams.entries()),
  };

  if (pathname === '/' || pathname === '/signin') {
    route.name = 'signin';
  } else if (pathname === '/home') {
    route.name = 'home';
  } else if (pathname === '/favorites') {
    route.name = 'favorites';
  } else if (pathname === '/search') {
    route.name = 'search';
  } else if (parts[0] === 'recipe' && parts[1]) {
    route.name = 'recipe';
    route.params.id = decodeURIComponent(parts[1]);
  }

  return route;
}

// PUBLIC_INTERFACE
export function navigate(path, { replace = false } = {}) {
  /** Programmatic navigation using location.hash, enabling deep-link/back support. Accepts path with optional ?query. */
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
  useEffect(() => {
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

function useUrlSyncedQuery(currentQuery, setQuery, search) {
  // Sync query to URL for /search route and read from it when route changes.
  const route = useHashRoute();

  // Initialize from URL on first mount of search route
  useEffect(() => {
    if (route.name === 'search') {
      const q = String(route.query?.q || '').trim();
      if (q && q !== currentQuery) {
        setQuery(q);
        search(q, { immediate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.name]);

  // When user searches, update the URL if on /search; otherwise keep /home but still allow search
  const onSearchAndSync = (q, { immediate = true } = {}) => {
    const query = String(q || '').trim();
    if (route.name === 'search') {
      const enc = encodeURIComponent(query);
      navigate(`/search${query ? `?q=${enc}` : ''}`);
    }
    return search(query, { immediate });
  };

  return { onSearchAndSync, route };
}

function HomeApp() {
  const { query, setQuery, recipes, loading, search } = useRecipes('');
  const baseRoute = useHashRoute();

  // Modal and drawer routes are derived from route
  const selectedId = baseRoute.name === 'recipe' ? baseRoute.params.id : null;
  const favoritesOpen = baseRoute.name === 'favorites';

  const actions = useMemo(
    () => ({
      openFavorites: () => navigate('/favorites'),
      closeFavorites: () => navigate('/home'),
      openDetail: (r) => navigate(`/recipe/${encodeURIComponent(r?.id)}`),
      closeDetail: () => navigate('/home'),
      goHome: () => navigate('/home'),
      goSearch: () => navigate('/search'),
    }),
    []
  );

  // URL query synchronization scaffolding for /search
  const { onSearchAndSync, route } = useUrlSyncedQuery(query, setQuery, search);

  const isSearchPage = route.name === 'search';

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
            onSearchAndSync(q, { immediate: true });
            if (!isSearchPage) actions.goSearch();
          }}
        />
      </Header>

      <main className="content" role="main" aria-live="polite" aria-label="Browse and search recipes">
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

  // Allowed app routes
  if (route.name === 'home' || route.name === 'favorites' || route.name === 'recipe' || route.name === 'search') {
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
   * Routes:
   * - '/' and '/signin' render the Sign In when not authenticated
   * - Authenticated users can access '/home', '/search', '/recipe/:id', '/favorites'
   * Modal: '/recipe/:id' opens RecipeDetail as modal panel.
   * URL query sync: '/search?q=term' keeps search term in the URL and syncs to state.
   */
  return (
    <AuthProvider>
      <GuardedRoutes />
    </AuthProvider>
  );
}
