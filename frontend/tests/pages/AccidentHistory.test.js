import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AccidentHistory from '../../src/pages/AccidentHistory/AccidentHistory';
import { useAuth } from '../../src/authentication/AuthProvider';
import { exportAccidentsToCSV } from '../../src/services/statisticsService';
import { renderWithMantine } from '../utils/test-utils';

// Mock the hooks and services
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../src/services/statisticsService', () => ({
  exportAccidentsToCSV: jest.fn()
}));

// Mock the components
jest.mock('../../src/components/FilterPanel/FilterPanel', () => {
  return function MockFilterPanel({ onFilteredLogsChange, initialLogs }) {
    return (
      <div data-testid="filter-panel">
        <div>Initial logs: {initialLogs?.length || 0}</div>
        <button 
          data-testid="apply-filter" 
          onClick={() => onFilteredLogsChange && onFilteredLogsChange([initialLogs[0]])}
        >
          Apply filter
        </button>
        <button 
          data-testid="clear-filter" 
          onClick={() => onFilteredLogsChange && onFilteredLogsChange(initialLogs)}
        >
          Clear filter
        </button>
      </div>
    );
  };
});

jest.mock('../../src/components/AccidentLogs/AccidentLog', () => {
  return function MockAccidentLog({ filteredLogs, renderActions }) {
    return (
      <div data-testid="accident-log">
        <div>Logs count: {filteredLogs?.length || 0}</div>
        {filteredLogs?.length > 0 && renderActions && (
          <div data-testid="action-buttons">
            {renderActions(filteredLogs[0])}
          </div>
        )}
      </div>
    );
  };
});

// Mock fetch API
global.fetch = jest.fn();
global.window.confirm = jest.fn();

describe('AccidentHistory Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  const mockAccidents = [
    {
      _id: '1',
      cameraId: 'Camera1',
      location: 'Location1',
      date: '2024-01-01T10:00:00Z',
      severity: 'high',
      status: 'handled',
      description: 'Test accident 1',
      assignedTo: 'testuser'
    },
    {
      _id: '2',
      cameraId: 'Camera2',
      location: 'Location2',
      date: '2024-01-02T15:30:00Z',
      severity: 'medium',
      status: 'pending',
      description: 'Test accident 2',
      assignedTo: 'otheruser'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockAccidents })
    });
    global.window.confirm.mockReturnValue(true);
  });

  test('renders accident history page', async () => {
    renderWithMantine(<AccidentHistory />);

    // Check for loading state
    expect(screen.getByText('Loading accident history...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Accident History')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
      expect(screen.getByTestId('accident-log')).toBeInTheDocument();
    });
  });

  test('displays accident data in table', async () => {
    renderWithMantine(<AccidentHistory />);

    await waitFor(() => {
      expect(screen.getByText('Logs count: 2')).toBeInTheDocument();
      expect(screen.getByText('Initial logs: 2')).toBeInTheDocument();
    });
  });

  test('handles export functionality', async () => {
    renderWithMantine(<AccidentHistory />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Logs count: 2')).toBeInTheDocument();
    });

    // Find and click the export button using the correct selector
    const exportButton = screen.getByTestId('export-button');
    fireEvent.click(exportButton);

    expect(exportAccidentsToCSV).toHaveBeenCalledWith(mockAccidents);
  });

  test('handles filter application', async () => {
    renderWithMantine(<AccidentHistory />);

    await waitFor(() => {
      const applyFilterButton = screen.getByTestId('apply-filter');
      fireEvent.click(applyFilterButton);
      expect(screen.getByText('Logs count: 1')).toBeInTheDocument();
    });
  });

  test('handles filter clearing', async () => {
    renderWithMantine(<AccidentHistory />);

    await waitFor(() => {
      const clearFilterButton = screen.getByTestId('clear-filter');
      fireEvent.click(clearFilterButton);
      expect(screen.getByText('Logs count: 2')).toBeInTheDocument();
    });
  });

  test('handles unhandle action', async () => {
    const mockResponse = { success: true };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockAccidents })
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    renderWithMantine(<AccidentHistory />);

    // Wait for data to load and component to update
    await waitFor(() => {
      expect(screen.getByText('Logs count: 2')).toBeInTheDocument();
    });

    // Find and click the unhandle button
    const unhandleButton = screen.getByRole('button', { name: /unhandle/i });
    fireEvent.click(unhandleButton);

    // Verify confirm dialog was called
    expect(global.window.confirm).toHaveBeenCalledWith(
      'Mark this accident as unhandled? It will be moved back to active accidents.'
    );

    // Verify the API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/accidents/accident-status-update'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockUser.token}`
          }),
          body: JSON.stringify({ accident_id: '1', status: 'active' })
        })
      );
    });
  });

  test('handles error when loading accidents', async () => {
    const errorMessage = 'Failed to fetch';
    
    // Reset mock for this specific test
    global.fetch.mockReset();
    global.fetch.mockRejectedValueOnce(new Error(errorMessage));

    renderWithMantine(<AccidentHistory />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading Accident History')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});