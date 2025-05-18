import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/authentication/AuthProvider';
import { MantineProvider } from '@mantine/core';
import theme from '../../src/theme/mantineTheme';

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
 * Custom render function that wraps components with MantineProvider
 * @param {JSX.Element} ui - The component to render
 * @param {Object} options - Additional render options
 * @returns {Object} - Object containing render results and additional helpers
 */
const renderWithMantine = (
  ui,
  options = {}
) => {
  const Wrapper = ({ children }) => (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Custom render function that wraps components with both MantineProvider and other providers
 * @param {JSX.Element} ui - The component to render
 * @param {Object} options - Additional render options
 * @returns {Object} - Object containing render results and additional helpers
 */
const renderWithAllProviders = (
  ui,
  {
    initialRoute = '/',
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[initialRoute]}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <AuthProvider>
          {children}
        </AuthProvider>
      </MantineProvider>
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
  renderWithMantine,
  renderWithAllProviders,
  mockAuthenticatedUser,
  mockApiResponse
}; 