import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Register from '../../src/pages/Register/Register';
import { useAuth } from '../../src/authentication/AuthProvider';

// Mock the dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

describe('Register Page', () => {
  const mockNavigate = jest.fn();
  const mockUser = {
    role: 'admin',
    isLoggedIn: true,
    token: 'test-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue({ user: mockUser });
    
    // Mock a successful registration response
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        success: true,
        message: 'User registered successfully' 
      })
    });
  });

  it('renders the registration form correctly', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Check that the form title is displayed
    expect(screen.getByText(/register new user/i)).toBeInTheDocument();
    
    // Check that all form fields are present
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    
    // Check that role selection is present
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    
    // Check that the submit button is present
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('validates form fields correctly', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    // Should display validation errors
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Fill in mismatched passwords
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password456' }
    });
    
    fireEvent.click(submitButton);
    
    // Should show password match error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    
    // Fill invalid email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' }
    });
    
    fireEvent.click(submitButton);
    
    // Should show email validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' }
    });
    
    // Select user role
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: 'user' }
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    // Verify API call was made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/users/register`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockUser.token}`
          },
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: 'user'
          })
        })
      );
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/user registered successfully/i)).toBeInTheDocument();
    });
    
    // Form should be reset after submission - check each field separately
    await waitFor(() => {
      expect(screen.getByLabelText(/username/i).value).toBe('');
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i).value).toBe('');
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/password/i).value).toBe('');
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/confirm password/i).value).toBe('');
    });
  });

  it('handles registration errors', async () => {
    // Mock a failed registration response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        success: false,
        message: 'Username already exists' 
      })
    });
    
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'existinguser' }
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
    });
  });

  it('redirects if user role is not admin', () => {
    // Set user role to non-admin
    useAuth.mockReturnValue({ 
      user: { ...mockUser, role: 'user' } 
    });
    
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Should redirect to unauthorized page
    expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
  });

  it('allows navigation back to admin page', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Find and click the back button
    const backButton = screen.getByText(/back to admin page/i);
    fireEvent.click(backButton);
    
    // Should navigate to admin page
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });
}); 