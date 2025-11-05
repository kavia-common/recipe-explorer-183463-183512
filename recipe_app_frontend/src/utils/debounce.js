const isTestEnv =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.NODE_ENV === 'test' || process.env.REACT_APP_NODE_ENV === 'test')) ||
  false;

/**
 * PUBLIC_INTERFACE
 */
export const DEFAULT_DEBOUNCE_DELAY = isTestEnv ? 0 : 300;

/**
 * Create a debounced function that delays invoking `fn` until after `delay`ms
 * have elapsed since the last time the debounced function was invoked.
 * In test environments the default delay is forced to 0 for determinism.
 */
export function debounce(fn, delay = DEFAULT_DEBOUNCE_DELAY) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      t = null;
      fn(...args);
    }, delay);
  };
}
