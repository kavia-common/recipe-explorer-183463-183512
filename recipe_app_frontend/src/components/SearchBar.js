import React, { useMemo, useRef, useState } from 'react';
import { debounce, DEFAULT_DEBOUNCE_DELAY } from '../utils/debounce';

/**
 * PUBLIC_INTERFACE
 */
export default function SearchBar({ onSearch, defaultValue = '', debounceMs = DEFAULT_DEBOUNCE_DELAY }) {
  /** Search input with submit button. */
  const [value, setValue] = useState(defaultValue);

  // Build a debounced onSearch handler; keep ref to stable debounced function
  const debouncedRef = useRef(null);
  const debounced = useMemo(() => {
    // create a new debounced fn when debounceMs or onSearch changes
    const fn = (q) => onSearch?.(q);
    const d = debounce(fn, typeof debounceMs === 'number' ? debounceMs : DEFAULT_DEBOUNCE_DELAY);
    debouncedRef.current = d;
    return d;
  }, [onSearch, debounceMs]);

  const submit = (e) => {
    e.preventDefault();
    // On submit, call immediately with current value
    onSearch?.(value.trim());
  };

  return (
    <form
      className="searchbar"
      onSubmit={submit}
      role="search"
      aria-label="Recipe search"
    >
      <label htmlFor="global-search" className="sr-only" aria-hidden="true">
        Search recipes
      </label>
      <input
        id="global-search"
        type="search"
        placeholder="Search recipes (e.g., pasta, salad, chicken)..."
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          // Debounced live-search to reduce API calls and re-renders
          debounced(v.trim());
        }}
        aria-label="Search recipes"
        className="focus-ring"
        role="searchbox"
        aria-controls="recipe-results"
      />
      <button
        className="btn btn-primary search-btn focus-ring"
        type="submit"
        aria-label="Run recipe search"
      >
        Search
      </button>
    </form>
  );
}
