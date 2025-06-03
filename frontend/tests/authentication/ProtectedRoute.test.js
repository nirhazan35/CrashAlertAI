import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/authentication/ProtectedRoute';
import { useAuth } from '../../src/authentication/AuthProvider';

// Mock the auth hook
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

// Mock react-router-dom's Outlet
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet-content">Outlet Content</div>
}));

// Mock console.log
const originalConsoleLog = console.log;
console.log = jest.fn();

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  test('renders outlet when user is logged in and has the correct role', () => {
    useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'admin' },
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Child Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    expect(console.log).not.toHaveBeenCalled();
  });

  test('redirects to /unauthorized when user does not have the correct role', () => {
    useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'user' },
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Child Content</div>
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={<div data-testid="unauthorized">Unauthorized</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('outlet-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('User is not authorized');
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
              <div>Child Content</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div data-testid="login">Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('outlet-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('login')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('User is not logged in');
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
              <div>Child Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('outlet-content')).not.toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('Loading...');
  });
}); 