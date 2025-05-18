import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import FilterPanel from '../../src/components/FilterPanel/FilterPanel';
import { useFilterLogs } from '../../src/components/FilterPanel/useFilterLogs';
import { useCameraData } from '../../src/components/FilterPanel/useCameraData';
import { useAccidentLogs } from '../../src/context/AccidentContext';
import { renderWithMantine } from '../utils/test-utils';

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  Select: ({ data, value, onChange, label, ...props }) => (
    <div>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} {...props}>
        {data.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  ),
  TextInput: ({ value, onChange, label, ...props }) => (
    <div>
      <label>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} {...props} />
    </div>
  ),
  Button: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Group: ({ children, ...props }) => <div {...props}>{children}</div>,
  Stack: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }) => <div {...props}>{children}</div>
}));

// Mock the required hooks
jest.mock('../../src/context/AccidentContext', () => ({
  useAccidentLogs: jest.fn()
}));

jest.mock('../../src/components/FilterPanel/useFilterLogs', () => ({
  useFilterLogs: jest.fn()
}));

jest.mock('../../src/components/FilterPanel/useCameraData', () => ({
  useCameraData: jest.fn()
}));

describe('FilterPanel Component', () => {
  const mockCameras = ['Camera1', 'Camera2'];
  const mockLocations = ['Location1', 'Location2'];
  const mockAccidentLogs = [
    { 
      id: 1, 
      cameraId: 'Camera1', 
      location: 'Location1',
      severity: 'high',
      timestamp: '2024-03-20T10:00:00Z'
    },
    { 
      id: 2, 
      cameraId: 'Camera2', 
      location: 'Location2',
      severity: 'low',
      timestamp: '2024-03-20T11:00:00Z'
    }
  ];

  const mockFilters = {
    cameraId: '',
    location: '',
    severity: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  };

  const mockSetFilters = jest.fn();
  const mockApplyFilters = jest.fn();
  const mockClearFilters = jest.fn();

  beforeEach(() => {
    useCameraData.mockReturnValue({
      cameras: mockCameras,
      locations: mockLocations
    });

    useAccidentLogs.mockReturnValue({
      accidentLogs: mockAccidentLogs
    });

    useFilterLogs.mockReturnValue({
      filters: mockFilters,
      setFilters: mockSetFilters,
      filteredLogs: mockAccidentLogs,
      applyFilters: mockApplyFilters,
      clearFilters: mockClearFilters
    });

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('renders all filter inputs', () => {
    renderWithMantine(<FilterPanel />);

    // Check all filter inputs are present using labels
    expect(screen.getByText('Camera ID')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Start Time')).toBeInTheDocument();
    expect(screen.getByText('End Time')).toBeInTheDocument();
  });

  test('updates filters when inputs change', async () => {
    renderWithMantine(<FilterPanel />);

    // Test camera filter
    const cameraSelect = screen.getByLabelText('Camera ID');
    fireEvent.change(cameraSelect, { target: { value: 'Camera1' } });
    expect(mockSetFilters).toHaveBeenCalled();

    // Test location filter
    const locationSelect = screen.getByLabelText('Location');
    fireEvent.change(locationSelect, { target: { value: 'Location1' } });
    expect(mockSetFilters).toHaveBeenCalled();

    // Test severity filter
    const severitySelect = screen.getByLabelText('Severity');
    fireEvent.change(severitySelect, { target: { value: 'high' } });
    expect(mockSetFilters).toHaveBeenCalled();

    // Test date filters
    const startDateInput = screen.getByLabelText('Start Date');
    fireEvent.change(startDateInput, { target: { value: '2024-03-20' } });
    expect(mockSetFilters).toHaveBeenCalled();

    const endDateInput = screen.getByLabelText('End Date');
    fireEvent.change(endDateInput, { target: { value: '2024-03-21' } });
    expect(mockSetFilters).toHaveBeenCalled();

    // Test time filters
    const startTimeSelect = screen.getByLabelText('Start Time');
    fireEvent.change(startTimeSelect, { target: { value: '10:00' } });
    expect(mockSetFilters).toHaveBeenCalled();

    const endTimeSelect = screen.getByLabelText('End Time');
    fireEvent.change(endTimeSelect, { target: { value: '11:00' } });
    expect(mockSetFilters).toHaveBeenCalled();
  });

  test('validates date and time ranges', () => {
    renderWithMantine(<FilterPanel />);

    // Set end date before start date
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    
    fireEvent.change(endDateInput, { target: { value: '2024-03-19' } });
    fireEvent.change(startDateInput, { target: { value: '2024-03-20' } });

    // The setFilters function should be called with corrected dates
    expect(mockSetFilters).toHaveBeenCalledWith(expect.objectContaining({
      startDate: '2024-03-19',
      endDate: '2024-03-19'
    }));
  });

  test('clears filters when clear button is clicked', () => {
    renderWithMantine(<FilterPanel />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(mockClearFilters).toHaveBeenCalled();
  });

  test('applies filters when apply button is clicked', () => {
    renderWithMantine(<FilterPanel />);

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(mockApplyFilters).toHaveBeenCalled();
  });

  test('displays filtered logs count', () => {
    renderWithMantine(<FilterPanel />);

    // Should show count when there are filtered logs
    expect(screen.getByText('2 accident logs found')).toBeInTheDocument();
  });

  test('notifies parent component of filtered logs changes', () => {
    const onFilteredLogsChange = jest.fn();
    renderWithMantine(<FilterPanel onFilteredLogsChange={onFilteredLogsChange} />);

    expect(onFilteredLogsChange).toHaveBeenCalledWith(mockAccidentLogs);
  });

  test('handles empty initial logs', () => {
    useAccidentLogs.mockReturnValue({
      accidentLogs: []
    });

    useFilterLogs.mockReturnValue({
      filters: mockFilters,
      setFilters: mockSetFilters,
      filteredLogs: [],
      applyFilters: mockApplyFilters,
      clearFilters: mockClearFilters
    });

    renderWithMantine(<FilterPanel />);

    // Should not show count when there are no logs
    expect(screen.queryByText(/accident logs found/)).not.toBeInTheDocument();
  });
}); 