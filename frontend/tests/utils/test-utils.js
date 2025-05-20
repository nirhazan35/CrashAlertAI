import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/authentication/AuthProvider';
import { AccidentProvider } from '../../src/context/AccidentContext';
import { MantineProvider } from '@mantine/core';
import theme from '../../src/theme/mantineTheme';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Create a separate file for the mock implementations
const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccidentProvider>
          <MantineProvider theme={theme} defaultColorScheme="light">
            {children}
          </MantineProvider>
        </AccidentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

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
    <BrowserRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
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
    <BrowserRouter initialEntries={[initialRoute]}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <AuthProvider>
          <AccidentProvider>
            {children}
          </AccidentProvider>
        </AuthProvider>
      </MantineProvider>
    </BrowserRouter>
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

// Mock the useAccidentLogs hook
jest.mock('../../src/context/AccidentContext', () => {
  const originalModule = jest.requireActual('../../src/context/AccidentContext');
  
  return {
    ...originalModule,
    useAccidentLogs: () => ({
      accidentLogs: [],
      selectedAlert: null,
      setSelectedAlert: jest.fn(),
      updateAccidentDetails: jest.fn(),
      clearSelectedAlert: jest.fn(),
      updateAccidentStatus: jest.fn(),
      handleRowDoubleClick: jest.fn(),
      notifications: [
        {
          accidentId: '1',
          msg: 'New accident detected at Main Street',
          read: false,
          timestamp: '2024-03-20T10:00:00Z'
        },
        {
          accidentId: '2',
          msg: 'Accident at Oak Avenue has been handled',
          read: true,
          timestamp: '2024-03-20T09:00:00Z'
        }
      ],
      setNotifications: jest.fn()
    }),
  };
});

// Mock the useAuth hook
jest.mock('../../src/authentication/AuthProvider', () => {
  const originalModule = jest.requireActual('../../src/authentication/AuthProvider');
  
  return {
    ...originalModule,
    useAuth: () => ({
      user: { username: 'testuser', role: 'user' },
      login: jest.fn(),
      logout: jest.fn(),
    }),
  };
});

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };

export {
  renderWithProviders,
  renderWithMantine,
  renderWithAllProviders,
  mockAuthenticatedUser,
  mockApiResponse
};