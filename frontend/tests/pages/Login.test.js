import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../src/pages/Login/Login';
import { useAuth } from '../../src/authentication/AuthProvider';
import { renderWithMantine } from '../utils/test-utils';

// Mock useAuth hook
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock fetch API
global.fetch = jest.fn();

describe('Login Component', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin,
      user: null
    });
  });

  test('renders login form', () => {
    renderWithMantine(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('CrashAlert AI')).toBeInTheDocument();
    expect(screen.getByText('Welcome back! Please enter your credentials to continue')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles login submission', async () => {
    const mockResponse = {
      accessToken: 'mock-token',
      session: { id: '1', username: 'testuser' }
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    renderWithMantine(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'testuser', password: 'password123' })
        })
      );
      expect(mockLogin).toHaveBeenCalledWith(mockResponse.accessToken, mockResponse.session);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('shows error message on login failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Invalid credentials' })
    });

    renderWithMantine(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('shows loading state during login', async () => {
    global.fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithMantine(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(loginButton);

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  test('redirects to password change request page', () => {
    renderWithMantine(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const forgotPasswordLink = screen.getByRole('link', { name: /request password change/i });
    expect(forgotPasswordLink).toHaveAttribute('href', '/request-password-change');
  });
}); 