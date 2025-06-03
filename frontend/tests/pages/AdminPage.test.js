import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import AdminPage from '../../src/pages/AdminPage/AdminPage';
import { useAuth } from '../../src/authentication/AuthProvider';
import { renderWithMantine } from '../utils/test-utils';

// Mock the hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

describe('AdminPage Component', () => {
  const mockNavigate = jest.fn();
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue({ user: mockUser });
  });

  test('renders admin page with all sections', () => {
    renderWithMantine(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome, Admin!')).toBeInTheDocument();
    expect(screen.getByText('Manage your system settings and configurations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage User\'s Cameras' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add New Camera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register New User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete User' })).toBeInTheDocument();
  });

  test('navigates to manage cameras page', () => {
    renderWithMantine(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );

    const manageCamerasButton = screen.getByRole('button', { name: 'Manage User\'s Cameras' });
    fireEvent.click(manageCamerasButton);
    expect(mockNavigate).toHaveBeenCalledWith('/manage-cameras');
  });

  test('navigates to add new camera page', () => {
    renderWithMantine(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );

    const addNewCameraButton = screen.getByRole('button', { name: 'Add New Camera' });
    fireEvent.click(addNewCameraButton);
    expect(mockNavigate).toHaveBeenCalledWith('/add-new-camera');
  });

  test('navigates to register page', () => {
    renderWithMantine(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );

    const registerButton = screen.getByRole('button', { name: 'Register New User' });
    fireEvent.click(registerButton);
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('navigates to delete user page', () => {
    renderWithMantine(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );

    const deleteUserButton = screen.getByRole('button', { name: 'Delete User' });
    fireEvent.click(deleteUserButton);
    expect(mockNavigate).toHaveBeenCalledWith('/delete-user');
  });
}); 