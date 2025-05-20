import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../src/pages/Register/Register';
import { useAuth } from '../../src/authentication/AuthProvider';
import { renderWithMantine } from '../utils/test-utils';

// Mock the dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

describe('Register Component', () => {
  const mockRegister = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      register: mockRegister,
      user: null
    });
  });

  test('renders registration form', () => {
    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('handles registration submission', async () => {
    mockRegister.mockResolvedValueOnce({ success: true });

    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    await fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    await fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('shows error message on registration failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Registration failed'));

    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    await fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    await fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

  test('validates password match', async () => {
    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
    await fireEvent.click(registerButton);

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const registerButton = screen.getByRole('button', { name: /register/i });
    await fireEvent.click(registerButton);

    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    await fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    await fireEvent.click(registerButton);

    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });

  test('shows loading state during registration', async () => {
    mockRegister.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    await fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    await fireEvent.click(registerButton);

    expect(screen.getByText(/registering/i)).toBeInTheDocument();
  });

  test('redirects to login page', () => {
    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
}); 