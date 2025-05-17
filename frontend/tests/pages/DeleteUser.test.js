import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DeleteUser from '../../src/pages/deleteUser/deleteUser';
import { useAuth } from '../../src/authentication/AuthProvider';
import * as AdminActions from '../../src/pages/AdminPage/AdminActions';

// Mock the dependencies
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/pages/AdminPage/AdminActions', () => ({
  fetchUsers: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

describe('DeleteUser Page', () => {
  const mockUser = {
    token: 'test-token',
    role: 'admin'
  };
  
  const mockUsers = [
    { _id: 'user1', username: 'testuser1', email: 'test1@example.com' },
    { _id: 'user2', username: 'testuser2', email: 'test2@example.com' },
    { _id: 'user3', username: 'testuser3', email: 'test3@example.com' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    useAuth.mockReturnValue({ user: mockUser });
    AdminActions.fetchUsers.mockResolvedValue(mockUsers);
    
    // Default fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
  });

  it('renders the page and loads users', async () => {
    render(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );
    
    // Check that the page title is rendered
    expect(screen.getByText('Delete User')).toBeInTheDocument();
    
    // Verify that fetchUsers was called
    expect(AdminActions.fetchUsers).toHaveBeenCalledWith(mockUser);
    
    // Wait for users to load in the dropdown
    await waitFor(() => {
      expect(screen.getByText(/Choose a user/i)).toBeInTheDocument();
    });
    
    // Check that all users are in the dropdown
    const selectElement = screen.getByLabelText(/Select User/i);
    expect(selectElement).toBeInTheDocument();
    
    // Verify the options are loaded
    await waitFor(() => {
      expect(screen.getByText(/testuser1 \(test1@example.com\)/)).toBeInTheDocument();
      expect(screen.getByText(/testuser2 \(test2@example.com\)/)).toBeInTheDocument();
      expect(screen.getByText(/testuser3 \(test3@example.com\)/)).toBeInTheDocument();
    });
  });

  it('handles user selection', async () => {
    render(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText(/Choose a user/i)).toBeInTheDocument();
    });
    
    // Select a user
    const selectElement = screen.getByLabelText(/Select User/i);
    fireEvent.change(selectElement, { target: { value: 'user2' } });
    
    // Delete button should be enabled
    const deleteButton = screen.getByRole('button', { name: /Delete User/i });
    expect(deleteButton).not.toBeDisabled();
  });

  it('shows confirmation dialog when delete is clicked', async () => {
    render(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText(/Choose a user/i)).toBeInTheDocument();
    });
    
    // Select a user
    const selectElement = screen.getByLabelText(/Select User/i);
    fireEvent.change(selectElement, { target: { value: 'user2' } });
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /Delete User/i });
    fireEvent.click(deleteButton);
    
    // Confirmation dialog should appear
    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to permanently delete this user\?/i)).toBeInTheDocument();
    
    // Confirm and Cancel buttons should be visible
    expect(screen.getByRole('button', { name: /Confirm Delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('cancels deletion when cancel is clicked', async () => {
    render(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText(/Choose a user/i)).toBeInTheDocument();
    });
    
    // Select a user
    const selectElement = screen.getByLabelText(/Select User/i);
    fireEvent.change(selectElement, { target: { value: 'user2' } });
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /Delete User/i });
    fireEvent.click(deleteButton);
    
    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    // Confirmation dialog should disappear
    expect(screen.queryByText(/Confirm Deletion/i)).not.toBeInTheDocument();
    
    // API should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('deletes user when confirmed', async () => {
    render(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText(/Choose a user/i)).toBeInTheDocument();
    });
    
    // Select a user
    const selectElement = screen.getByLabelText(/Select User/i);
    fireEvent.change(selectElement, { target: { value: 'user2' } });
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /Delete User/i });
    fireEvent.click(deleteButton);
    
    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /Confirm Delete/i });
    fireEvent.click(confirmButton);
    
    // API should be called with correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/users/user2`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        }
      );
    });
    
    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText(/User deleted successfully/i)).toBeInTheDocument();
    });
    
    // Users list should be refreshed
    expect(AdminActions.fetchUsers).toHaveBeenCalledTimes(2);
    
    // User selection should be reset
    expect(selectElement.value).toBe('');
  });

  it('handles delete error', async () => {
    // Mock an error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Cannot delete admin user' })
    });
    
    render(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText(/Choose a user/i)).toBeInTheDocument();
    });
    
    // Select a user
    const selectElement = screen.getByLabelText(/Select User/i);
    fireEvent.change(selectElement, { target: { value: 'user2' } });
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /Delete User/i });
    fireEvent.click(deleteButton);
    
    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /Confirm Delete/i });
    fireEvent.click(confirmButton);
    
    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/Deletion failed: Cannot delete admin user/i)).toBeInTheDocument();
    });
  });

  it('handles fetch users error', async () => {
    // Mock an error response for fetchUsers
    AdminActions.fetchUsers.mockRejectedValueOnce(new Error('Failed to fetch users'));
    
    render(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );
    
    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load users/i)).toBeInTheDocument();
    });
  });

  it('disables delete button when no user is selected', async () => {
    render(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );
    
    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText(/Choose a user/i)).toBeInTheDocument();
    });
    
    // Delete button should be disabled initially
    const deleteButton = screen.getByRole('button', { name: /Delete User/i });
    expect(deleteButton).toBeDisabled();
  });
}); 