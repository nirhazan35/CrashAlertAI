import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ManageCameras from '../../src/pages/ManageCameras/ManageCameras';
import { useAuth } from '../../src/authentication/AuthProvider';
import * as AdminActions from '../../src/pages/AdminPage/AdminActions';
import { renderWithMantine } from '../utils/test-utils';

// Mock the authentication
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../src/pages/AdminPage/AdminActions', () => ({
  fetchUsers: jest.fn(),
  fetchCameras: jest.fn(),
  fetchAssignedCameras: jest.fn(),
  updateAssignedCameras: jest.fn()
}));

describe('ManageCameras Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  const mockUsers = [
    {
      _id: '1',
      username: 'user1',
      role: 'user'
    },
    {
      _id: '2',
      username: 'user2',
      role: 'user'
    }
  ];

  const mockCameras = [
    {
      _id: '1',
      cameraId: 'CAM001',
      name: 'Camera1',
      location: 'Location1',
      status: 'active',
      ipAddress: '192.168.1.1'
    },
    {
      _id: '2',
      cameraId: 'CAM002',
      name: 'Camera2',
      location: 'Location2',
      status: 'inactive',
      ipAddress: '192.168.1.2'
    }
  ];

  const mockAssignedCameras = ['CAM001'];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    AdminActions.fetchUsers.mockResolvedValue(mockUsers);
    AdminActions.fetchCameras.mockResolvedValue(mockCameras);
    AdminActions.fetchAssignedCameras.mockResolvedValue(mockAssignedCameras);
    AdminActions.updateAssignedCameras.mockResolvedValue({ success: true });
  });

  test('renders manage cameras page', () => {
    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    expect(screen.getByText('User Selection')).toBeInTheDocument();
    expect(screen.getByText('Select a User')).toBeInTheDocument();
  });

  test('loads and displays users in select dropdown', async () => {
    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });

  test('loads and displays cameras when user is selected', async () => {
    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Select a user
    const select = screen.getByTestId('user-select');
    fireEvent.mouseDown(select);
    const option = screen.getByText('user1');
    fireEvent.click(option);

    // Wait for cameras to load
    await waitFor(() => {
      expect(screen.getByText('Assign Cameras')).toBeInTheDocument();
      expect(screen.getByText('Camera1')).toBeInTheDocument();
      expect(screen.getByText('Camera2')).toBeInTheDocument();
      expect(screen.getByText('1 cameras assigned')).toBeInTheDocument();
    });
  });

  test('handles camera assignment changes', async () => {
    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Select a user
    const select = screen.getByTestId('user-select');
    fireEvent.mouseDown(select);
    const option = screen.getByText('user1');
    fireEvent.click(option);

    // Wait for cameras to load
    await waitFor(() => {
      expect(screen.getByText('Camera1')).toBeInTheDocument();
    });

    // Toggle camera assignment
    const checkbox = screen.getByTestId('camera-checkbox-CAM001');
    fireEvent.click(checkbox);

    // Save changes
    const saveButton = screen.getByTestId('save-changes-button');
    fireEvent.click(saveButton);

    expect(AdminActions.updateAssignedCameras).toHaveBeenCalledWith(
      mockUser,
      '1',
      []
    );
  });

  test('handles error when loading users', async () => {
    AdminActions.fetchUsers.mockRejectedValueOnce(new Error('Failed to load users'));

    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });

  test('handles error when loading cameras', async () => {
    // First render with successful user fetch
    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Select a user
    const select = screen.getByTestId('user-select');
    fireEvent.mouseDown(select);
    const option = screen.getByText('user1');
    fireEvent.click(option);

    // Wait for initial camera load
    await waitFor(() => {
      expect(screen.getByText('Assign Cameras')).toBeInTheDocument();
    });

    // Mock camera fetch failure
    AdminActions.fetchAssignedCameras.mockRejectedValueOnce(new Error('Failed to load cameras'));

    // Clear the selected user by clicking the clear button
    const clearButton = screen.getByTestId('clear-user-button');
    fireEvent.click(clearButton);

    // Select the user again to trigger the error
    fireEvent.mouseDown(select);
    fireEvent.click(option);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to load cameras')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
}); 