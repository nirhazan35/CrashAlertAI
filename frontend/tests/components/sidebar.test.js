import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../src/components/sidebar/sidebar';
import { useAuth } from '../../src/authentication/AuthProvider';

// Mock the auth hook
jest.mock('../../authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

describe('Sidebar Component', () => {
  const mockLogout = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'user' },
      logout: mockLogout
    });
  });

  test('renders correctly for user role', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Check that user-specific menu items are rendered
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/statistics/i)).toBeInTheDocument();
    expect(screen.getByText(/history/i)).toBeInTheDocument();
    
    // Admin-specific items should not be rendered
    expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/manage cameras/i)).not.toBeInTheDocument();
  });

  test('renders correctly for admin role', () => {
    useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'admin' },
      logout: mockLogout
    });
    
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Check that admin-specific menu items are rendered
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/manage cameras/i)).toBeInTheDocument();
    
    // Common items should be rendered for both roles
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  test('handles logout correctly', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Find and click logout button
    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);
    
    // Check that logout function was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('navigation links have correct hrefs', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Check that links have correct hrefs
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /statistics/i })).toHaveAttribute('href', '/statistics');
    expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute('href', '/history');
  });
}); 