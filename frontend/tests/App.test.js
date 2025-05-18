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

// Mock all page components
jest.mock('../src/pages/Dashboard/Dashboard', () => () => <div data-testid="dashboard">Dashboard</div>);
jest.mock('../src/pages/Login/Login', () => () => <div data-testid="login">Login</div>);
jest.mock('../src/pages/AdminPage/AdminPage', () => () => <div data-testid="admin">Admin Page</div>);
jest.mock('../src/pages/Unauthorized/Unauthorized', () => () => <div data-testid="unauthorized">Unauthorized</div>);
jest.mock('../src/pages/Register/Register', () => () => <div data-testid="register">Register</div>);
jest.mock('../src/pages/StatisticsPage/StatisticsPage', () => () => <div data-testid="statistics">Statistics</div>);
jest.mock('../src/pages/AccidentHistory/AccidentHistory', () => () => <div data-testid="history">History</div>);
jest.mock('../src/pages/LiveCameraPage/LiveCameraPage', () => () => <div data-testid="live-camera">Live Camera</div>);
jest.mock('../src/pages/ResetPassword/ResetPassword', () => () => <div data-testid="reset-password">Reset Password</div>);
jest.mock('../src/pages/ForgotPassword/ForgotPassword', () => () => <div data-testid="forgot-password">Forgot Password</div>);
jest.mock('../src/pages/deleteUser/deleteUser', () => () => <div data-testid="delete-user">Delete User</div>);
jest.mock('../src/pages/ManageCameras/ManageCameras', () => () => <div data-testid="manage-cameras">Manage Cameras</div>);
jest.mock('../src/pages/AddNewCamera/AddCamera', () => () => <div data-testid="add-camera">Add Camera</div>);
jest.mock('../src/pages/RequestPasswordChange/RequestPasswordChange', () => () => <div data-testid="request-password-change">Request Password Change</div>);
jest.mock('../src/pages/AuthLogs/AuthLogs', () => () => <div data-testid="auth-logs">Auth Logs</div>);

// Mock layout components
jest.mock('../src/components/sidebar/SidebarLayout', () => ({ children }) => (
  <div data-testid="sidebar-layout">
    <div data-testid="sidebar-content">{children}</div>
  </div>
));

jest.mock('../src/components/MantineProvider/MantineProvider', () => ({ children }) => (
  <div data-testid="mantine-provider">{children}</div>
));

// Mock protected route
jest.mock('../src/authentication/ProtectedRoute', () => ({ children, allowedRoles }) => {
  const { useAuth } = require('../src/authentication/AuthProvider');
  const { user } = useAuth();
  
  if (!user?.isLoggedIn) {
    return <div data-testid="unauthorized">Unauthorized</div>;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div data-testid="unauthorized">Unauthorized</div>;
  }
  
  return <div data-testid="protected-route">{children}</div>;
});

// Mock the Router components
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div data-testid="routes">{children}</div>,
    Route: ({ element, path }) => {
      // Handle public routes
      if (path === '/login' || path === '/forgot-password' || path === '/request-password-change') {
        return <div data-testid="public-route">{element}</div>;
      }
      
      // Handle protected routes
      if (path === '/dashboard' || path === '/statistics' || path === '/history' || path === '/live') {
        return <div data-testid="protected-route">{element}</div>;
      }
      
      // Handle admin routes
      if (path === '/admin' || path === '/register' || path === '/reset-password' || 
          path === '/manage-cameras' || path === '/logs' || path === '/delete-user' || 
          path === '/add-new-camera') {
        return <div data-testid="admin-route">{element}</div>;
      }
      
      return <div data-testid="route">{element}</div>;
    },
    Navigate: ({ to }) => <div data-testid={`navigate-to-${to}`}>Navigate to {to}</div>
  };
});

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
      user: { isLoggedIn: true, role: 'user' }
    });
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate-to-/dashboard')).toBeInTheDocument();
  });

  test('renders public routes for unauthenticated users', () => {
    require('../src/authentication/AuthProvider').useAuth.mockReturnValue({
      user: { isLoggedIn: false }
    });
    
    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
  });

  test('renders protected routes for authenticated users', () => {
    require('../src/authentication/AuthProvider').useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'user' }
    });
    
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('renders admin routes only for admin users', () => {
    require('../src/authentication/AuthProvider').useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'admin' }
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('admin')).toBeInTheDocument();
  });

  test('redirects non-admin users from admin routes', () => {
    require('../src/authentication/AuthProvider').useAuth.mockReturnValue({
      user: { isLoggedIn: true, role: 'user' }
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
  });
}); 