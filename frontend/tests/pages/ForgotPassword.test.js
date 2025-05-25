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

    expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument();
    expect(screen.getByText('Please enter your username and email to reset your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
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

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/request-password-change'),
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
      expect(screen.getByText('An email has been sent to your admin for further instructions.')).toBeInTheDocument();
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

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to send request: Invalid credentials')).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    renderWithMantine(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await fireEvent.click(submitButton);

    // Check that the form elements are marked as required
    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    
    expect(usernameInput).toBeRequired();
    expect(emailInput).toBeRequired();
  });

  test('validates email format', async () => {
    renderWithMantine(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('handles network errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    renderWithMantine(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
    
    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('An error occurred while sending your request.')).toBeInTheDocument();
    });
    
    expect(console.error).toHaveBeenCalled();
  });
}); 