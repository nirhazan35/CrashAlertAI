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

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
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

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByText(/Login/i));

    await waitFor(() => expect(screen.getByText(/Login failed. Please try again./i)).toBeInTheDocument());
  });

  test('calls login and redirects on successful login', async () => {
    const mockLogin = jest.fn();
    useAuth.mockReturnValueOnce({ login: mockLogin });

    fetch.mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve({ accessToken: 'fake-token' }),
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByText(/Login/i));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('fake-token'));
  });
});
