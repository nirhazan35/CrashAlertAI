import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterPanel from '../../src/components/FilterPanel/FilterPanel';
import { useFilterLogs } from '../../src/components/FilterPanel/useFilterLogs';
import { useCameraData } from '../../src/components/FilterPanel/useCameraData';
import { useAccidentLogs } from '../../src/context/AccidentContext';
import { renderHook, act } from '@testing-library/react-hooks';

// Mock the required hooks
jest.mock('../../src/context/AccidentContext', () => ({
  useAccidentLogs: jest.fn()
}));

jest.mock('../../src/components/FilterPanel/useCameraData', () => ({
  useCameraData: jest.fn()
}));

// Mock Mantine components
jest.mock('@mantine/core', () => {
  const actual = jest.requireActual('@mantine/core');
  return {
    ...actual,
    useMantineTheme: () => ({ 
      colors: { 
        brand: { 5: '#0000FF' },
        gray: { 3: '#CCCCCC' }
      }
    }),
    Select: ({ data, value, onChange, placeholder }) => (
      <select 
        data-testid={`select-${placeholder}`} 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
      >
        {data.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
    Button: ({ children, onClick }) => (
      <button onClick={onClick}>{children}</button>
    ),
    Group: ({ children }) => <div>{children}</div>,
    Text: ({ children, className }) => <span className={className}>{children}</span>,
    Paper: ({ children }) => <div>{children}</div>,
    Box: ({ children, style }) => <div style={style}>{children}</div>,
    Grid: ({ children }) => <div>{children}</div>,
    'Grid.Col': ({ children }) => <div>{children}</div>
  };
});

describe('FilterPanel Component', () => {
  // Sample accident logs for testing
  const mockAccidentLogs = [
    {
      _id: '1',
      cameraId: 'cam1',
      location: 'Main Street',
      date: '2023-05-15T10:30:00Z',
      displayDate: '15/05/2023',
      displayTime: '10:30 AM',
      severity: 'high',
    },
    {
      _id: '2',
      cameraId: 'cam2',
      location: 'Oak Avenue',
      date: '2023-05-16T14:45:00Z',
      displayDate: '16/05/2023',
      displayTime: '2:45 PM',
      severity: 'medium',
    },
    {
      _id: '3',
      cameraId: 'cam1',
      location: 'Pine Road',
      date: '2023-05-17T08:15:00Z',
      displayDate: '17/05/2023',
      displayTime: '8:15 AM',
      severity: 'low',
    }
  ];

  // Mock camera data
  const mockCameras = ['cam1', 'cam2', 'cam3'];
  const mockLocations = ['Main Street', 'Oak Avenue', 'Pine Road'];
  
  // Mock onFilteredLogsChange function
  const mockOnFilteredLogsChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock return values
    useAccidentLogs.mockReturnValue({
      accidentLogs: mockAccidentLogs
    });
    
    useCameraData.mockReturnValue({
      cameras: mockCameras,
      locations: mockLocations
    });
    
    // Clear mock function calls
    mockOnFilteredLogsChange.mockClear();
  });

  test('renders filter options correctly', () => {
    render(<FilterPanel onFilteredLogsChange={mockOnFilteredLogsChange} />);
    
    // Check for filter labels
    expect(screen.getByText('Camera ID')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    
    // Check for action buttons
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  test('calls onFilteredLogsChange when filter values change', () => {
    render(<FilterPanel onFilteredLogsChange={mockOnFilteredLogsChange} />);
    
    // Find and click the Apply Filters button
    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);
    
    // onFilteredLogsChange should be called with the filtered logs
    expect(mockOnFilteredLogsChange).toHaveBeenCalled();
  });

  test('clears filters when Clear Filters button is clicked', () => {
    render(<FilterPanel onFilteredLogsChange={mockOnFilteredLogsChange} />);
    
    // Find and click the Clear Filters button
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);
    
    // onFilteredLogsChange should be called with all logs (no filters)
    expect(mockOnFilteredLogsChange).toHaveBeenCalledWith(mockAccidentLogs);
  });
});

// Tests for the useFilterLogs hook
describe('useFilterLogs Hook', () => {
  const mockLogs = [
    {
      _id: '1',
      cameraId: 'cam1',
      location: 'Main Street',
      date: '2023-05-15T10:30:00Z',
      displayDate: '15/05/2023',
      displayTime: '10:30 AM',
      severity: 'high',
    },
    {
      _id: '2',
      cameraId: 'cam2',
      location: 'Oak Avenue',
      date: '2023-05-16T14:45:00Z',
      displayDate: '16/05/2023',
      displayTime: '2:45 PM',
      severity: 'medium',
    }
  ];

  test('initializes with provided logs', () => {
    const { result } = renderHook(() => useFilterLogs(mockLogs));
    
    expect(result.current.filteredLogs).toEqual(mockLogs);
    expect(result.current.filters).toEqual({
      cameraId: '',
      location: '',
      startDate: null,
      endDate: null,
      severity: '',
      startTime: '',
      endTime: '',
    });
  });

  test('filters logs by cameraId correctly', () => {
    const { result } = renderHook(() => useFilterLogs(mockLogs));
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        cameraId: 'cam1'
      });
      result.current.applyFilters();
    });
    
    expect(result.current.filteredLogs).toHaveLength(1);
    expect(result.current.filteredLogs[0].cameraId).toBe('cam1');
  });

  test('filters logs by location correctly', () => {
    const { result } = renderHook(() => useFilterLogs(mockLogs));
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        location: 'Oak Avenue'
      });
      result.current.applyFilters();
    });
    
    expect(result.current.filteredLogs).toHaveLength(1);
    expect(result.current.filteredLogs[0].location).toBe('Oak Avenue');
  });

  test('filters logs by severity correctly', () => {
    const { result } = renderHook(() => useFilterLogs(mockLogs));
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        severity: 'high'
      });
      result.current.applyFilters();
    });
    
    expect(result.current.filteredLogs).toHaveLength(1);
    expect(result.current.filteredLogs[0].severity).toBe('high');
  });

  test('filters logs by date range correctly', () => {
    const { result } = renderHook(() => useFilterLogs(mockLogs));
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        startDate: '2023-05-16',
        endDate: '2023-05-17'
      });
      result.current.applyFilters();
    });
    
    expect(result.current.filteredLogs).toHaveLength(1);
    expect(result.current.filteredLogs[0]._id).toBe('2');
  });

  test('clears filters correctly', () => {
    const { result } = renderHook(() => useFilterLogs(mockLogs));
    
    // Apply filters first
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        cameraId: 'cam1'
      });
      result.current.applyFilters();
    });
    
    // Should have filtered logs
    expect(result.current.filteredLogs).toHaveLength(1);
    
    // Then clear filters
    act(() => {
      result.current.clearFilters();
    });
    
    // Should reset to initial logs
    expect(result.current.filteredLogs).toEqual(mockLogs);
    expect(result.current.filters).toEqual({
      cameraId: '',
      location: '',
      startDate: null,
      endDate: null,
      severity: '',
      startTime: '',
      endTime: '',
    });
  });
}); 