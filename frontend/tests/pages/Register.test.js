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

// Mock fetch globally
global.fetch = jest.fn();

describe('Register Component', () => {
  const mockUser = {
    token: 'test-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: mockUser
    });
    global.fetch.mockClear();
  });

  test('renders registration form', async () => {
    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Wait for the page to render
    await waitFor(() => {
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    expect(screen.getByText('Register New User')).toBeInTheDocument();
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('role-select')).toBeInTheDocument();
    expect(screen.getByTestId('register-button')).toBeInTheDocument();
  });

  test('handles successful registration', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'User registered successfully' })
    });

    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Wait for the page to render
    await waitFor(() => {
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByTestId('role-select'), {
      target: { value: 'admin' }
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('register-button'));

    // Verify the fetch call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }),
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: 'admin'
          })
        })
      );
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByTestId('register-message')).toHaveTextContent('Registration successful!');
    });
  });

  test('handles registration failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Username already exists' })
    });

    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Wait for the page to render
    await waitFor(() => {
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('register-button'));

    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('register-message')).toHaveTextContent('Registration failed: Username already exists');
    });
  });

  test('handles network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Wait for the page to render
    await waitFor(() => {
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('register-button'));

    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('register-message')).toHaveTextContent('An error occurred while registering. Please try again later.');
    });
  });

  test('shows loading state during registration', async () => {
    global.fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Wait for the page to render
    await waitFor(() => {
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByTestId('username-input'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('register-button'));

    // Verify loading state
    expect(screen.getByTestId('register-button')).toHaveTextContent('Registering...');
  });

  test('validates required fields', async () => {
    renderWithMantine(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Wait for the page to render
    await waitFor(() => {
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    // Submit the form without filling required fields
    fireEvent.click(screen.getByTestId('register-button'));

    // Verify that fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });
}); 