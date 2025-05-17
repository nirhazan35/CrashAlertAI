import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
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

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="isLoggedIn">{auth.user?.isLoggedIn.toString()}</div>
      <div data-testid="role">{auth.user?.role || 'no-role'}</div>
      <div data-testid="username">{auth.user?.username || 'no-username'}</div>
      <button data-testid="login-button" onClick={() => auth.login('test-token')}>Login</button>
      <button data-testid="logout-button" onClick={auth.logout}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Mock environment variable
    process.env.REACT_APP_URL_BACKEND = 'http://localhost:8080';
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

    await waitFor(() => expect(screen.getByTestId('isLoggedIn').textContent).toBe('true'));
    expect(screen.getByTestId('role').textContent).toBe('user');
    expect(screen.getByTestId('username').textContent).toBe('testuser');

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
  });
}); 