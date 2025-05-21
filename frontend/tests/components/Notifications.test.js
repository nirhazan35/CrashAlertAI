import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithAllProviders } from '../utils/test-utils';
import NotificationCenter from '../../src/components/notifications/notificationDropbox';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useAccidentLogs hook
const mockUseAccidentLogs = jest.fn();
jest.mock('../../src/context/AccidentContext', () => ({
  useAccidentLogs: () => mockUseAccidentLogs(),
}));

describe('NotificationCenter', () => {
  const mockSetSelectedAlert = jest.fn();
  const mockSetNotifications = jest.fn();
  
  // Common test accident logs
  const mockAccidentLogs = [
    { _id: '1', location: 'Main Street', timestamp: '2024-03-20T10:00:00Z' },
    { _id: '2', location: 'Oak Avenue', timestamp: '2024-03-20T09:00:00Z' }
  ];
  
  // Default notifications for tests
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
    // Set default mock implementation
    mockUseAccidentLogs.mockReturnValue({
      setSelectedAlert: mockSetSelectedAlert,
      accidentLogs: mockAccidentLogs,
      notifications: mockNotifications,
      setNotifications: mockSetNotifications
    });
  });

  test('renders notification bell with correct unread count', () => {
    renderWithAllProviders(<NotificationCenter />);
    
    // The notification bell should be visible
    const bellIcon = screen.getByRole('button');
    expect(bellIcon).toBeInTheDocument();
    
    // The indicator should show "1" (for the one unread notification)
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('shows no notifications message when notifications array is empty', async () => {
    // Mock empty notifications
    mockUseAccidentLogs.mockReturnValue({
      setSelectedAlert: mockSetSelectedAlert,
      accidentLogs: mockAccidentLogs,
      notifications: [],
      setNotifications: mockSetNotifications
    });

    renderWithAllProviders(<NotificationCenter />);
    
    // Open the menu
    const bellIcon = screen.getByRole('button');
    fireEvent.click(bellIcon);
    
    // Should display the empty state message
    await waitFor(() => {
      expect(screen.getByText('No new notifications')).toBeInTheDocument();
    });
  });

  test('displays all notifications in the dropdown', async () => {
    renderWithAllProviders(<NotificationCenter />);
    
    // Open the menu
    const bellIcon = screen.getByRole('button');
    fireEvent.click(bellIcon);
    
    // Should display both notification messages
    await waitFor(() => {
      expect(screen.getByText('New accident detected at Main Street')).toBeInTheDocument();
      expect(screen.getByText('Accident at Oak Avenue has been handled')).toBeInTheDocument();
    });
    
    // Should also display the clear button
    expect(screen.getByText('Clear all notifications')).toBeInTheDocument();
  });

  test('marks notification as read and navigates when clicked', async () => {
    renderWithAllProviders(<NotificationCenter />);
    
    // Open the menu
    const bellIcon = screen.getByRole('button');
    fireEvent.click(bellIcon);
    
    // Click on a notification
    const notification = await screen.findByText('New accident detected at Main Street');
    fireEvent.click(notification);
    
    // Should set the selected alert
    expect(mockSetSelectedAlert).toHaveBeenCalledWith(mockAccidentLogs[0]);
    
    // Should mark the notification as read
    expect(mockSetNotifications).toHaveBeenCalledWith(
      expect.any(Function)
    );
    
    // Should navigate to the dashboard
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('clears all notifications when clear button is clicked', async () => {
    renderWithAllProviders(<NotificationCenter />);
    
    // Open the menu
    const bellIcon = screen.getByRole('button');
    fireEvent.click(bellIcon);
    
    // Click on the clear button
    const clearButton = await screen.findByText('Clear all notifications');
    fireEvent.click(clearButton);
    
    // Should clear notifications
    expect(mockSetNotifications).toHaveBeenCalledWith([]);
  });

  test('does not show indicator badge when there are no unread notifications', () => {
    // Mock all notifications as read
    const allReadNotifications = mockNotifications.map(n => ({ ...n, read: true }));
    
    mockUseAccidentLogs.mockReturnValue({
      setSelectedAlert: mockSetSelectedAlert,
      accidentLogs: mockAccidentLogs,
      notifications: allReadNotifications,
      setNotifications: mockSetNotifications
    });

    renderWithAllProviders(<NotificationCenter />);
    
    // The indicator should be disabled (not showing a number)
    const indicator = screen.queryByText('0');
    expect(indicator).not.toBeInTheDocument();
  });
});