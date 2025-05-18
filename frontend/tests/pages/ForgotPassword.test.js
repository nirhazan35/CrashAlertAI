import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../../src/pages/ForgotPassword/ForgotPassword';
import { renderWithMantine } from '../utils/test-utils';

// Mock fetch API
global.fetch = jest.fn();
global.console.error = jest.fn(); // Mock console.error to prevent logs during tests

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
  });

  test('renders forgot password form', () => {
    renderWithMantine(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    renderWithMantine(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/users/request-password-change`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com'
          })
        })
      );
      expect(screen.getByText(/an email has been sent to your admin/i)).toBeInTheDocument();
    });
  });

  test('handles submission error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' })
    });

    renderWithMantine(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to send request: invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    renderWithMantine(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    renderWithMantine(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('handles network errors gracefully', async () => {
    // Mock a network error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    renderWithMantine(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    // Fill in the form
    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    
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
}); 