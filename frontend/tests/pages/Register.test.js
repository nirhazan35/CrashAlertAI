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

    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('handles registration submission', async () => {
    mockRegister.mockResolvedValueOnce({ success: true });

    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    await fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    await fireEvent.click(registerButton);

    expect(mockRegister).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  test('shows error message on registration failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Registration failed'));

    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
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

    const passwordInput = screen.getByLabelText(/password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
    await fireEvent.click(registerButton);

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
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