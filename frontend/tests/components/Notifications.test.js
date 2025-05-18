import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationCenter from '../../src/components/notifications/notificationDropbox';
import { useAuth } from '../../src/authentication/AuthProvider';
import { useAccidentLogs } from '../../src/context/AccidentContext';
import { renderWithMantine } from '../utils/test-utils';

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  Menu: ({ children, ...props }) => <div data-testid="mantine-menu" {...props}>{children}</div>,
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
  Tooltip: ({ children, ...props }) => <div {...props}>{children}</div>
}));

// Mock the hooks
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../src/context/AccidentContext', () => ({
  useAccidentLogs: jest.fn()
}));

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
    useAuth.mockReturnValue({ user: mockUser });
    useAccidentLogs.mockReturnValue({
      notifications: mockNotifications,
      markNotificationAsRead: jest.fn(),
      clearNotifications: jest.fn()
    });
  });

  test('renders notification center with unread count', () => {
    renderWithMantine(<NotificationCenter />);
    expect(screen.getByText('2')).toBeInTheDocument(); // Unread count
  });

  test('displays notifications when menu is opened', () => {
    renderWithMantine(<NotificationCenter />);
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('New accident detected at Main Street')).toBeInTheDocument();
    expect(screen.getByText('Accident at Oak Avenue has been handled')).toBeInTheDocument();
  });

  test('marks notification as read when clicked', () => {
    const mockMarkAsRead = jest.fn();
    useAccidentLogs.mockReturnValue({
      notifications: mockNotifications,
      markNotificationAsRead: mockMarkAsRead,
      clearNotifications: jest.fn()
    });

    renderWithMantine(<NotificationCenter />);
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    const notification = screen.getByText('New accident detected at Main Street');
    fireEvent.click(notification);
    
    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  test('clears all notifications when clear button is clicked', () => {
    const mockClearNotifications = jest.fn();
    useAccidentLogs.mockReturnValue({
      notifications: mockNotifications,
      markNotificationAsRead: jest.fn(),
      clearNotifications: mockClearNotifications
    });

    renderWithMantine(<NotificationCenter />);
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    const clearButton = screen.getByText(/clear all/i);
    fireEvent.click(clearButton);
    
    expect(mockClearNotifications).toHaveBeenCalled();
  });
}); 