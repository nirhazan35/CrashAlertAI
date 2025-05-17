import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../src/pages/Login/Login';
import { useAuth } from '../../src/authentication/AuthProvider';

// Mock useAuth hook
jest.mock('../../authentication/AuthProvider', () => ({
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

describe('Login Page', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth context
    useAuth.mockReturnValue({
      login: mockLogin
    });
    
    // Set environment variable
    process.env.REACT_APP_URL_BACKEND = 'http://localhost:8080';
  });

  test('renders login form with all required elements', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Check page title
    expect(screen.getByText('CrashAlert AI')).toBeInTheDocument();
    
    // Check form inputs
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    
    // Check forgot password link
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    expect(screen.getByText(/request password change/i)).toBeInTheDocument();
  });

  test('handles input changes correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Enter username and password
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Verify input values
    expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
    expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
  });

  test('submits form and handles successful login', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        accessToken: 'test-token',
        session: { id: '123', createdAt: new Date().toISOString() }
      })
    });
    
    const user = userEvent.setup();
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check fetch was called correctly
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'testuser', password: 'password123' }),
          credentials: 'include'
        })
      );
    });
    
    // Check login was called with token
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test-token', expect.anything());
    });
    
    // Check navigation to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles login failure correctly', async () => {
    // Mock failed API response
    const errorMessage = 'Invalid username or password';
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage })
    });
    
    const user = userEvent.setup();
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Login and navigate should not be called
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
}); 