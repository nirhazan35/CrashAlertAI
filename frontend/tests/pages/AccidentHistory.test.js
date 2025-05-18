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
      description: 'Test accident 1'
    },
    {
      _id: '2',
      cameraId: 'Camera2',
      location: 'Location2',
      date: '2024-01-02T15:30:00Z',
      severity: 'medium',
      status: 'pending',
      description: 'Test accident 2'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
  });

  test('renders accident history page', () => {
    renderWithMantine(<AccidentHistory />);

    expect(screen.getByText(/accident history/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  test('displays accident data in table', async () => {
    renderWithMantine(<AccidentHistory />);

    await waitFor(() => {
      expect(screen.getByText('Camera1')).toBeInTheDocument();
      expect(screen.getByText('Location1')).toBeInTheDocument();
      expect(screen.getByText('Test accident 1')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('handled')).toBeInTheDocument();
    });
  });

  test('handles export functionality', async () => {
    renderWithMantine(<AccidentHistory />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    expect(exportAccidentsToCSV).toHaveBeenCalled();
  });

  test('filters accidents by date range', async () => {
    renderWithMantine(<AccidentHistory />);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('Test accident 1')).toBeInTheDocument();
      expect(screen.getByText('Test accident 2')).toBeInTheDocument();
    });
  });

  test('filters accidents by severity', async () => {
    renderWithMantine(<AccidentHistory />);

    const severitySelect = screen.getByRole('combobox', { name: /severity/i });
    fireEvent.change(severitySelect, { target: { value: 'high' } });

    await waitFor(() => {
      expect(screen.getByText('Test accident 1')).toBeInTheDocument();
      expect(screen.queryByText('Test accident 2')).not.toBeInTheDocument();
    });
  });

  test('filters accidents by status', async () => {
    renderWithMantine(<AccidentHistory />);

    const statusSelect = screen.getByRole('combobox', { name: /status/i });
    fireEvent.change(statusSelect, { target: { value: 'pending' } });

    await waitFor(() => {
      expect(screen.queryByText('Test accident 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test accident 2')).toBeInTheDocument();
    });
  });

  test('handles error when loading accidents', async () => {
    renderWithMantine(<AccidentHistory />);

    await waitFor(() => {
      expect(screen.getByText(/error loading accidents/i)).toBeInTheDocument();
    });
  });
}); 