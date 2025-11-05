import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { clearLocalStorage } from '../test-utils';

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

    fireEvent.click(screen.getByText('bad'));
    await waitFor(() => {
      jest.advanceTimersByTime(350);
    });

    // user should still be none
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
