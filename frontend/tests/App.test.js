import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import { AuthProvider } from '../src/authentication/AuthProvider';

// Mock the components and hooks used in App.js
jest.mock('../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

jest.mock('../src/pages/Dashboard/Dashboard', () => () => <div data-testid="dashboard">Dashboard</div>);
jest.mock('../src/pages/Login/Login', () => () => <div data-testid="login">Login</div>);
jest.mock('../src/pages/AdminPage/AdminPage', () => () => <div data-testid="admin">Admin Page</div>);
jest.mock('../src/components/sidebar/SidebarLayout', () => ({ children }) => <div data-testid="sidebar-layout">{children}</div>);
jest.mock('../src/authentication/ProtectedRoute', () => ({ children }) => <div data-testid="protected-route">{children}</div>);

describe('App Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('renders login route correctly for unauthenticated users', () => {
    require('../src/authentication/AuthProvider').useAuth.mockReturnValue({
      user: { isLoggedIn: false }
    });
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  test('redirects to dashboard when authenticated user tries to access login', () => {
    require('../src/authentication/AuthProvider').useAuth.mockReturnValue({
      user: { isLoggedIn: true }
    });
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    // Should not find login page
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });
}); 