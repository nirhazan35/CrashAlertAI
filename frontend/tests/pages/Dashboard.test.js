import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../../src/pages/Dashboard/Dashboard';
import { useAccidentLogs } from '../../src/context/AccidentContext';

// Mock the required hooks and components
jest.mock('../../src/context/AccidentContext', () => ({
  useAccidentLogs: jest.fn()
}));

jest.mock('../../src/components/AccidentView/Alert', () => {
  return function MockAlert({ alert }) {
    return <div data-testid="alert-component">{alert ? `Alert: ${alert._id}` : 'No alert'}</div>;
  };
});

jest.mock('../../src/components/AccidentLogs/AccidentLog', () => {
  return function MockAccidentLog({ filteredLogs, handleRowDoubleClick }) {
    return (
      <div data-testid="accident-log-component">
        <div>Logs count: {filteredLogs?.length || 0}</div>
        <button 
          data-testid="mock-row-double-click" 
          onClick={() => handleRowDoubleClick && handleRowDoubleClick(filteredLogs[0])}
        >
          Simulate row double click
        </button>
      </div>
    );
  };
});

jest.mock('../../src/components/FilterPanel/FilterPanel', () => {
  return function MockFilterPanel({ onFilteredLogsChange, initialLogs }) {
    return (
      <div data-testid="filter-panel-component">
        <div>Initial logs count: {initialLogs?.length || 0}</div>
        <button
          data-testid="apply-filter-button"
          onClick={() => onFilteredLogsChange && onFilteredLogsChange([initialLogs[0]])}
        >
          Apply filter (mock)
        </button>
        <button
          data-testid="clear-filter-button"
          onClick={() => onFilteredLogsChange && onFilteredLogsChange(initialLogs)}
        >
          Clear filters (mock)
        </button>
      </div>
    );
  };
});

describe('Dashboard Page', () => {
  // Sample accident logs for testing
  const mockAccidentLogs = [
    {
      _id: '1',
      location: 'Main Street',
      severity: 'high',
      description: 'Test accident 1'
    },
    {
      _id: '2',
      location: 'Oak Avenue',
      severity: 'medium',
      description: 'Test accident 2'
    },
    {
      _id: '3',
      location: 'Pine Road',
      severity: 'low',
      description: 'Test accident 3'
    }
  ];

  const mockSetSelectedAlert = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock return values
    useAccidentLogs.mockReturnValue({
      accidentLogs: mockAccidentLogs,
      selectedAlert: null,
      setSelectedAlert: mockSetSelectedAlert
    });
  });

  test('renders dashboard components correctly', () => {
    render(<Dashboard />);
    
    // Check for main components
    expect(screen.getByTestId('alert-component')).toBeInTheDocument();
    expect(screen.getByTestId('filter-panel-component')).toBeInTheDocument();
    expect(screen.getByTestId('accident-log-component')).toBeInTheDocument();
    
    // Check initial content
    expect(screen.getByText('No alert')).toBeInTheDocument();
    expect(screen.getByText('Initial logs count: 3')).toBeInTheDocument();
    expect(screen.getByText('Logs count: 3')).toBeInTheDocument();
  });

  test('updates filtered logs when filter panel changes', () => {
    render(<Dashboard />);
    
    // Initially should show all logs
    expect(screen.getByText('Logs count: 3')).toBeInTheDocument();
    
    // Click apply filter button on filter panel
    fireEvent.click(screen.getByTestId('apply-filter-button'));
    
    // Should now show filtered logs (just 1)
    expect(screen.getByText('Logs count: 1')).toBeInTheDocument();
    
    // Click clear filters button
    fireEvent.click(screen.getByTestId('clear-filter-button'));
    
    // Should go back to showing all logs
    expect(screen.getByText('Logs count: 3')).toBeInTheDocument();
  });

  test('selects an alert when accident log row is double-clicked', () => {
    render(<Dashboard />);
    
    // Simulate double click on a row
    fireEvent.click(screen.getByTestId('mock-row-double-click'));
    
    // Check that setSelectedAlert was called with the first log
    expect(mockSetSelectedAlert).toHaveBeenCalledWith(mockAccidentLogs[0]);
  });

  test('displays selected alert when one is selected', () => {
    // Change the mock to return a selected alert
    useAccidentLogs.mockReturnValue({
      accidentLogs: mockAccidentLogs,
      selectedAlert: mockAccidentLogs[1],
      setSelectedAlert: mockSetSelectedAlert
    });
    
    render(<Dashboard />);
    
    // Should show the selected alert
    expect(screen.getByText('Alert: 2')).toBeInTheDocument();
  });

  test('initializes filtered logs when component mounts with non-empty accidentLogs', () => {
    render(<Dashboard />);
    
    // Should initially show all logs
    expect(screen.getByText('Logs count: 3')).toBeInTheDocument();
  });

  test('handles empty accident logs array', () => {
    // Change the mock to return empty logs
    useAccidentLogs.mockReturnValue({
      accidentLogs: [],
      selectedAlert: null,
      setSelectedAlert: mockSetSelectedAlert
    });
    
    render(<Dashboard />);
    
    // Should show zero logs count
    expect(screen.getByText('Logs count: 0')).toBeInTheDocument();
    expect(screen.getByText('Initial logs count: 0')).toBeInTheDocument();
  });
}); 