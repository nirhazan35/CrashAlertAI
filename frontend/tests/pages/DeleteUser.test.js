import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DeleteUser from '../../src/pages/deleteUser/deleteUser';
import { useAuth } from '../../src/authentication/AuthProvider';
import * as AdminActions from '../../src/pages/AdminPage/AdminActions';
import { renderWithMantine } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';

// Mock the dependencies
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../src/pages/AdminPage/AdminActions', () => ({
  fetchUsers: jest.fn()
}));

describe('DeleteUser Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  const mockUsers = [
    { _id: '1', username: 'user1', email: 'user1@example.com', role: 'user' },
    { _id: '2', username: 'user2', email: 'user2@example.com', role: 'admin' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    AdminActions.fetchUsers.mockResolvedValue(mockUsers);
  });

  const renderComponent = () => {
    return renderWithMantine(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );
  };

  test('renders delete user form', async () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: 'Delete User' })).toBeInTheDocument();
    expect(screen.getByText('Select a user to permanently delete their account')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument();

    await waitFor(() => {
      expect(AdminActions.fetchUsers).toHaveBeenCalledWith(mockUser);
    });
  });

  test('loads and displays users in dropdown', async () => {
    renderComponent();

    // Wait for users to be loaded
    await waitFor(() => {
      expect(AdminActions.fetchUsers).toHaveBeenCalledWith(mockUser);
    });

    // Wait for options to be rendered
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3); // Default option + 2 users
    });

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('');
    
    // Check for the default option
    expect(screen.getByRole('option', { name: 'Choose a user' })).toBeInTheDocument();
    
    // Check for user options
    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveTextContent('user1 (user1@example.com)');
    expect(options[2]).toHaveTextContent('user2 (user2@example.com)');
  });

  test('shows confirmation dialog when delete button is clicked', async () => {
    renderComponent();

    // Wait for users to be loaded and options to be rendered
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });

    // Select a user
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    // Get the button and click it
    const deleteButton = screen.getByRole('button', { name: 'Delete User' });
    fireEvent.click(deleteButton);

    // Wait for and verify confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to permanently delete this user\?/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  test('handles user deletion', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    global.fetch = mockFetch;

    renderComponent();

    // Wait for users to be loaded and options to be rendered
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });

    // Select a user
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    // Get the button and click it
    const deleteButton = screen.getByRole('button', { name: 'Delete User' });
    fireEvent.click(deleteButton);

    // Wait for confirmation dialog and click confirm
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });
    const confirmButton = screen.getByRole('button', { name: 'Confirm Delete' });
    fireEvent.click(confirmButton);

    // Verify API call and success message
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockUser.token}`
          })
        })
      );
      expect(screen.getByText('User deleted successfully')).toBeInTheDocument();
    });
  });

  test('handles deletion error', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Failed to delete user' })
    });
    global.fetch = mockFetch;

    renderComponent();

    // Wait for users to be loaded and options to be rendered
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });

    // Select a user
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    // Get the button and click it
    const deleteButton = screen.getByRole('button', { name: 'Delete User' });
    fireEvent.click(deleteButton);

    // Wait for confirmation dialog and click confirm
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });
    const confirmButton = screen.getByRole('button', { name: 'Confirm Delete' });
    fireEvent.click(confirmButton);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText('Deletion failed: Failed to delete user')).toBeInTheDocument();
    });
  });

  test('handles fetch users error', async () => {
    AdminActions.fetchUsers.mockRejectedValueOnce(new Error('Failed to load users'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });
});