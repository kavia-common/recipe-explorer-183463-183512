import React, { useEffect } from 'react';
import './signin.common.css';

// PUBLIC_INTERFACE
export default function SignIn() {
  /** Pixel-perfect Sign In screen (375x812) rendered in a centered container, preserving absolute positioning and styles. */
  // Load stylesheets for pixel-perfect screen without altering measurements
  useEffect(() => {
    // Attach assets/common.css and assets/sign-in-11-235.css for pixel-perfect styles
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

    // Initialize button handler similar to assets/sign-in-11-235.js
    const btn = document.getElementById('primarySignIn');
    const handler = () => {
      // Placeholder feedback effect
      btn.classList.add('clicked');
      setTimeout(() => btn.classList.remove('clicked'), 150);
    };
    if (btn) btn.addEventListener('click', handler);

    return () => {
      links.forEach((l) => document.head.removeChild(l));
      if (btn) btn.removeEventListener('click', handler);
    };
  }, []);

  return (
    <div className="signin-preview-root" role="region" aria-label="Sign In Preview Root">
      <div className="screen sign-in-11-235" role="application" aria-label="Sign In Screen">
        {/* Status Bar */}
        <div className="status-bar" aria-hidden="true">
          {/* Using available png assets in /assets/figmaimages to ensure environment-safe paths */}
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
        <input id="email" className="input email-input" type="email" placeholder="Enter your email" aria-label="Email" />

        {/* Password Field */}
        <label className="input-label password-label" htmlFor="password">Password</label>
        <input id="password" className="input password-input" type="password" placeholder="Enter your password" aria-label="Password" />

        {/* Forgot Password */}
        <button className="link forgot-password" type="button">Forgot Password?</button>

        {/* Primary Sign In Button */}
        <button id="primarySignIn" className="btn-primary" type="button" aria-label="Sign In">
          <span className="btn-label">Sign In</span>
          <img className="btn-icon" src="/assets/figmaimages/figma_image_103_4043.png" alt="" />
        </button>

        {/* Divider */}
        <div className="divider-text">Or continue with</div>

        {/* Social Buttons */}
        <button className="btn-social btn-google" type="button" aria-label="Continue with Google">
          <img className="social-icon" src="/assets/figmaimages/figma_image_103_4061.png" alt="" />
          <span className="social-label">Google</span>
        </button>
        <button className="btn-social btn-apple" type="button" aria-label="Continue with Apple">
          <img className="social-icon" src="/assets/figmaimages/figma_image_104_1862.png" alt="" />
          <span className="social-label">Apple</span>
        </button>

        {/* Footer - Sign Up Link */}
        <div className="signup-row">
          <span className="signup-text">Don’t have an account?</span>
          <a href="#" className="signup-link">Sign Up</a>
        </div>

        {/* Decorative shape */}
        <img className="decorative-shape" src="/assets/figmaimages/figma_image_30_811.png" alt="" />

        {/* Home Indicator */}
        <div className="home-indicator">
          <img src="/assets/figmaimages/figma_image_18_217.png" alt="" />
        </div>
      </div>
    </div>
  );
}
