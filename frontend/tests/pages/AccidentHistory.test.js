import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccidentHistory from '../../src/pages/AccidentHistory/AccidentHistory';
import { useAuth } from '../../src/authentication/AuthProvider';
import { exportAccidentsToCSV } from '../../src/services/statisticsService';

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
        {filteredLogs?.length > 0 && (
          <button 
            data-testid="unhandle-button" 
            onClick={() => renderActions && renderActions(filteredLogs[0])}
          >
            Test action
          </button>
        )}
      </div>
    );
  };
});

// Mock fetch API
global.fetch = jest.fn();
global.window.confirm = jest.fn();

describe('AccidentHistory Page', () => {
  const mockUser = {
    username: 'testuser',
    role: 'user',
    token: 'test-token',
    isLoggedIn: true
  };

  const mockHandledAccidents = [
    {
      _id: '1',
      location: 'Main Street',
      date: '2023-05-15T10:30:00Z',
      severity: 'high',
      description: 'Vehicle collision',
      status: 'handled',
      assignedTo: 'testuser'
    },
    {
      _id: '2',
      location: 'Oak Avenue',
      date: '2023-05-16T14:45:00Z',
      severity: 'medium',
      description: 'Vehicle skidded',
      status: 'handled',
      assignedTo: 'another-user'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default auth mock
    useAuth.mockReturnValue({ user: mockUser });
    
    // Setup default fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        data: mockHandledAccidents 
      })
    });

    // Setup default window.confirm behavior
    global.window.confirm.mockReturnValue(true);
  });

  test('renders loading state initially', async () => {
    render(<AccidentHistory />);
    
    // Should show loading indicator initially
    expect(screen.getByText('Loading accident history...')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading accident history...')).not.toBeInTheDocument();
    });
  });

  test('fetches and displays accident history', async () => {
    render(<AccidentHistory />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Accident History')).toBeInTheDocument();
    });
    
    // Should call fetch with the correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_URL_BACKEND}/accidents/handled-accidents`,
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        }
      })
    );
    
    // Should render the filter panel with correct data
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    expect(screen.getByText('Initial logs: 2')).toBeInTheDocument();
    
    // Should render the accident log with correct data
    expect(screen.getByTestId('accident-log')).toBeInTheDocument();
    expect(screen.getByText('Logs count: 2')).toBeInTheDocument();
  });

  test('handles fetch error correctly', async () => {
    // Mock a failed fetch
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        success: false, 
        message: 'Failed to fetch data' 
      })
    });
    
    render(<AccidentHistory />);
    
    // Wait for error title to appear
    await waitFor(() => {
      expect(screen.getByText('Error Loading Accident History')).toBeInTheDocument();
    });
    
    // Check the error message
    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });

  test('filters accidents when filter is applied', async () => {
    render(<AccidentHistory />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Logs count: 2')).toBeInTheDocument();
    });
    
    // Apply filter
    fireEvent.click(screen.getByTestId('apply-filter'));
    
    // Check that the filtered logs are shown (1 instead of 2)
    expect(screen.getByText('Logs count: 1')).toBeInTheDocument();
    
    // Clear filter
    fireEvent.click(screen.getByTestId('clear-filter'));
    
    // Check that all logs are shown again
    expect(screen.getByText('Logs count: 2')).toBeInTheDocument();
  });

  test('handles unhandling an accident', async () => {
    render(<AccidentHistory />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Logs count: 2')).toBeInTheDocument();
    });
    
    // Mock the successful status update response
    global.fetch.mockResolvedValueOnce({
      ok: true
    });
    
    // Click the unhandle button
    fireEvent.click(screen.getByTestId('unhandle-button'));
    
    // Should show confirmation dialog
    expect(global.window.confirm).toHaveBeenCalledWith(
      'Mark this accident as unhandled? It will be moved back to active accidents.'
    );
    
    // Check that fetch was called to update the status
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/accidents/accident-status-update`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({ accident_id: '1', status: 'active' })
        })
      );
    });
    
    // Check that the accident was removed from the list
    await waitFor(() => {
      expect(screen.getByText('Logs count: 1')).toBeInTheDocument();
    });
  });

  test('exports accident data to CSV when export button is clicked', async () => {
    render(<AccidentHistory />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Accident History')).toBeInTheDocument();
    });
    
    // Find and click the export button
    const exportButton = screen.getByLabelText('Export to CSV');
    fireEvent.click(exportButton);
    
    // Check that the export function was called with the correct data
    expect(exportAccidentsToCSV).toHaveBeenCalledWith(mockHandledAccidents);
  });
}); 