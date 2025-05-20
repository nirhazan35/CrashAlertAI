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
  addNewCamera: jest.fn(),
  fetchUsers: jest.fn()
}));

describe('AddNewCamera Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  const mockUsers = [
    { _id: '1', username: 'user1' },
    { _id: '2', username: 'user2' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    AdminActions.fetchUsers.mockResolvedValue(mockUsers);
  });

  test('renders add camera form', async () => {
    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/add new camera/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter unique camera identifier/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter camera location details/i)).toBeInTheDocument();
      expect(screen.getByText(/assign users/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register camera/i })).toBeInTheDocument();
    });
  });

  test('handles form submission', async () => {
    AdminActions.addNewCamera.mockResolvedValueOnce({ success: true, message: 'Camera added successfully!' });

    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    const cameraIdInput = screen.getByPlaceholderText(/enter unique camera identifier/i);
    const locationInput = screen.getByPlaceholderText(/enter camera location details/i);
    const submitButton = screen.getByRole('button', { name: /register camera/i });

    await fireEvent.change(cameraIdInput, { target: { value: 'CAM001' } });
    await fireEvent.change(locationInput, { target: { value: 'Main Entrance' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(AdminActions.addNewCamera).toHaveBeenCalledWith(mockUser, {
        cameraId: 'CAM001',
        location: 'Main Entrance',
        users: []
      });
      expect(screen.getByText(/camera added successfully!/i)).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /register camera/i });
    
    // Click submit button with empty fields
    await fireEvent.click(submitButton);

    // Wait for the error message to appear in the DOM
    await waitFor(() => {
      expect(screen.getByText(/Camera ID and Location are required/i)).toBeInTheDocument();
    });
  });

  test('handles submission error', async () => {
    AdminActions.addNewCamera.mockRejectedValueOnce(new Error('Failed to add camera'));

    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    const cameraIdInput = screen.getByPlaceholderText(/enter unique camera identifier/i);
    const locationInput = screen.getByPlaceholderText(/enter camera location details/i);
    const submitButton = screen.getByRole('button', { name: /register camera/i });

    await fireEvent.change(cameraIdInput, { target: { value: 'CAM001' } });
    await fireEvent.change(locationInput, { target: { value: 'Main Entrance' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/an error occurred while adding the camera/i)).toBeInTheDocument();
    });
  });

  test('loads and displays users in multi-select', async () => {
    renderWithMantine(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(AdminActions.fetchUsers).toHaveBeenCalledWith(mockUser);
      expect(screen.getByText(/assign users/i)).toBeInTheDocument();
    });
  });
});