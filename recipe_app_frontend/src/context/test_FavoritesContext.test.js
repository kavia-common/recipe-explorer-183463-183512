import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from './FavoritesContext';
import { clearLocalStorage } from '../test-utils';

function TestComp() {
  const { favorites, addFavorite, removeFavorite, clearFavorites, isFavorite } = useFavorites();
  return (
    <div>
      <div data-testid="count">{favorites.length}</div>
      <button onClick={() => addFavorite({ id: 'r1', title: 'R1' })}>add</button>
      <button onClick={() => removeFavorite('r1')}>remove</button>
      <button onClick={() => clearFavorites()}>clear</button>
      <div data-testid="isFav">{isFavorite('r1') ? 'yes' : 'no'}</div>
    </div>
  );
}

describe('FavoritesContext', () => {
  beforeEach(() => {
    clearLocalStorage();
  });

  test('add/remove/clear and isFavorite work', () => {
    render(
      <FavoritesProvider>
        <TestComp />
      </FavoritesProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('isFav')).toHaveTextContent('no');

    fireEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('isFav')).toHaveTextContent('yes');

    fireEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('isFav')).toHaveTextContent('no');

    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  test('persists to localStorage and initializes from it', () => {
    // First render add one favorite
    const { unmount } = render(
      <FavoritesProvider>
        <TestComp />
      </FavoritesProvider>
    );
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    unmount();

    // Re-mount and ensure it loads from storage
    render(
      <FavoritesProvider>
        <TestComp />
      </FavoritesProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('isFav')).toHaveTextContent('yes');
  });
});
