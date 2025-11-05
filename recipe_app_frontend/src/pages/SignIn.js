import React, { useEffect, useState } from 'react';
import './signin.common.css';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../RouterApp';

// PUBLIC_INTERFACE
export default function SignIn() {
  /** Pixel-perfect Sign In screen with React handlers; calls AuthContext.signIn on submit and navigates to /home. */
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load stylesheets for pixel-perfect screen without altering measurements
  useEffect(() => {
    const links = [];
    const addLink = (href) => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      document.head.appendChild(l);
      links.push(l);
    };
    addLink('/assets/common.css');
    addLink('/assets/sign-in-11-235.css');

    return () => {
      links.forEach((l) => document.head.contains(l) && document.head.removeChild(l));
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      navigate('/home');
    } catch (err) {
      setError(err?.message || 'Failed to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="signin-preview-root"
      role="region"
      aria-label="Sign In Preview Root"
      style={{ '--font-family': "Poppins, 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      <form className="screen sign-in-11-235" role="form" aria-label="Sign In Screen" onSubmit={onSubmit}>
        {/* Status Bar */}
        <div className="status-bar" aria-hidden="true">
          <img className="sb-time" src="/assets/figmaimages/figma_image_100_2329.png" alt="" />
          <img className="sb-cell" src="/assets/figmaimages/figma_image_100_2357.png" alt="" />
          <img className="sb-wifi" src="/assets/figmaimages/figma_image_100_2375.png" alt="" />
          <img className="sb-battery" src="/assets/figmaimages/figma_image_103_4015.png" alt="" />
        </div>

        {/* Title and Subtitle */}
        <div className="title" role="heading" aria-level="1">Sign In</div>
        <div className="subtitle">Welcome back! Please sign in to continue</div>

        {/* Email Field */}
        <label className="input-label email-label" htmlFor="email">Email</label>
        <input
          id="email"
          className="input email-input"
          type="email"
          placeholder="Enter your email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />

        {/* Password Field */}
        <label className="input-label password-label" htmlFor="password">Password</label>
        <input
          id="password"
          className="input password-input"
          type="password"
          placeholder="Enter your password"
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {/* Forgot Password */}
        <button className="link forgot-password focus-ring" type="button" aria-label="Forgot password">Forgot Password?</button>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            style={{
              position: 'absolute',
              left: 24,
              right: 24,
              top: 364,
              color: '#EF4444',
              fontSize: 12
            }}
          >
            {error}
          </div>
        )}

        {/* Primary Sign In Button */}
        <button id="primarySignIn" className="btn-primary focus-ring" type="submit" aria-label="Sign In" disabled={submitting}>
          <span className="btn-label">{submitting ? 'Signing In...' : 'Sign In'}</span>
          <img className="btn-icon" src="/assets/figmaimages/figma_image_103_4043.png" alt="" />
        </button>

        {/* Divider */}
        <div className="divider-text" aria-hidden="true">Or continue with</div>

        {/* Social Buttons */}
        <button className="btn-social btn-google focus-ring" type="button" aria-label="Continue with Google">
          <img className="social-icon" src="/assets/figmaimages/figma_image_103_4061.png" alt="" />
          <span className="social-label">Google</span>
        </button>
        <button className="btn-social btn-apple focus-ring" type="button" aria-label="Continue with Apple">
          <img className="social-icon" src="/assets/figmaimages/figma_image_104_1862.png" alt="" />
          <span className="social-label">Apple</span>
        </button>

        {/* Footer - Sign Up Link */}
        <div className="signup-row">
          <span className="signup-text">Don’t have an account?</span>
          <a href="#" className="signup-link focus-ring" aria-label="Sign up for an account">Sign Up</a>
        </div>

        {/* Decorative shape */}
        <img className="decorative-shape" src="/assets/figmaimages/figma_image_30_811.png" alt="" />

        {/* Home Indicator */}
        <div className="home-indicator" aria-hidden="true">
          <img src="/assets/figmaimages/figma_image_18_217.png" alt="" />
        </div>
      </form>
    </div>
  );
}
