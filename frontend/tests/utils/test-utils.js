import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/authentication/AuthProvider';

// Mock AuthProvider implementation
jest.mock('../../src/authentication/AuthProvider', () => {
  const originalModule = jest.requireActual('../../src/authentication/AuthProvider');
  return {
    ...originalModule,
    AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
    useAuth: jest.fn()
  };
});

/**
 * Custom render function that wraps components with necessary providers
 * @param {JSX.Element} ui - The component to render
 * @param {Object} options - Additional render options
 * @param {Object} providerProps - Props to pass to providers
 * @returns {Object} - Object containing render results and additional helpers
 */
const renderWithProviders = (
  ui,
  {
    initialRoute = '/',
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Mock authenticated user for testing
 * @param {Object} role - User role (admin, user, etc.)
 * @returns {Object} - Mock user object
 */
const mockAuthenticatedUser = (role = 'user') => {
  return {
    isLoggedIn: true,
    role,
    username: 'testuser',
    token: 'mock-token'
  };
};

/**
 * Mock API response for testing
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @param {boolean} ok - Whether the response was successful
 * @returns {Object} - Mock fetch response
 */
const mockApiResponse = (data, status = 200, ok = true) => {
  return {
    ok,
    status,
    json: () => Promise.resolve(data)
  };
};

export {
  renderWithProviders,
  mockAuthenticatedUser,
  mockApiResponse
}; 