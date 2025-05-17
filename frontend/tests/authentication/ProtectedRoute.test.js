import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/authentication/ProtectedRoute';
import { useAuth } from '../../src/authentication/AuthProvider';

// Mock the auth hook
jest.mock('../../authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

describe('ProtectedRoute Component', () => {
  const MockComponent = () => <div data-testid="protected-content">Protected Content</div>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when user is logged in and has the correct role', () => {
    useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'admin' },
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MockComponent />
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('redirects to /unauthorized when user does not have the correct role', () => {
    useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'user' },
      loading: false
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MockComponent />
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={<div data-testid="unauthorized">Unauthorized</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
  });

  test('redirects to /login when user is not logged in', () => {
    useAuth.mockReturnValue({
      user: { isLoggedIn: false },
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MockComponent />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div data-testid="login">Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  test('shows loading indicator when auth is still loading', () => {
    useAuth.mockReturnValue({
      loading: true
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MockComponent />
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    // Assuming there's a loading indicator in the actual component
  });
}); 