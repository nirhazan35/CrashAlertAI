import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../../authentication/AuthProvider';
import { jwtDecode } from 'jwt-decode';
import { connectSocket } from '../../services/socket';

// Mock dependencies
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));

jest.mock('../../services/socket', () => ({
  connectSocket: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

// Create test component to access context values
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="is-logged-in">{user?.isLoggedIn?.toString() || 'false'}</div>
      <div data-testid="username">{user?.username || 'no-user'}</div>
      <div data-testid="role">{user?.role || 'no-role'}</div>
      <button data-testid="login-button" onClick={() => login('test-token')}>Login</button>
      <button data-testid="logout-button" onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    global.fetch.mockReset();

    // Set up environment variable
    process.env.REACT_APP_URL_BACKEND = 'http://localhost:5000';
  });

  test('should show loading state and fetch token on mount', async () => {
    // Mock successful token fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'valid-token' })
    });

    // Mock JWT decode
    jwtDecode.mockReturnValueOnce({
      role: 'admin',
      username: 'test-user'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // After token fetch completes
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('is-logged-in')).toHaveTextContent('true');
      expect(screen.getByTestId('username')).toHaveTextContent('test-user');
      expect(screen.getByTestId('role')).toHaveTextContent('admin');
    });

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/auth/authMe',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include'
      })
    );

    // Verify socket connection was established
    expect(connectSocket).toHaveBeenCalledWith('valid-token');
  });

  test('should handle failed token fetch', async () => {
    // Mock failed token fetch
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('is-logged-in')).toHaveTextContent('false');
      expect(screen.getByTestId('username')).toHaveTextContent('no-user');
      expect(screen.getByTestId('role')).toHaveTextContent('no-role');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch access token:', 401);
    expect(connectSocket).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('should handle network error during token fetch', async () => {
    // Mock network error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('is-logged-in')).toHaveTextContent('false');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error during token refresh:', 'Network error');
    expect(connectSocket).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('login function should update user state and connect socket', async () => {
    // Mock token fetch for initial load
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    // Mock JWT decode for login
    jwtDecode.mockReturnValueOnce({
      role: 'user',
      username: 'new-user'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Perform login
    act(() => {
      screen.getByTestId('login-button').click();
    });

    // Verify state was updated
    expect(screen.getByTestId('is-logged-in')).toHaveTextContent('true');
    expect(screen.getByTestId('username')).toHaveTextContent('new-user');
    expect(screen.getByTestId('role')).toHaveTextContent('user');

    // Verify socket connection was established
    expect(connectSocket).toHaveBeenCalledWith('test-token');
  });

  test('logout function should call API and update state on success', async () => {
    // Mock token fetch for initial load
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'valid-token' })
    });

    // Mock JWT decode
    jwtDecode.mockReturnValueOnce({
      role: 'admin',
      username: 'test-user'
    });

    // Mock logout API call
    global.fetch.mockResolvedValueOnce({
      ok: true
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load and login to complete
    await waitFor(() => {
      expect(screen.getByTestId('is-logged-in')).toHaveTextContent('true');
    });

    // Perform logout
    act(() => {
      screen.getByTestId('logout-button').click();
    });

    // Wait for state update after logout
    await waitFor(() => {
      expect(screen.getByTestId('is-logged-in')).toHaveTextContent('false');
      expect(screen.getByTestId('username')).toHaveTextContent('no-user');
      expect(screen.getByTestId('role')).toHaveTextContent('no-role');
    });

    // Verify logout API was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/auth/logout',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ username: 'test-user' }),
        credentials: 'include'
      })
    );
  });

  test('logout function should handle API error', async () => {
    // Mock token fetch for initial load
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'valid-token' })
    });

    // Mock JWT decode
    jwtDecode.mockReturnValueOnce({
      role: 'admin',
      username: 'test-user'
    });

    // Mock failed logout API call
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load and login to complete
    await waitFor(() => {
      expect(screen.getByTestId('is-logged-in')).toHaveTextContent('true');
    });

    // Perform logout
    act(() => {
      screen.getByTestId('logout-button').click();
    });

    // Verify error was logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', 500);
    });

    // User should still be logged in since logout failed
    expect(screen.getByTestId('is-logged-in')).toHaveTextContent('true');

    consoleSpy.mockRestore();
  });

  test('logout function should handle network error', async () => {
    // Mock token fetch for initial load
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'valid-token' })
    });

    // Mock JWT decode
    jwtDecode.mockReturnValueOnce({
      role: 'admin',
      username: 'test-user'
    });

    // Mock network error during logout
    global.fetch.mockRejectedValueOnce(new Error('Network error during logout'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load and login to complete
    await waitFor(() => {
      expect(screen.getByTestId('is-logged-in')).toHaveTextContent('true');
    });

    // Perform logout
    act(() => {
      screen.getByTestId('logout-button').click();
    });

    // Verify error was logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', 'Network error during logout');
    });

    // User should still be logged in since logout failed
    expect(screen.getByTestId('is-logged-in')).toHaveTextContent('true');

    consoleSpy.mockRestore();
  });
});
