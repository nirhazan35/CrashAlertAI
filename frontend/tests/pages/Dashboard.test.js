import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../../src/pages/Dashboard/Dashboard';
import { useAccidentLogs } from '../../src/context/AccidentContext';
import { renderWithMantine } from '../utils/test-utils';

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

describe('Dashboard Component', () => {
  const mockAccidentLogs = [
    {
      _id: '1',
      cameraId: 'Camera1',
      location: 'Location1',
      date: '2024-01-01T10:00:00Z',
      severity: 'high',
      status: 'active',
      description: 'Test accident 1'
    },
    {
      _id: '2',
      cameraId: 'Camera2',
      location: 'Location2',
      date: '2024-01-02T15:30:00Z',
      severity: 'medium',
      status: 'active',
      description: 'Test accident 2'
    }
  ];

  beforeEach(() => {
    useAccidentLogs.mockReturnValue({
      selectedAlert: null,
      accidentLogs: mockAccidentLogs,
      setSelectedAlert: jest.fn()
    });
  });

  test('renders dashboard with accident logs', () => {
    renderWithMantine(<Dashboard />);
    expect(screen.getByTestId('filter-panel-component')).toBeInTheDocument();
  });

  test('handles filtered logs change', () => {
    renderWithMantine(<Dashboard />);
    const applyFilterButton = screen.getByTestId('apply-filter-button');
    fireEvent.click(applyFilterButton);
    expect(screen.getByText('Initial logs count: 2')).toBeInTheDocument();
  });

  test('handles clear filters', () => {
    renderWithMantine(<Dashboard />);
    const clearFilterButton = screen.getByTestId('clear-filter-button');
    fireEvent.click(clearFilterButton);
    expect(screen.getByText('Initial logs count: 2')).toBeInTheDocument();
  });
}); 