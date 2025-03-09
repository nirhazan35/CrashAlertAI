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

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => expect(screen.getByText(/Login failed. Please try again./i)).toBeInTheDocument());
  });

test('calls login and redirects on successful login', async () => {
  const mockLogin = jest.fn();
  useAuth.mockReturnValueOnce({ login: mockLogin });

  // Mock fetch to return a response with properly structured data
  fetch.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ accessToken: 'fake-token' }),
    })
  );

  render(
    <Router>
      <Login />
    </Router>
  );

  const usernameInput = document.querySelector('input[type="text"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const submitButton = screen.getByRole('button', { name: /Login/i });

  fireEvent.change(usernameInput, { target: { value: 'testuser' } });
  fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
  fireEvent.click(submitButton);


  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('fake-token');
  });
});


});