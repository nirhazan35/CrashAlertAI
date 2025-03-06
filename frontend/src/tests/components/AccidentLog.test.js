// frontend/src/components/AccidentLogs/AccidentLog.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccidentLog from '../../components/AccidentLogs/AccidentLog';
import { useAccidentLogs } from '../../context/AccidentContext';
import { useAuth } from '../../authentication/AuthProvider';

// Mock the context hooks
jest.mock('../../context/AccidentContext');
jest.mock('../../authentication/AuthProvider');

describe('AccidentLog Component', () => {
  // Sample accident logs data for testing
  const mockAccidentLogs = [
    {
      _id: '1',
      cameraId: '1',
      location: 'Highway 1',
      date: '2023-03-01T00:00:00.000Z',
      displayDate: '01/03/2023',
      displayTime: '08:00',
      severity: 'medium',
      description: 'Minor collision',
      status: 'active',
      video: 'https://example.com/video1',
    },
    {
      _id: '2',
      cameraId: '2',
      location: 'Highway 2',
      date: '2023-03-02T00:00:00.000Z',
      displayDate: '02/03/2023',
      displayTime: '14:00',
      severity: 'high',
      description: 'Major accident',
      status: 'assigned',
      assignedTo: 'user1',
      video: 'https://example.com/video2',
    },
    {
      _id: '3',
      cameraId: '1',
      location: 'Highway 1',
      date: '2023-03-03T00:00:00.000Z',
      displayDate: '03/03/2023',
      displayTime: '16:00',
      severity: 'low',
      description: 'Vehicle breakdown',
      status: 'active',
      video: 'https://example.com/video3',
    },
  ];

  const mockUpdateAccidentStatus = jest.fn();
  const mockHandleRowDoubleClick = jest.fn();
  
  // Setup before each test
  beforeEach(() => {
    useAccidentLogs.mockReturnValue({
      accidentLogs: mockAccidentLogs,
      updateAccidentStatus: mockUpdateAccidentStatus,
      handleRowDoubleClick: mockHandleRowDoubleClick,
    });
    
    useAuth.mockReturnValue({
      user: { username: 'testUser' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component without crashing', () => {
    render(<AccidentLog />);
    expect(screen.getByText('View Video')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('displays all accident logs initially', () => {
    render(<AccidentLog />);
    expect(screen.getAllByRole('row')).toHaveLength(4); // 3 logs + header row
  });

  it('filters logs by camera ID', () => {
    render(<AccidentLog />);
    
    // Select camera ID filter
    const cameraSelect = screen.getByRole('combobox', { name: '' });
    fireEvent.change(cameraSelect, { target: { name: 'cameraId', value: '1' } });
    
    // Should now display only logs with camera ID 1
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // 2 logs + header row
    expect(screen.getByText('Minor collision')).toBeInTheDocument();
    expect(screen.getByText('Vehicle breakdown')).toBeInTheDocument();
    expect(screen.queryByText('Major accident')).not.toBeInTheDocument();
  });

  it('filters logs by location', () => {
    render(<AccidentLog />);
    
    // Select location filter
    const locationSelect = screen.getByRole('combobox', { name: '' });
    fireEvent.change(locationSelect, { target: { name: 'location', value: 'Highway 2' } });
    
    // Should now display only logs with Highway 2 location
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2); // 1 log + header row
    expect(screen.queryByText('Minor collision')).not.toBeInTheDocument();
    expect(screen.getByText('Major accident')).toBeInTheDocument();
  });

  it('filters logs by severity', () => {
    render(<AccidentLog />);
    
    // Select severity filter
    const severitySelect = screen.getByRole('combobox', { name: '' });
    fireEvent.change(severitySelect, { target: { name: 'severity', value: 'low' } });
    
    // Should now display only logs with low severity
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2); // 1 log + header row
    expect(screen.getByText('Vehicle breakdown')).toBeInTheDocument();
    expect(screen.queryByText('Minor collision')).not.toBeInTheDocument();
  });

  it('filters logs by date', () => {
    render(<AccidentLog />);
    
    // Input date filter
    const dateInput = screen.getByPlaceholderText('Filter by Date');
    fireEvent.change(dateInput, { target: { name: 'date', value: '2023-03-01' } });
    
    // Should now display only logs from 01/03/2023
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2); // 1 log + header row
    expect(screen.getByText('Minor collision')).toBeInTheDocument();
    expect(screen.queryByText('Major accident')).not.toBeInTheDocument();
  });

  it('filters logs by time range', () => {
    render(<AccidentLog />);
    
    // Select time range filters
    const startTimeSelect = screen.getByRole('combobox', { name: '' });
    fireEvent.change(startTimeSelect, { target: { name: 'startTime', value: '14:00' } });
    
    const endTimeSelect = screen.getByRole('combobox', { name: '' });
    fireEvent.change(endTimeSelect, { target: { name: 'endTime', value: '16:00' } });
    
    // Should now display only logs between 14:00 and 16:00
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // 2 logs + header row
    expect(screen.getByText('Major accident')).toBeInTheDocument();
    expect(screen.getByText('Vehicle breakdown')).toBeInTheDocument();
    expect(screen.queryByText('Minor collision')).not.toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', () => {
    render(<AccidentLog />);
    
    // Apply a filter first
    const severitySelect = screen.getByRole('combobox', { name: '' });
    fireEvent.change(severitySelect, { target: { name: 'severity', value: 'low' } });
    
    // Clear filters
    const clearButton = screen.getByRole('button', { name: 'Clear Filters' });
    fireEvent.click(clearButton);
    
    // Should show all logs again
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4); // 3 logs + header row
  });

  it('highlights a row when clicked', () => {
    render(<AccidentLog />);
    
    // Click on the first log row
    const rows = screen.getAllByRole('row');
    fireEvent.click(rows[1]); // First data row (index 0 is header)
    
    // The row should now have the 'highlighted' class
    expect(rows[1]).toHaveClass('highlighted');
  });

  it('triggers handleRowDoubleClick when a row is double-clicked', () => {
    render(<AccidentLog />);
    
    // Double-click on the first log row
    const rows = screen.getAllByRole('row');
    fireEvent.doubleClick(rows[1]); // First data row
    
    // The handleRowDoubleClick function should be called with the first log
    expect(mockHandleRowDoubleClick).toHaveBeenCalledWith(mockAccidentLogs[0]);
  });

  it('renders assign button for unassigned logs', () => {
    render(<AccidentLog />);
    
    // The first log is active (unassigned)
    const assignButtons = screen.getAllByRole('button', { name: 'Assign' });
    expect(assignButtons).toHaveLength(2); // Two unassigned logs
  });

  it('renders unassign button for logs assigned to current user', () => {
    // Mock the current user is the one assigned to the log
    useAuth.mockReturnValue({
      user: { username: 'user1' },
    });
    
    render(<AccidentLog />);
    
    // The second log is assigned to user1
    const unassignButton = screen.getByRole('button', { name: 'Unassign' });
    expect(unassignButton).toBeInTheDocument();
  });

  it('renders disabled button for logs assigned to other users', () => {
    render(<AccidentLog />);
    
    // The second log is assigned to user1, but current user is testUser
    const disabledButton = screen.getByRole('button', { name: 'Assigned to user1' });
    expect(disabledButton).toBeInTheDocument();
    expect(disabledButton).toBeDisabled();
  });

  it('calls updateAccidentStatus when assign button is clicked', () => {
    render(<AccidentLog />);
    
    // Click on assign button for the first log
    const assignButton = screen.getAllByRole('button', { name: 'Assign' })[0];
    fireEvent.click(assignButton);
    
    // updateAccidentStatus should be called with the log ID and 'assigned'
    expect(mockUpdateAccidentStatus).toHaveBeenCalledWith('1', 'assigned');
  });

  it('calls updateAccidentStatus with "active" when unassign button is clicked', () => {
    // Mock current user is the one assigned to the log
    useAuth.mockReturnValue({
      user: { username: 'user1' },
    });
    
    render(<AccidentLog />);
    
    // Click on unassign button for the second log
    const unassignButton = screen.getByRole('button', { name: 'Unassign' });
    fireEvent.click(unassignButton);
    
    // updateAccidentStatus should be called with the log ID and 'active'
    expect(mockUpdateAccidentStatus).toHaveBeenCalledWith('2', 'active');
  });
});