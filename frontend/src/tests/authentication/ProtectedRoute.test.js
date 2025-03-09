import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../authentication/ProtectedRoute';
import { useAuth } from '../../authentication/AuthProvider';

// Mock the useAuth hook
jest.mock('../../authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

// Mock components for testing routes
const LoginPage = () => <div>Login Page</div>;
const UnauthorizedPage = () => <div>Unauthorized Page</div>;
const AdminPage = () => <div>Admin Page</div>;
const UserPage = () => <div>User Page</div>;

// Helper function to render the component with router
const renderWithRouter = (element) => {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={element}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/user" element={<UserPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Mock console.log
  });

  test('should show loading state when auth is loading', () => {
    // Setup mock for loading state
    useAuth.mockReturnValue({
      loading: true,
      user: null
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('Loading...');
  });

  test('should redirect to login page when user is not logged in', () => {
    // Setup mock for not logged in state
    useAuth.mockReturnValue({
      loading: false,
      user: { isLoggedIn: false }
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('User is not logged in');
  });

  test('should redirect to unauthorized page when user does not have permission', () => {
    // Setup mock for unauthorized user
    useAuth.mockReturnValue({
      loading: false,
      user: {
        isLoggedIn: true,
        role: 'user'
      }
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />);

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('User is not authorized');
  });

  test('should render the outlet when user is authorized (admin)', () => {
    // Setup mock for authorized admin
    useAuth.mockReturnValue({
      loading: false,
      user: {
        isLoggedIn: true,
        role: 'admin'
      }
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />);

    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  test('should render the outlet when user is authorized (user)', () => {
    // Setup mock for authorized user
    useAuth.mockReturnValue({
      loading: false,
      user: {
        isLoggedIn: true,
        role: 'user'
      }
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['user', 'admin']} />);

    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  test('should render the outlet when multiple roles are allowed', () => {
    // Setup mock for a user with one of multiple allowed roles
    useAuth.mockReturnValue({
      loading: false,
      user: {
        isLoggedIn: true,
        role: 'moderator'
      }
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['user', 'moderator', 'admin']} />);

    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  test('should handle null user object gracefully', () => {
    // Setup mock for null user (possibly during initialization)
    useAuth.mockReturnValue({
      loading: false,
      user: null
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('should handle undefined role gracefully', () => {
    // Setup mock for user with undefined role
    useAuth.mockReturnValue({
      loading: false,
      user: {
        isLoggedIn: true,
        role: undefined
      }
    });

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />);

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });
});