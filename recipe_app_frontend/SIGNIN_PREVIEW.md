# Sign In Pixel-Perfect Preview

- Route: Use hash route /signin
  - Example: http://localhost:3000/#/signin
- Container size: 375x812 (centered on page)
- Fonts: Poppins and SF Pro Display loaded with `font-display: swap`
- Assets: Referenced via `/assets/figmaimages/*.png` paths (environment-safe)
- Styles: Original CSS preserved (`/assets/common.css`, `/assets/sign-in-11-235.css`)
- Isolation: Added `src/pages/signin.common.css` to center container and avoid global overrides

Notes:
- No visual measurements were altered.
- If you later add navigation, link to `#/signin` from any component to open the preview.
