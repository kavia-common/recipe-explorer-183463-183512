import React, { useState } from 'react';

// PUBLIC_INTERFACE
export default function SearchBar({ onSearch, defaultValue = '' }) {
  /** Search input with submit button. */
  const [value, setValue] = useState(defaultValue);

  const submit = (e) => {
    e.preventDefault();
    onSearch?.(value.trim());
  };

  return (
    <form className="searchbar" onSubmit={submit} role="search" aria-label="Recipe search">
      <input
        type="search"
        placeholder="Search recipes (e.g., pasta, salad, chicken)..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search recipes"
        className="focus-ring"
      />
      <button className="btn btn-primary search-btn" type="submit">Search</button>
    </form>
  );
}
