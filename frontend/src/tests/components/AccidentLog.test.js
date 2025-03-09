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
      video: 'https://drive.google.com/file/d/1aWNR4Y4NB9272xnnzvCJN71xcus-LRWc/view',
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
      video: 'https://drive.google.com/file/d/1aWNR4Y4NB9272xnnzvCJN71xcus-LRWc/view',
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
      video: 'https://drive.google.com/file/d/1aWNR4Y4NB9272xnnzvCJN71xcus-LRWc/view',
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

    // Reset any mocked components or variables
    jest.clearAllMocks();
  });

  it('renders the component without crashing', () => {
    render(<AccidentLog />);

    // Using a more reliable way to find elements that should exist
    expect(screen.getAllByText(/view video/i)).toHaveLength(3); // 3 video objects
    expect(screen.getAllByText(/location/i)).toHaveLength(2); // 2 locations
  });

  it('displays all accident logs initially', () => {
    render(<AccidentLog />);
    expect(screen.getAllByRole('row')).toHaveLength(4); // 3 logs + header row
  });

  it('filters logs by camera ID', async () => {
    render(<AccidentLog />);

    // Find the camera filter by its label or name attribute
    const cameraSelects = screen.getAllByRole('combobox');
    // Find the one that has a name or aria-label related to camera
    const cameraSelect = cameraSelects.find(select =>
      select.name === 'cameraId' ||
      select.getAttribute('aria-label')?.includes('camera')
    );

    // If we can't find it by role, try to find it by test ID
    if (!cameraSelect) {
      const cameraSelect = screen.getByTestId('camera-filter');
      fireEvent.change(cameraSelect, { target: { value: '1' } });
    } else {
      fireEvent.change(cameraSelect, { target: { value: '1' } });
    }

    // Wait for the filtering to take effect
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeLessThan(4); // Should have fewer rows than before
    });

    // Check that the correct items are displayed
    expect(screen.getByText('Minor collision')).toBeInTheDocument();
    expect(screen.getByText('Vehicle breakdown')).toBeInTheDocument();
    expect(screen.queryByText('Major accident')).not.toBeInTheDocument();
  });

  it('filters logs by location', async () => {
    render(<AccidentLog />);

    // Find the location filter by its label or name attribute
    const locationSelects = screen.getAllByRole('combobox');
    // Find the one that has a name or aria-label related to location
    const locationSelect = locationSelects.find(select =>
      select.name === 'location' ||
      select.getAttribute('aria-label')?.includes('location')
    );

    // If we can't find it by role, try to find it by test ID
    if (!locationSelect) {
      const locationSelect = screen.getByTestId('location-filter');
      fireEvent.change(locationSelect, { target: { value: 'Highway 2' } });
    } else {
      fireEvent.change(locationSelect, { target: { value: 'Highway 2' } });
    }

    // Wait for the filtering to take effect
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeLessThan(4); // Should have fewer rows than before
    });

    // Check that the correct items are displayed
    expect(screen.queryByText('Minor collision')).not.toBeInTheDocument();
    expect(screen.getByText('Major accident')).toBeInTheDocument();
  });

  it('filters logs by severity', async () => {
    render(<AccidentLog />);

    // Find the severity filter by its label or name attribute
    const severitySelects = screen.getAllByRole('combobox');
    // Find the one that has a name or aria-label related to severity
    const severitySelect = severitySelects.find(select =>
      select.name === 'severity' ||
      select.getAttribute('aria-label')?.includes('severity')
    );

    // If we can't find it by role, try to find it by test ID
    if (!severitySelect) {
      const severitySelect = screen.getByTestId('severity-filter');
      fireEvent.change(severitySelect, { target: { value: 'low' } });
    } else {
      fireEvent.change(severitySelect, { target: { value: 'low' } });
    }

    // Wait for the filtering to take effect
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeLessThan(4); // Should have fewer rows than before
    });

    // Check that the correct items are displayed
    expect(screen.getByText('Vehicle breakdown')).toBeInTheDocument();
    expect(screen.queryByText('Minor collision')).not.toBeInTheDocument();
  });

  it('filters logs by date', () => {
    render(<AccidentLog />);

    // Input date filter - using a more specific selector
    const dateInput = screen.getByPlaceholderText('Filter by Date');
    fireEvent.change(dateInput, { target: { value: '2023-03-01' } });

    // Should now display only logs from 01/03/2023
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2); // 1 log + header row
    expect(screen.getByText('Minor collision')).toBeInTheDocument();
    expect(screen.queryByText('Major accident')).not.toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', async () => {
    render(<AccidentLog />);

    // Apply a filter first - using a more specific selector
    const dateInput = screen.getByPlaceholderText('Filter by Date');
    fireEvent.change(dateInput, { target: { value: '2023-03-01' } });

    // Verify the filter was applied
    await waitFor(() => {
      expect(screen.queryByText('Major accident')).not.toBeInTheDocument();
    });

    // Clear filters - find the button by its text content
    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    fireEvent.click(clearButton);

    // Wait for the clearing to take effect
    await waitFor(() => {
      // Should show all logs again
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(4); // 3 logs + header row
      expect(screen.getByText('Major accident')).toBeInTheDocument();
    });
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
    const assignButtons = screen.getAllByRole('button', { name: /assign/i });
    expect(assignButtons).toHaveLength(3);
  });

  it('renders unassign button for logs assigned to current user', () => {
    // Mock the current user is the one assigned to the log
    useAuth.mockReturnValue({
      user: { username: 'user1' },
    });

    render(<AccidentLog />);

    // The second log is assigned to user1
    const unassignButton = screen.getByRole('button', { name: /unassign/i });
    expect(unassignButton).toBeInTheDocument();
  });

  it('renders disabled button for logs assigned to other users', () => {
    render(<AccidentLog />);

    // The second log is assigned to user1, but current user is testUser
    const disabledButton = screen.getByRole('button', { name: /assigned to user1/i });
    expect(disabledButton).toBeInTheDocument();
    expect(disabledButton).toBeDisabled();
  });

  it('calls updateAccidentStatus when assign button is clicked', () => {
    render(<AccidentLog />);

    // Click on assign button for the first log
    const assignButtons = screen.getAllByRole('button', { name: /assign/i });
    fireEvent.click(assignButtons[0]);

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
    const unassignButton = screen.getByRole('button', { name: /unassign/i });
    fireEvent.click(unassignButton);
    
    // updateAccidentStatus should be called with the log ID and 'active'
    expect(mockUpdateAccidentStatus).toHaveBeenCalledWith('2', 'active');
  });
});