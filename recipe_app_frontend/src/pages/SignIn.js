import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../RouterApp';
import './signin.common.css';

/**
 * Minimal Sign In page using Ocean Professional styling hooks.
 * - Route: '/signin' (handled by RouterApp guard)
 * - Client-only: validates non-empty email/password, calls AuthContext.signIn, navigates to /home
 * - Accessible labels and form semantics
 */
// PUBLIC_INTERFACE
export default function SignIn() {
  /** Minimal, styled sign-in form with accessibility and client-only validation. */
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      setSubmitting(true);
      await signIn({ email: email.trim(), password });
      navigate('/home');
    } catch (err) {
      setError(err?.message || 'Failed to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="signin-preview-root"
      role="region"
      aria-label="Sign In Container"
    >
      <form
        onSubmit={onSubmit}
        role="form"
        aria-label="Sign In Screen"
        className="surface rounded shadow-sm"
        style={{
          width: 360,
          maxWidth: '94vw',
          padding: 16,
          border: '1px solid rgba(17,24,39,0.08)',
          display: 'grid',
          gap: 12,
          background:
            'linear-gradient(180deg, rgba(37,99,235,0.05), rgba(255,255,255,1))',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div
            className="badge"
            aria-hidden="true"
            style={{ justifyContent: 'center', marginBottom: 8 }}
          >
            Welcome
          </div>
          <h1
            style={{ margin: 0, fontSize: 20, letterSpacing: 0.2 }}
            aria-label="Sign in to your account"
          >
            Sign in to your account
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              color: '#6b7280',
              fontSize: 13,
            }}
          >
            Use any email and password to continue
          </p>
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label htmlFor="signin-email" className="input-label">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            className="focus-ring"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            aria-required="true"
            aria-invalid={!!error && !email.trim()}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--input-border, #e5e7eb)',
              background: 'var(--input-bg, #ffffff)',
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label htmlFor="signin-password" className="input-label">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            className="focus-ring"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-required="true"
            aria-invalid={!!error && !password}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--input-border, #e5e7eb)',
              background: 'var(--input-bg, #ffffff)',
              fontSize: 14,
            }}
          />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#991b1b',
              padding: 10,
              borderRadius: 10,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary focus-ring"
          disabled={submitting}
          aria-label="Sign In"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 2,
          }}
        >
          <a
            href="#/signin"
            className="focus-ring"
            onClick={(e) => e.preventDefault()}
            role="link"
            aria-label="Forgot password"
            style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}
          >
            Forgot Password?
          </a>
          <a
            href="#/signin"
            className="focus-ring"
            onClick={(e) => e.preventDefault()}
            role="link"
            aria-label="Create an account"
            style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}
          >
            Create account
          </a>
        </div>
      </form>
    </div>
  );
}
