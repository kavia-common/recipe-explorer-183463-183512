import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

// Simple storage key for persisted auth state
const AUTH_KEY = 'recipe_auth_user_v1';

// Types
/**
 * @typedef {Object} User
 * @property {string} email
 * @property {string=} name
 */

/**
 * Authentication reducer actions
 */
function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload ?? null;
    case 'SIGN_IN':
      return action.payload ?? null;
    case 'SIGN_OUT':
      return null;
    default:
      return state;
  }
}

const AuthContext = createContext(null);

/**
 * Simulate an async auth check; in real app this would call backend.
 * Accept any non-empty email/password combo.
 */
async function fakeAuthenticate(credentials) {
  const { email, password } = credentials || {};
  // Simulate latency
  await new Promise((r) => setTimeout(r, 300));
  if (!email || !password) {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }
  return { email, name: email.split('@')[0] || 'User' };
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides authentication state and APIs with localStorage persistence. */
  const [user, dispatch] = useReducer(reducer, null);

  // Load initial user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: 'INIT', payload: parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    try {
      if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      else localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
  }, [user]);

  const api = useMemo(
    () => ({
      user,
      // PUBLIC_INTERFACE
      async signIn(credentials) {
        /** Sign in with provided credentials; resolves to user on success. */
        const u = await fakeAuthenticate(credentials);
        dispatch({ type: 'SIGN_IN', payload: u });
        return u;
      },
      // PUBLIC_INTERFACE
      signOut() {
        /** Sign out the current user and clear persisted state. */
        dispatch({ type: 'SIGN_OUT' });
      }
    }),
    [user]
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context; must be used within AuthProvider. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
