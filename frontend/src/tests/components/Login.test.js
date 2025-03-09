import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Login from '../../pages/Login/Login';
import { useAuth } from '../../authentication/AuthProvider';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock useAuth hook
jest.mock('../../authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock the fetch function globally
global.fetch = jest.fn();

describe('Login Component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      login: jest.fn(),
    });
    fetch.mockClear();
  });

  test('renders login form correctly', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('displays error message when login fails', async () => {
    fetch.mockResolvedValueOnce({
      status: 400,
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    // Get inputs directly using the DOM selectors
    const usernameInput = document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => expect(screen.getByText(/Login failed. Please try again./i)).toBeInTheDocument());
  });

  test('calls login and redirects on successful login', async () => {
    // Create a more complete mock for fetch
    const mockLoginResponse = {
      accessToken: 'fake-token'
    };

    const mockLogin = jest.fn();
    useAuth.mockReturnValue({ login: mockLogin });

    // Create a more complete fetch mock
    fetch.mockImplementation(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve(mockLoginResponse)
      })
    );

    render(
      <Router>
        <Login />
      </Router>
    );

    // Get inputs directly using the DOM selectors
    const usernameInput = document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Fill the form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    // Submit the form by clicking the button
    fireEvent.click(loginButton);

    // Verify fetch was called correctly
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String)
      }));
    });

    // Now wait for the login to be called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('fake-token');
    }, { timeout: 3000 }); // Increase timeout if needed
  });
});
