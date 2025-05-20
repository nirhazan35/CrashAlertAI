import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationCenter from '../../src/components/notifications/notificationDropbox';
import { renderWithAllProviders } from '../utils/test-utils';

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  Menu: ({ children, ...props }) => (
    <div data-testid="mantine-menu" {...props}>
      {children}
    </div>
  ),
  MenuTarget: ({ children }) => <div>{children}</div>,
  MenuDropdown: ({ children }) => <div>{children}</div>,
  MenuItem: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  UnstyledButton: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Text: ({ children, ...props }) => <div {...props}>{children}</div>,
  Badge: ({ children, ...props }) => <div {...props}>{children}</div>,
  Group: ({ children, ...props }) => <div {...props}>{children}</div>,
  Stack: ({ children, ...props }) => <div {...props}>{children}</div>,
  ActionIcon: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Tooltip: ({ children, ...props }) => <div {...props}>{children}</div>,
  Indicator: ({ children, label, ...props }) => (
    <div {...props}>
      {label && <span>{label}</span>}
      {children}
    </div>
  ),
  Divider: ({ children, ...props }) => <hr {...props}>{children}</hr>
}));

// Mock the hooks in the test file, not in test-utils
jest.mock('../../src/authentication/AuthProvider');
jest.mock('../../src/context/AccidentContext');

describe('NotificationCenter Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'user',
    token: 'test-token'
  };

  const mockNotifications = [
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks directly in the test file
    const { useAuth } = require('../../src/authentication/AuthProvider');
    useAuth.mockReturnValue({ user: mockUser });
    
    const { useAccidentLogs } = require('../../src/context/AccidentContext');
    useAccidentLogs.mockReturnValue({
      accidentLogs: [],
      selectedAlert: null,
      setSelectedAlert: jest.fn(),
      updateAccidentDetails: jest.fn(),
      clearSelectedAlert: jest.fn(),
      updateAccidentStatus: jest.fn(),
      handleRowDoubleClick: jest.fn(),
      notifications: mockNotifications,
      setNotifications: jest.fn()
    });
  });

  test('renders notification center with unread count', () => {
    renderWithAllProviders(<NotificationCenter />);
    expect(screen.getByText('2')).toBeInTheDocument(); // Unread count
  });

  test('displays notifications when menu is opened', () => {
    renderWithAllProviders(<NotificationCenter />);
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('New accident detected at Main Street')).toBeInTheDocument();
    expect(screen.getByText('Accident at Oak Avenue has been handled')).toBeInTheDocument();
  });

  test('marks notification as read when clicked', () => {
    const mockSetSelectedAlert = jest.fn();
    const mockSetNotifications = jest.fn();

    const { useAccidentLogs } = require('../../src/context/AccidentContext');
    useAccidentLogs.mockReturnValue({
      accidentLogs: [],
      selectedAlert: null,
      setSelectedAlert: mockSetSelectedAlert,
      updateAccidentDetails: jest.fn(),
      clearSelectedAlert: jest.fn(),
      updateAccidentStatus: jest.fn(),
      handleRowDoubleClick: jest.fn(),
      notifications: mockNotifications,
      setNotifications: mockSetNotifications
    });

    renderWithAllProviders(<NotificationCenter />);
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    const notification = screen.getByText('New accident detected at Main Street');
    fireEvent.click(notification);
    
    expect(mockSetNotifications).toHaveBeenCalled();
    expect(mockSetSelectedAlert).toHaveBeenCalled();
  });

  test('clears all notifications when clear button is clicked', () => {
    const mockSetNotifications = jest.fn();

    const { useAccidentLogs } = require('../../src/context/AccidentContext');
    useAccidentLogs.mockReturnValue({
      accidentLogs: [],
      selectedAlert: null,
      setSelectedAlert: jest.fn(),
      updateAccidentDetails: jest.fn(),
      clearSelectedAlert: jest.fn(),
      updateAccidentStatus: jest.fn(),
      handleRowDoubleClick: jest.fn(),
      notifications: mockNotifications,
      setNotifications: mockSetNotifications
    });

    renderWithAllProviders(<NotificationCenter />);
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    const clearButton = screen.getByText(/clear all/i);
    fireEvent.click(clearButton);
    
    expect(mockSetNotifications).toHaveBeenCalledWith([]);
  });
});