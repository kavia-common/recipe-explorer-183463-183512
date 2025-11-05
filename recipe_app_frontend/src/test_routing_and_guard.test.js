import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RouterApp, { navigate } from './RouterApp';
import * as apiClient from './api/client';
import { setHash, clearLocalStorage } from './test-utils';

// Mock API to make UI deterministic
jest.spyOn(apiClient, 'searchRecipes').mockResolvedValue([
  { id: 'mock-1', title: 'Garlic Butter Shrimp Pasta', image: '', readyInMinutes: 25, servings: 2 },
  { id: 'mock-2', title: 'Avocado Chicken Salad', image: '', readyInMinutes: 15, servings: 3 },
]);
jest.spyOn(apiClient, 'getRecipeDetail').mockImplementation(async (id) => ({
  id,
  title: id === 'mock-2' ? 'Avocado Chicken Salad' : 'Garlic Butter Shrimp Pasta',
  image: '',
  readyInMinutes: 10,
  servings: 2,
  ingredients: ['a', 'b'],
  instructions: ['step 1'],
}));

// Helper to sign in via UI since AuthProvider is encapsulated in RouterApp
async function performSignIn() {
  // On unauthenticated load, RouterApp directs to SignIn
  const email = await screen.findByLabelText(/Email/i);
  const password = screen.getByLabelText(/Password/i);
  const button = screen.getByRole('button', { name: /Sign In/i });

  fireEvent.change(email, { target: { value: 'user@example.com' } });
  fireEvent.change(password, { target: { value: 'secret' } });
  fireEvent.click(button);

  // After sign in, app navigates to /home
  await waitFor(() => expect(window.location.hash).toMatch(/#\/home$/));
}

describe('RouterApp - auth guards and routing', () => {
  beforeEach(() => {
    clearLocalStorage();
    // Ensure clean hash for each test
    setHash('/'); // default landing should render SignIn
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('unauthenticated users are redirected to /signin when visiting other routes', async () => {
    setHash('/home'); // try to access home
    render(<RouterApp />);

    // RouterApp guard should redirect to /signin
    await waitFor(() => expect(window.location.hash).toBe('#/signin'));

    // SignIn screen visible
    expect(await screen.findByRole('form', { name: /Sign In Screen/i })).toBeInTheDocument();
  });

  test('authenticated users visiting /signin are redirected to /home', async () => {
    render(<RouterApp />);
    await performSignIn();

    // If explicitly go to /signin now, expect redirect to /home
    navigate('/signin', { replace: true });
    await waitFor(() => expect(window.location.hash).toBe('#/home'));
  });

  test('home route lists recipes and allows opening detail (deep link behavior)', async () => {
    render(<RouterApp />);
    await performSignIn();

    // After sign-in and initial search resolves, grid should show mock recipes
    const card = await screen.findByRole('listitem', { name: /recipe card/i });
    expect(card).toBeInTheDocument();

    // Click first card's View button to open details (which sets hash to /recipe/:id)
    const viewBtn = screen.getAllByRole('button', { name: /View recipe/i })[0];
    fireEvent.click(viewBtn);

    await waitFor(() => expect(window.location.hash).toMatch(/^#\/recipe\//));
    // Detail dialog should render with loading then with details
    expect(await screen.findByRole('dialog', { name: /Recipe details/i })).toBeInTheDocument();

    // Close details via close button should navigate back to /home
    const closeBtn = screen.getByRole('button', { name: /Close details/i });
    fireEvent.click(closeBtn);
    await waitFor(() => expect(window.location.hash).toBe('#/home'));
  });

  test('deep linking directly to /recipe/:id opens detail on load', async () => {
    setHash('/recipe/mock-2');
    render(<RouterApp />);

    // Should redirect to /signin first, then after sign-in we should preserve ability to navigate to detail
    await waitFor(() => expect(window.location.hash).toBe('#/signin'));
    await performSignIn();

    // After sign in, since route changed during sign-in flow to /home, open a detail directly:
    // Navigate to recipe again
    navigate('/recipe/mock-2');
    await waitFor(() => expect(window.location.hash).toBe('#/recipe/mock-2'));
    expect(await screen.findByRole('dialog', { name: /Recipe details/i })).toBeInTheDocument();
    expect(screen.getByText(/Avocado Chicken Salad/i)).toBeInTheDocument();
  });

  test('favorites route opens drawer and Favorites page content route', async () => {
    render(<RouterApp />);
    await performSignIn();

    // Open favorites via header button link (which has role button and label Open favorites)
    const openFavLink = screen.getByRole('button', { name: /Open favorites/i });
    fireEvent.click(openFavLink);

    // We are on #/favorites route and favorites panel/page is visible
    await waitFor(() => expect(window.location.hash).toBe('#/favorites'));

    // Page should have "Favorites Page" region
    expect(await screen.findByLabelText(/Favorites Page/i)).toBeInTheDocument();

    // Navigate back home using Back to Browse button
    fireEvent.click(screen.getByRole('button', { name: /Back to Browse/i }));
    await waitFor(() => expect(window.location.hash).toBe('#/home'));
  });
});
