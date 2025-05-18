import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AddNewCamera from '../../src/pages/AddNewCamera/AddCamera';
import { useAuth } from '../../src/authentication/AuthProvider';
import * as AdminActions from '../../src/pages/AdminPage/AdminActions';
import { renderWithMantine } from '../utils/test-utils';

// Mock the authentication
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../src/pages/AdminPage/AdminActions', () => ({
  addCamera: jest.fn()
}));

describe('AddNewCamera Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
  });

  test('renders add camera form', () => {
    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    expect(screen.getByText(/add new camera/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /camera name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /location/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /ip address/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add camera/i })).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    AdminActions.addCamera.mockResolvedValueOnce({ success: true });

    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    const nameInput = screen.getByRole('textbox', { name: /camera name/i });
    const locationInput = screen.getByRole('textbox', { name: /location/i });
    const ipInput = screen.getByRole('textbox', { name: /ip address/i });
    const submitButton = screen.getByRole('button', { name: /add camera/i });

    fireEvent.change(nameInput, { target: { value: 'Test Camera' } });
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    fireEvent.change(ipInput, { target: { value: '192.168.1.1' } });
    fireEvent.click(submitButton);

    expect(AdminActions.addCamera).toHaveBeenCalledWith({
      name: 'Test Camera',
      location: 'Test Location',
      ipAddress: '192.168.1.1',
      status: 'active'
    });
  });

  test('validates required fields', async () => {
    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /add camera/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/camera name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/location is required/i)).toBeInTheDocument();
    expect(screen.getByText(/ip address is required/i)).toBeInTheDocument();
  });

  test('validates IP address format', async () => {
    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    const ipInput = screen.getByRole('textbox', { name: /ip address/i });
    fireEvent.change(ipInput, { target: { value: 'invalid-ip' } });

    const submitButton = screen.getByRole('button', { name: /add camera/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/invalid ip address format/i)).toBeInTheDocument();
  });

  test('handles submission error', async () => {
    AdminActions.addCamera.mockRejectedValueOnce(new Error('Failed to add camera'));

    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    const nameInput = screen.getByRole('textbox', { name: /camera name/i });
    const locationInput = screen.getByRole('textbox', { name: /location/i });
    const ipInput = screen.getByRole('textbox', { name: /ip address/i });
    const submitButton = screen.getByRole('button', { name: /add camera/i });

    fireEvent.change(nameInput, { target: { value: 'Test Camera' } });
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    fireEvent.change(ipInput, { target: { value: '192.168.1.1' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to add camera/i)).toBeInTheDocument();
    });
  });

  test('navigates back to manage cameras page', () => {
    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    const backButton = screen.getByRole('link', { name: /back/i });
    expect(backButton).toHaveAttribute('href', '/manage-cameras');
  });
}); 