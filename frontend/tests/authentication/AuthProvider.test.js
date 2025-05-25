import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/authentication/AuthProvider';
import { jwtDecode } from 'jwt-decode';

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));

// Mock socket service
jest.mock('../../src/services/socket', () => ({
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
  onForceLogout: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
const mockLocation = { href: '' };
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock alert
global.alert = jest.fn();

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="isLoggedIn">{auth.user?.isLoggedIn.toString()}</div>
      <div data-testid="role">{auth.user?.role || 'no-role'}</div>
      <div data-testid="username">{auth.user?.username || 'no-username'}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="sessionInfo">{JSON.stringify(auth.sessionInfo)}</div>
      <button data-testid="login-button" onClick={() => auth.login('test-token', { sessionId: '123' })}>Login</button>
      <button data-testid="logout-button" onClick={auth.logout}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Mock environment variable
    process.env.REACT_APP_URL_BACKEND = 'http://localhost:8080';
    // Reset window.location
    mockLocation.href = '';
  });

  test('initializes with loading state and attempts to refresh token', async () => {
    // Mock fetch to return successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' })
    });

    // Mock jwt decode to return user data
    jwtDecode.mockReturnValueOnce({
      role: 'user',
      username: 'testuser'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Check initial loading state
    expect(screen.getByTestId('loading').textContent).toBe('true');

    await waitFor(() => expect(screen.getByTestId('isLoggedIn').textContent).toBe('true'));
    expect(screen.getByTestId('role').textContent).toBe('user');
    expect(screen.getByTestId('username').textContent).toBe('testuser');
    expect(screen.getByTestId('loading').textContent).toBe('false');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/auth/authMe',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include'
      })
    );
  });

  test('handles failed token refresh', async () => {
    // Mock fetch to return failed response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('isLoggedIn').textContent).toBe('false'));
    expect(screen.getByTestId('role').textContent).toBe('no-role');
    expect(screen.getByTestId('username').textContent).toBe('no-username');
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  test('handles login with session info', async () => {
    // Mock jwt decode for login
    jwtDecode.mockReturnValueOnce({
      role: 'admin',
      username: 'adminuser'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => expect(screen.getByTestId('isLoggedIn').textContent).toBe('true'));
    expect(screen.getByTestId('role').textContent).toBe('admin');
    expect(screen.getByTestId('username').textContent).toBe('adminuser');
    expect(screen.getByTestId('sessionInfo').textContent).toBe('{"sessionId":"123"}');
  });

  test('handles logout', async () => {
    // Mock successful initial auth check
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' })
    });

    // Mock successful logout response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    // Mock jwt decode for initial state
    jwtDecode.mockReturnValueOnce({
      role: 'user',
      username: 'testuser'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial state to be set
    await waitFor(() => {
      expect(screen.getByTestId('isLoggedIn').textContent).toBe('true');
      expect(screen.getByTestId('role').textContent).toBe('user');
      expect(screen.getByTestId('username').textContent).toBe('testuser');
    });

    // Click logout button
    fireEvent.click(screen.getByTestId('logout-button'));

    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByTestId('isLoggedIn').textContent).toBe('false');
      expect(screen.getByTestId('role').textContent).toBe('no-role');
      expect(screen.getByTestId('username').textContent).toBe('no-username');
      expect(screen.getByTestId('sessionInfo').textContent).toBe('null');
    });

    // Verify logout API call
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/auth/logout',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser' }),
        credentials: 'include'
      })
    );
  });

  test('handles force logout', async () => {
    // Mock successful initial auth check
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' })
    });

    // Mock jwt decode for initial state
    jwtDecode.mockReturnValueOnce({
      role: 'user',
      username: 'testuser'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial state to be set
    await waitFor(() => {
      expect(screen.getByTestId('isLoggedIn').textContent).toBe('true');
      expect(screen.getByTestId('role').textContent).toBe('user');
      expect(screen.getByTestId('username').textContent).toBe('testuser');
    });

    // Get the force logout handler
    const { onForceLogout } = require('../../src/services/socket');
    const forceLogoutHandler = onForceLogout.mock.calls[0][0];

    // Trigger force logout
    forceLogoutHandler('Session expired');

    // Check that alert was shown
    expect(global.alert).toHaveBeenCalledWith('You have been logged out: Session expired');

    // Check that user was logged out
    await waitFor(() => {
      expect(screen.getByTestId('isLoggedIn').textContent).toBe('false');
      expect(screen.getByTestId('role').textContent).toBe('no-role');
      expect(screen.getByTestId('username').textContent).toBe('no-username');
    });

    // Check that redirect happened
    expect(mockLocation.href).toBe('/login');
  });
}); 