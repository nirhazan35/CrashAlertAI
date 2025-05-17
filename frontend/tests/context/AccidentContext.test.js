import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccidentLogsProvider, useAccidentLogs } from '../../src/context/AccidentContext';
import { useAuth } from '../../src/authentication/AuthProvider';
import * as socketService from '../../src/services/socket';

// Mock the dependencies
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/services/socket', () => ({
  onNewAccident: jest.fn(),
  onAccidentUpdate: jest.fn(),
  onNotification: jest.fn(),
}));

jest.mock('../../src/util/generateSound', () => jest.fn());

// Mock fetch
global.fetch = jest.fn();

// Test component that uses the accident logs context
const TestComponent = () => {
  const {
    accidentLogs,
    selectedAlert,
    setSelectedAlert,
    updateAccidentStatus,
    handleRowDoubleClick,
    notifications
  } = useAccidentLogs();

  return (
    <div>
      <div data-testid="accident-count">{accidentLogs.length}</div>
      <div data-testid="notification-count">{notifications.length}</div>
      <div data-testid="selected-alert">{selectedAlert ? selectedAlert._id : 'none'}</div>
      <button 
        data-testid="select-alert" 
        onClick={() => setSelectedAlert(accidentLogs[0])}
      >
        Select First Alert
      </button>
      <button 
        data-testid="handle-accident" 
        onClick={() => updateAccidentStatus('accident123', 'handled')}
      >
        Handle Accident
      </button>
      <button 
        data-testid="double-click" 
        onClick={() => handleRowDoubleClick(accidentLogs[0])}
      >
        Double Click Row
      </button>
    </div>
  );
};

describe('AccidentLogsContext', () => {
  const mockUser = {
    isLoggedIn: true,
    token: 'mock-token',
    role: 'admin'
  };

  const mockAccidents = [
    {
      _id: 'accident123',
      location: 'Main Street',
      date: '2023-05-01T12:00:00Z',
      severity: 'high',
      status: 'active'
    },
    {
      _id: 'accident456',
      location: 'Downtown',
      date: '2023-05-02T14:30:00Z',
      severity: 'medium',
      status: 'active'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth user
    useAuth.mockReturnValue({ user: mockUser });
    
    // Mock fetch response for initial accidents
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true, 
        data: mockAccidents 
      })
    });
    
    // Mock socket listeners
    const mockSocketListeners = {};
    socketService.onNewAccident.mockImplementation(callback => {
      mockSocketListeners.newAccident = callback;
    });
    socketService.onAccidentUpdate.mockImplementation(callback => {
      mockSocketListeners.accidentUpdate = callback;
    });
    socketService.onNotification.mockImplementation(callback => {
      mockSocketListeners.notification = callback;
    });
  });

  it('fetches and provides accident logs', async () => {
    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );
    
    // Verify the fetch API was called
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_URL_BACKEND}/accidents/active-accidents`,
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }
      })
    );
    
    // Wait for the accident logs to be populated
    await waitFor(() => {
      expect(screen.getByTestId('accident-count').textContent).toBe('2');
    });
  });

  it('handles adding a new accident through socket', async () => {
    // Setup the test component
    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('accident-count').textContent).toBe('2');
    });
    
    // Simulate receiving a new accident through the socket
    const newAccident = {
      _id: 'accident789',
      location: 'Highway',
      date: '2023-05-03T09:15:00Z',
      severity: 'low',
      status: 'active'
    };
    
    // Extract the callback that was passed to the socket service
    const newAccidentCallback = socketService.onNewAccident.mock.calls[0][0];
    
    // Call the callback with the new accident
    act(() => {
      newAccidentCallback(newAccident);
    });
    
    // Verify the accident was added to the context state
    await waitFor(() => {
      expect(screen.getByTestId('accident-count').textContent).toBe('3');
    });
  });

  it('handles updating an accident through socket', async () => {
    // Setup the test component
    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('accident-count').textContent).toBe('2');
    });
    
    // Select an accident
    const selectButton = screen.getByTestId('select-alert');
    act(() => {
      selectButton.click();
    });
    
    // Verify an accident is selected
    await waitFor(() => {
      expect(screen.getByTestId('selected-alert').textContent).toBe('accident123');
    });
    
    // Simulate an update to the selected accident
    const accidentUpdate = {
      _id: 'accident123',
      severity: 'critical',
      status: 'active'
    };
    
    // Extract the callback that was passed to the socket service
    const updateCallback = socketService.onAccidentUpdate.mock.calls[0][0];
    
    // Call the callback with the update
    act(() => {
      updateCallback(accidentUpdate);
    });
    
    // Selected alert should still be the same ID but with updated data
    expect(screen.getByTestId('selected-alert').textContent).toBe('accident123');
  });

  it('removes handled accidents', async () => {
    // Mock the API response for updateAccidentStatus
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        _id: 'accident123',
        status: 'handled'
      })
    });
    
    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('accident-count').textContent).toBe('2');
    });
    
    // Select an accident
    const selectButton = screen.getByTestId('select-alert');
    act(() => {
      selectButton.click();
    });
    
    // Verify an accident is selected
    await waitFor(() => {
      expect(screen.getByTestId('selected-alert').textContent).toBe('accident123');
    });
    
    // Handle the accident
    const handleButton = screen.getByTestId('handle-accident');
    act(() => {
      handleButton.click();
    });
    
    // Verify API was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/accidents/accident-status-update`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ 
            accident_id: 'accident123',
            status: 'handled'
          })
        })
      );
    });
    
    // Accident should be removed from the list and selected accident should be null
    await waitFor(() => {
      expect(screen.getByTestId('accident-count').textContent).toBe('1');
      expect(screen.getByTestId('selected-alert').textContent).toBe('none');
    });
  });

  it('handles row double click', async () => {
    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('accident-count').textContent).toBe('2');
    });
    
    // Double click on a row
    const doubleClickButton = screen.getByTestId('double-click');
    act(() => {
      doubleClickButton.click();
    });
    
    // Verify the accident is selected
    await waitFor(() => {
      expect(screen.getByTestId('selected-alert').textContent).toBe('accident123');
    });
  });

  it('receives and stores notifications for admin users', async () => {
    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('notification-count').textContent).toBe('0');
    });
    
    // Simulate receiving a notification
    const notification = {
      type: 'alert',
      message: 'New accident detected',
      timestamp: new Date().toISOString()
    };
    
    // Extract the callback that was passed to the socket service
    const notificationCallback = socketService.onNotification.mock.calls[0][0];
    
    // Call the callback with the notification
    act(() => {
      notificationCallback(notification);
    });
    
    // Verify the notification was added
    await waitFor(() => {
      expect(screen.getByTestId('notification-count').textContent).toBe('1');
    });
  });
}); 