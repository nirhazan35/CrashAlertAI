import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../../src/pages/ForgotPassword/ForgotPassword';

// Mock fetch API
global.fetch = jest.fn();
global.console.error = jest.fn(); // Mock console.error to prevent logs during tests

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
  });

  it('renders the form correctly', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Page title
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    
    // Form description
    expect(screen.getByText(/Please enter your username and email to reset your password/i)).toBeInTheDocument();
    
    // Form inputs
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    
    // Submit button
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('allows entering username and email', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Enter username
    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput.value).toBe('testuser');
    
    // Enter email
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('submits the form with valid data', async () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Fill in the form
    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Check that fetch was called with the right arguments
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/users/request-password-change`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: 'testuser', 
            email: 'test@example.com' 
          }),
        }
      );
    });
    
    // Success message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/An email has been sent to your admin for further instructions/i)).toBeInTheDocument();
    });
    
    // Form should be reset
    expect(usernameInput.value).toBe('');
    expect(emailInput.value).toBe('');
  });

  it('displays error message when API request fails', async () => {
    // Mock a failed response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ 
        message: 'User not found' 
      })
    });
    
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Fill in the form
    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to send request: User not found/i)).toBeInTheDocument();
    });
    
    // Form should NOT be reset on error
    expect(usernameInput.value).toBe('wronguser');
    expect(emailInput.value).toBe('wrong@example.com');
  });

  it('handles network errors gracefully', async () => {
    // Mock a network error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Fill in the form
    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Generic error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/An error occurred while sending your request/i)).toBeInTheDocument();
    });
    
    // Should have logged the error
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it('validates required fields before submission', async () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Try to submit the form without filling it in
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Fetch should not be called
    expect(fetch).not.toHaveBeenCalled();
    
    // HTML5 validation would prevent submission, so the fetch won't be called
    // and no API call will be made
  });
}); 