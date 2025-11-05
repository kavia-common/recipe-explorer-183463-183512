# Sign In Pixel-Perfect Preview

- Default Route: `/` (landing view renders Sign In)
- Also available: Hash route `#/signin`
  - Examples:
    - http://localhost:3000/#/
    - http://localhost:3000/#/signin
- Original app preserved at: `#/home`
- Container size: 375x812 (centered on page)
- Fonts: Poppins and SF Pro Display loaded with `font-display: swap`
- Assets: Referenced via `/assets/figmaimages/*.png` paths (environment-safe)
- Styles: Original CSS preserved (`/assets/common.css`, `/assets/sign-in-11-235.css`)
- Isolation: Added `src/pages/signin.common.css` to center container, set isolation boundary, prevent global overrides

Notes:
- Exact measurements and positions are preserved from the extracted spec.
- If you later add navigation, link to `#/signin` or `#/` from any component to open the Sign In.
- To access the recipe explorer, navigate to `#/home`.
