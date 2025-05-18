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
  fetchCameras: jest.fn(),
  deleteCamera: jest.fn(),
  updateCamera: jest.fn()
}));

describe('ManageCameras Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  const mockCameras = [
    {
      _id: '1',
      name: 'Camera1',
      location: 'Location1',
      status: 'active',
      ipAddress: '192.168.1.1'
    },
    {
      _id: '2',
      name: 'Camera2',
      location: 'Location2',
      status: 'inactive',
      ipAddress: '192.168.1.2'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    AdminActions.fetchCameras.mockResolvedValue(mockCameras);
  });

  test('renders manage cameras page', () => {
    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    expect(screen.getByText(/manage cameras/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add new camera/i })).toBeInTheDocument();
  });

  test('displays camera data in table', async () => {
    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera1')).toBeInTheDocument();
      expect(screen.getByText('Location1')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });
  });

  test('handles camera deletion', async () => {
    AdminActions.deleteCamera.mockResolvedValueOnce({ success: true });

    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera1')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);

    expect(AdminActions.deleteCamera).toHaveBeenCalledWith('1');
  });

  test('handles camera status update', async () => {
    AdminActions.updateCamera.mockResolvedValueOnce({ success: true });

    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera1')).toBeInTheDocument();
    });

    const statusToggle = screen.getAllByRole('switch')[0];
    fireEvent.click(statusToggle);

    expect(AdminActions.updateCamera).toHaveBeenCalledWith('1', { status: 'inactive' });
  });

  test('navigates to add new camera page', () => {
    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    const addButton = screen.getByRole('button', { name: /add new camera/i });
    expect(addButton).toHaveAttribute('href', '/add-camera');
  });

  test('handles error when loading cameras', async () => {
    AdminActions.fetchCameras.mockRejectedValueOnce(new Error('Failed to load cameras'));

    renderWithMantine(
      <BrowserRouter>
        <ManageCameras />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load cameras/i)).toBeInTheDocument();
    });
  });
}); 