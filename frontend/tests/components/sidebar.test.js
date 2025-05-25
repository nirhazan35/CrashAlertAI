import React from 'react';
import { screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../src/components/sidebar/sidebar';
import { useAuth } from '../../src/authentication/AuthProvider';
import { renderWithMantine } from '../utils/test-utils';

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  Navbar: ({ children, ...props }) => <div data-testid="mantine-navbar" {...props}>{children}</div>,
  Stack: ({ children, ...props }) => <div {...props}>{children}</div>,
  Group: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }) => <div {...props}>{children}</div>,
  UnstyledButton: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  ThemeIcon: ({ children, ...props }) => <div {...props}>{children}</div>,
  Divider: ({ label, ...props }) => (
    <div className="mantine-divider" {...props}>
      <hr />
      {label && <div className="mantine-divider-label">{label}</div>}
    </div>
  ),
  Box: ({ children, ...props }) => <div {...props}>{children}</div>
}));

// Mock the auth hook
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'user' }
    });
  });

  test('renders correctly for user role', () => {
    renderWithMantine(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Check that user-specific menu items are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Live Feed')).toBeInTheDocument();
    
    // Admin-specific items should not be rendered
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Logs' })).not.toBeInTheDocument();
  });

  test('renders correctly for admin role', () => {
    useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'admin' }
    });
    
    renderWithMantine(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Check that admin-specific menu items are rendered
    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Logs' })).toBeInTheDocument();
    
    // Common items should be rendered for both roles
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Live Feed')).toBeInTheDocument();
  });

  test('navigation links have correct hrefs', () => {
    renderWithMantine(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Check that links have correct hrefs
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Statistics' })).toHaveAttribute('href', '/statistics');
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/history');
    expect(screen.getByRole('link', { name: 'Live Feed' })).toHaveAttribute('href', '/live');
  });
}); 