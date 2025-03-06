import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccidentLogsProvider, useAccidentLogs } from '../../context/AccidentContext';
import { useAuth } from '../../authentication/AuthProvider';
import { onNewAccident, onAccidentUpdate } from '../../services/socket';

// Mock the dependencies
jest.mock('../../authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../services/socket', () => ({
  onNewAccident: jest.fn(),
  onAccidentUpdate: jest.fn()
}));

jest.mock('../../util/generateSound', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

// Test component to access the context
const TestComponent = () => {
  const {
    accidentLogs,
    selectedAlert,
    setSelectedAlert,
    updateAccidentDetails,
    clearSelectedAlert,
    updateAccidentStatus,
    handleRowDoubleClick
  } = useAccidentLogs();

  return (
    <div>
      <div data-testid="logs-count">{accidentLogs.length}</div>
      <div data-testid="selected-alert">{selectedAlert ? selectedAlert._id : 'none'}</div>
      <button
        data-testid="clear-button"
        onClick={clearSelectedAlert}
      >
        Clear
      </button>
      <button
        data-testid="update-details-button"
        onClick={() => updateAccidentDetails({ _id: '123', status: 'inProgress' })}
      >
        Update Details
      </button>
      <button
        data-testid="update-status-button"
        onClick={() => updateAccidentStatus('123', 'handled')}
      >
        Update Status
      </button>
      <button
        data-testid="double-click-button"
        onClick={() => handleRowDoubleClick({ _id: '123', status: 'new' })}
      >
        Double Click
      </button>
    </div>
  );
};

describe('AccidentLogsProvider', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock useAuth
    useAuth.mockReturnValue({
      user: {
        isLoggedIn: true,
        token: 'mock-token'
      }
    });

    // Mock fetch
    global.fetch.mockReset();
  });

  test('should fetch active accidents when mounted', async () => {
    const mockAccidents = [
      { _id: '1', status: 'new' },
      { _id: '2', status: 'inProgress' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockAccidents })
    });

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/accidents/active-accidents`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token'
          })
        })
      );
      expect(screen.getByTestId('logs-count')).toHaveTextContent('2');
    });
  });

  test('should handle fetch accidents error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching accidents:', 'Network error');
      expect(screen.getByTestId('logs-count')).toHaveTextContent('0');
    });

    consoleSpy.mockRestore();
  });

  test('should handle new accident from socket', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    let newAccidentCallback;
    onNewAccident.mockImplementation(callback => {
      newAccidentCallback = callback;
    });

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    await waitFor(() => expect(onNewAccident).toHaveBeenCalled());

    act(() => {
      newAccidentCallback({ _id: 'new1', status: 'new' });
    });

    expect(screen.getByTestId('logs-count')).toHaveTextContent('1');
  });

  test('should handle accident update from socket - update case', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ _id: 'existing1', status: 'active' }]
      })
    });

    let updateCallback;
    onAccidentUpdate.mockImplementation(callback => {
      updateCallback = callback;
    });

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    await waitFor(() => expect(onAccidentUpdate).toHaveBeenCalled());

    act(() => {
      updateCallback({ _id: 'existing1', status: 'active' });
    });

    expect(screen.getByTestId('logs-count')).toHaveTextContent('0');
  });

  test('should handle accident update from socket - handled case', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ _id: 'existing1', status: 'new' }]
      })
    });

    let updateCallback;
    onAccidentUpdate.mockImplementation(callback => {
      updateCallback = callback;
    });

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    await waitFor(() => expect(onAccidentUpdate).toHaveBeenCalled());

    act(() => {
      updateCallback({ _id: 'existing1', status: 'handled' });
    });

    expect(screen.getByTestId('logs-count')).toHaveTextContent('0');
  });

  test('should update selected alert when it is the one being updated via socket', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ _id: 'existing1', status: 'new' }]
      })
    });

    let updateCallback;
    onAccidentUpdate.mockImplementation(callback => {
      updateCallback = callback;
    });

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    await waitFor(() => expect(onAccidentUpdate).toHaveBeenCalled());

    // Set selected alert
    act(() => {
      screen.getByTestId('double-click-button').click();
    });

    // Update via socket
    act(() => {
      updateCallback({ _id: '123', status: 'inProgress' });
    });

    expect(screen.getByTestId('selected-alert')).toHaveTextContent('123');
  });

  test('should clear selected alert when the selected accident is handled', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ _id: '123', status: 'handled' }]
      })
    });

    let updateCallback;
    onAccidentUpdate.mockImplementation(callback => {
      updateCallback = callback;
    });

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    await waitFor(() => expect(onAccidentUpdate).toHaveBeenCalled());

    // Set selected alert
    act(() => {
      screen.getByTestId('double-click-button').click();
    });

    // Update to handled via socket
    act(() => {
      updateCallback({ _id: '123', status: 'handled' });
    });

    expect(screen.getByTestId('selected-alert')).toHaveTextContent('none');
  });

  test('should handle updateAccidentDetails success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    // Mock the update response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ _id: '123', status: 'inProgress' })
    });

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Set selected alert
    act(() => {
      screen.getByTestId('double-click-button').click();
    });

    // Update details
    act(() => {
      screen.getByTestId('update-details-button').click();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/accidents/update-accident-details`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ _id: '123', status: 'inProgress' })
        })
      );
    });
  });

  test('should handle updateAccidentStatus success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    // Mock the update status response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ _id: '123', status: 'handled' })
    });

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Set selected alert
    act(() => {
      screen.getByTestId('double-click-button').click();
    });

    // Update status
    act(() => {
      screen.getByTestId('update-status-button').click();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/accidents/accident-status-update`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ accident_id: '123', status: 'handled' })
        })
      );
      expect(screen.getByTestId('selected-alert')).toHaveTextContent('123');
    });
  });

  test('should handle clearSelectedAlert', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    // Set selected alert
    act(() => {
      screen.getByTestId('double-click-button').click();
    });

    expect(screen.getByTestId('selected-alert')).toHaveTextContent('123');

    // Clear selected alert
    act(() => {
      screen.getByTestId('clear-button').click();
    });

    expect(screen.getByTestId('selected-alert')).toHaveTextContent('none');
  });

  test('should handle fetch error in updateAccidentDetails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    // Mock the update error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Update details
    act(() => {
      screen.getByTestId('update-details-button').click();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error updating accident details', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('should handle fetch error in updateAccidentStatus', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });

    // Mock the update error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AccidentLogsProvider>
        <TestComponent />
      </AccidentLogsProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Update status
    act(() => {
      screen.getByTestId('update-status-button').click();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error updating accident status:', 'Network error');
    });

    consoleSpy.mockRestore();
  });
});