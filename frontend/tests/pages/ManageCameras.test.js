import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ManageUserCameras from '../../src/pages/ManageCameras/ManageCameras';
import { useAuth } from '../../src/authentication/AuthProvider';
import * as AdminActions from '../../src/pages/AdminPage/AdminActions';

// Mock the authentication
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock the admin actions
jest.mock('../../src/pages/AdminPage/AdminActions', () => ({
  fetchUsers: jest.fn(),
  fetchCameras: jest.fn(),
  fetchAssignedCameras: jest.fn(),
  updateAssignedCameras: jest.fn(),
}));

describe('ManageCameras Component', () => {
  const mockUser = { token: 'mock-token' };
  const mockUsers = [
    { _id: 'user1', username: 'User One' },
    { _id: 'user2', username: 'User Two' },
  ];
  const mockCameras = [
    { _id: 'cam1', cameraId: 'CAM001', name: 'Main Entrance Camera' },
    { _id: 'cam2', cameraId: 'CAM002', name: 'Parking Lot Camera' },
    { _id: 'cam3', cameraId: 'CAM003', name: 'Loading Dock Camera' },
  ];
  const mockAssignedCameras = ['CAM001', 'CAM003'];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    useAuth.mockReturnValue({ user: mockUser });
    AdminActions.fetchUsers.mockResolvedValue(mockUsers);
    AdminActions.fetchCameras.mockResolvedValue(mockCameras);
    AdminActions.fetchAssignedCameras.mockResolvedValue(mockAssignedCameras);
    AdminActions.updateAssignedCameras.mockResolvedValue({ success: true });
  });

  it('renders the initial state correctly', async () => {
    render(
      <BrowserRouter>
        <ManageUserCameras />
      </BrowserRouter>
    );
    
    // Check if the component loaded
    expect(screen.getByText('User Selection')).toBeInTheDocument();
    expect(screen.getByText('Select a user from the sidebar to manage their camera assignments')).toBeInTheDocument();
    
    // Verify API calls
    await waitFor(() => {
      expect(AdminActions.fetchUsers).toHaveBeenCalledWith(mockUser);
    });
    
    await waitFor(() => {
      expect(AdminActions.fetchCameras).toHaveBeenCalledWith(mockUser);
    });
    
    // Check if users are loaded in the select
    await waitFor(() => {
      expect(screen.getByText('Choose a user')).toBeInTheDocument();
    });
  });

  it('loads assigned cameras when a user is selected', async () => {
    render(
      <BrowserRouter>
        <ManageUserCameras />
      </BrowserRouter>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(AdminActions.fetchUsers).toHaveBeenCalled();
    });
    
    // Select a user
    const userSelect = screen.getByText('Choose a user');
    fireEvent.click(userSelect);
    
    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });
    
    // Select the first user
    fireEvent.click(screen.getByText('User One'));
    
    // Verify that fetchAssignedCameras was called with the selected user ID
    await waitFor(() => {
      expect(AdminActions.fetchAssignedCameras).toHaveBeenCalledWith(mockUser, 'user1');
    });
    
    // Check if the assigned cameras are displayed
    await waitFor(() => {
      expect(screen.getByText('Assign Cameras')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('2 cameras assigned')).toBeInTheDocument();
    });
    
    // Verify that cameras have the correct checked state
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked(); // CAM001 should be checked
    expect(checkboxes[1]).not.toBeChecked(); // CAM002 should not be checked
    expect(checkboxes[2]).toBeChecked(); // CAM003 should be checked
  });

  it('toggles camera assignment correctly', async () => {
    render(
      <BrowserRouter>
        <ManageUserCameras />
      </BrowserRouter>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(AdminActions.fetchUsers).toHaveBeenCalled();
    });
    
    // Select a user
    const userSelect = screen.getByText('Choose a user');
    fireEvent.click(userSelect);
    
    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });
    
    // Select the first user
    fireEvent.click(screen.getByText('User One'));
    
    // Wait for assigned cameras to load
    await waitFor(() => {
      expect(AdminActions.fetchAssignedCameras).toHaveBeenCalled();
    });
    
    // Toggle camera assignments
    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // CAM001 checkbox - toggle off
    fireEvent.click(checkboxes[1]); // CAM002 checkbox - toggle on
    
    // Save the changes
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Verify updateAssignedCameras was called with updated camera list
    await waitFor(() => {
      expect(AdminActions.updateAssignedCameras).toHaveBeenCalledWith(
        mockUser,
        'user1',
        ['CAM003', 'CAM002'] // CAM001 removed, CAM002 added, CAM003 remained
      );
    });
  });

  it('clears selection after saving changes', async () => {
    render(
      <BrowserRouter>
        <ManageUserCameras />
      </BrowserRouter>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(AdminActions.fetchUsers).toHaveBeenCalled();
    });
    
    // Select a user
    const userSelect = screen.getByText('Choose a user');
    fireEvent.click(userSelect);
    
    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });
    
    // Select the first user
    fireEvent.click(screen.getByText('User One'));
    
    // Wait for assigned cameras to load and save button to appear
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
    
    // Save the changes
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify the component resets to initial state
    await waitFor(() => {
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Select a user from the sidebar to manage their camera assignments')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    AdminActions.fetchUsers.mockRejectedValueOnce(new Error('Failed to fetch users'));
    
    // Silence console.error for this test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(
      <BrowserRouter>
        <ManageUserCameras />
      </BrowserRouter>
    );
    
    // Wait for API call to fail
    await waitFor(() => {
      expect(AdminActions.fetchUsers).toHaveBeenCalled();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
    
    // Component should still render without crashing
    expect(screen.getByText('User Selection')).toBeInTheDocument();
  });
}); 