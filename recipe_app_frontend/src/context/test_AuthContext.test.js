import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext.js';
import { clearLocalStorage } from '../test-utils.js';

function AuthConsumer() {
  const { user, signIn, signOut } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'none'}</div>
      <button onClick={() => signIn({ email: 'test@example.com', password: 'pw' })}>signin</button>
      <button onClick={() => signOut()}>signout</button>
      <button onClick={() => signIn({ email: '', password: '' })}>bad</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    clearLocalStorage();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('signIn resolves and updates user; signOut clears', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('none');

    fireEvent.click(screen.getByText('signin'));

    // fakeAuthenticate waits ~300ms: advance timers, then flush
    await waitFor(() => {
      jest.advanceTimersByTime(350);
    });

    await screen.findByText('test@example.com');
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');

    // sign out
    fireEvent.click(screen.getByText('signout'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  test('signIn rejects on invalid credentials', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // Invoke the action that triggers a rejecting signIn call
    const badButton = screen.getByText('bad');
    const clickPromise = Promise.resolve().then(() => fireEvent.click(badButton));

    // Advance timers to allow fakeAuthenticate to settle (~300ms)
    await waitFor(() => {
      jest.advanceTimersByTime(350);
    });

    // Await the click dispatch to ensure promises scheduled by React are flushed
    await clickPromise;

    // No unhandled rejection should occur; user remains none
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  test('persists user to localStorage and initializes on load', async () => {
    const { unmount } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('signin'));
    await waitFor(() => {
      jest.advanceTimersByTime(350);
    });
    await screen.findByText('test@example.com');
    unmount();

    // Remount; it should initialize from storage without delay
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });
});
