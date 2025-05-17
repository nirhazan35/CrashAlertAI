import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationProvider, useNotifications } from '../../src/components/notifications/NotificationContext';
import Notifications from '../../src/components/notifications/Notifications';

// Mock component to trigger notifications
const NotificationTrigger = () => {
  const { addNotification } = useNotifications();
  
  const addSuccessNotification = () => {
    addNotification({
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully',
    });
  };
  
  const addErrorNotification = () => {
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'An error occurred',
    });
  };
  
  const addInfoNotification = () => {
    addNotification({
      type: 'info',
      title: 'Information',
      message: 'This is an informational message',
    });
  };
  
  const addWarningNotification = () => {
    addNotification({
      type: 'warning',
      title: 'Warning',
      message: 'This is a warning message',
    });
  };
  
  return (
    <div>
      <button onClick={addSuccessNotification}>Add Success</button>
      <button onClick={addErrorNotification}>Add Error</button>
      <button onClick={addInfoNotification}>Add Info</button>
      <button onClick={addWarningNotification}>Add Warning</button>
    </div>
  );
};

// Component wrapper with notification context
const TestComponent = () => {
  return (
    <NotificationProvider>
      <Notifications />
      <NotificationTrigger />
    </NotificationProvider>
  );
};

describe('Notifications Component', () => {
  beforeEach(() => {
    // Clear any previous notifications
    jest.clearAllMocks();
    
    // Mock timers for auto-dismiss functionality
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore timers
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<TestComponent />);
    
    // Notifications container should be present but empty
    const notificationsContainer = screen.getByTestId('notifications-container');
    expect(notificationsContainer).toBeInTheDocument();
    expect(notificationsContainer.children.length).toBe(0);
  });

  it('displays a success notification when triggered', async () => {
    render(<TestComponent />);
    
    // Click the button to add a success notification
    fireEvent.click(screen.getByText('Add Success'));
    
    // Check if the notification appears with the correct content
    const notification = await screen.findByText('Success');
    expect(notification).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    
    // Check for success styling
    const notificationElement = notification.closest('[data-testid="notification"]');
    expect(notificationElement).toHaveClass('success');
  });

  it('displays an error notification when triggered', async () => {
    render(<TestComponent />);
    
    // Click the button to add an error notification
    fireEvent.click(screen.getByText('Add Error'));
    
    // Check if the notification appears with the correct content
    const notification = await screen.findByText('Error');
    expect(notification).toBeInTheDocument();
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    
    // Check for error styling
    const notificationElement = notification.closest('[data-testid="notification"]');
    expect(notificationElement).toHaveClass('error');
  });

  it('displays an info notification when triggered', async () => {
    render(<TestComponent />);
    
    // Click the button to add an info notification
    fireEvent.click(screen.getByText('Add Info'));
    
    // Check if the notification appears with the correct content
    const notification = await screen.findByText('Information');
    expect(notification).toBeInTheDocument();
    expect(screen.getByText('This is an informational message')).toBeInTheDocument();
    
    // Check for info styling
    const notificationElement = notification.closest('[data-testid="notification"]');
    expect(notificationElement).toHaveClass('info');
  });

  it('displays a warning notification when triggered', async () => {
    render(<TestComponent />);
    
    // Click the button to add a warning notification
    fireEvent.click(screen.getByText('Add Warning'));
    
    // Check if the notification appears with the correct content
    const notification = await screen.findByText('Warning');
    expect(notification).toBeInTheDocument();
    expect(screen.getByText('This is a warning message')).toBeInTheDocument();
    
    // Check for warning styling
    const notificationElement = notification.closest('[data-testid="notification"]');
    expect(notificationElement).toHaveClass('warning');
  });

  it('allows user to dismiss a notification manually', async () => {
    render(<TestComponent />);
    
    // Add a notification
    fireEvent.click(screen.getByText('Add Info'));
    
    // Find the notification
    const notification = await screen.findByText('Information');
    expect(notification).toBeInTheDocument();
    
    // Find and click the close button
    const closeButton = screen.getByTestId('close-notification');
    fireEvent.click(closeButton);
    
    // Notification should be removed
    await waitFor(() => {
      expect(screen.queryByText('Information')).not.toBeInTheDocument();
    });
  });

  it('automatically dismisses notifications after timeout', async () => {
    render(<TestComponent />);
    
    // Add a notification
    fireEvent.click(screen.getByText('Add Success'));
    
    // Notification should appear
    const notification = await screen.findByText('Success');
    expect(notification).toBeInTheDocument();
    
    // Fast-forward time by the auto-dismiss duration (usually 5000ms)
    jest.advanceTimersByTime(5000);
    
    // Notification should be removed automatically
    await waitFor(() => {
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });
  });

  it('stacks multiple notifications', async () => {
    render(<TestComponent />);
    
    // Add multiple notifications
    fireEvent.click(screen.getByText('Add Success'));
    fireEvent.click(screen.getByText('Add Error'));
    fireEvent.click(screen.getByText('Add Info'));
    
    // All notifications should be visible
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Information')).toBeInTheDocument();
    
    // Container should have 3 notifications
    const notificationsContainer = screen.getByTestId('notifications-container');
    expect(notificationsContainer.children.length).toBe(3);
  });
}); 