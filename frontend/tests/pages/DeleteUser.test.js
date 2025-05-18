import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DeleteUser from '../../src/pages/deleteUser/deleteUser';
import { useAuth } from '../../src/authentication/AuthProvider';
import * as AdminActions from '../../src/pages/AdminPage/AdminActions';
import { renderWithMantine } from '../utils/test-utils';

// Mock the dependencies
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/pages/AdminPage/AdminActions', () => ({
  fetchUsers: jest.fn(),
  deleteUser: jest.fn(),
}));

describe('DeleteUser Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  const mockUsers = [
    { _id: '1', username: 'user1', email: 'user1@example.com' },
    { _id: '2', username: 'user2', email: 'user2@example.com' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    AdminActions.fetchUsers.mockResolvedValue(mockUsers);
  });

  test('renders delete user form', async () => {
    renderWithMantine(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );

    expect(screen.getByText(/delete user/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  test('loads and displays users in dropdown', async () => {
    renderWithMantine(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(AdminActions.fetchUsers).toHaveBeenCalledWith(mockUser);
    });

    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  test('shows confirmation dialog when delete button is clicked', async () => {
    renderWithMantine(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );

    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    fireEvent.click(screen.getByText('user1'));

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText(/are you sure you want to delete this user/i)).toBeInTheDocument();
  });

  test('handles user deletion', async () => {
    AdminActions.deleteUser.mockResolvedValueOnce({ success: true });

    renderWithMantine(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );

    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    fireEvent.click(screen.getByText('user1'));

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(AdminActions.deleteUser).toHaveBeenCalledWith(mockUser, '1');
      expect(screen.getByText(/user deleted successfully/i)).toBeInTheDocument();
    });
  });

  test('handles deletion error', async () => {
    AdminActions.deleteUser.mockRejectedValueOnce(new Error('Failed to delete user'));

    renderWithMantine(
      <BrowserRouter>
        <DeleteUser />
      </BrowserRouter>
    );

    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    fireEvent.click(screen.getByText('user1'));

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to delete user/i)).toBeInTheDocument();
    });
  });
}); 