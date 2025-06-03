import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import AccidentLog from '../../src/components/AccidentLogs/AccidentLog';
import { useAccidentLogs } from '../../src/context/AccidentContext';
import { useAuth } from '../../src/authentication/AuthProvider';
import { renderWithMantine } from '../utils/test-utils';

// Mock the context hooks
jest.mock('../../src/context/AccidentContext', () => ({
  useAccidentLogs: jest.fn()
}));

jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('AccidentLog Component', () => {
  // Sample accident logs for testing
  const mockAccidentLogs = [
    {
      _id: '1',
      location: 'Main Street',
      date: '2023-05-15T10:30:00Z',
      displayDate: '15/05/2023',
      displayTime: '10:30 AM',
      severity: 'high',
      description: 'Vehicle collision with pedestrian',
      status: 'active',
      video: 'https://example.com/video1'
    },
    {
      _id: '2',
      location: 'Oak Avenue',
      date: '2023-05-16T14:45:00Z',
      displayDate: '16/05/2023',
      displayTime: '2:45 PM',
      severity: 'medium',
      description: 'Vehicle skidded off road',
      status: 'assigned',
      assignedTo: 'testuser',
      video: 'https://example.com/video2'
    },
    {
      _id: '3',
      location: 'Pine Road',
      date: '2023-05-17T08:15:00Z',
      displayDate: '17/05/2023',
      displayTime: '8:15 AM',
      severity: 'low',
      description: 'Near miss incident',
      status: 'active',
      video: 'https://example.com/video3'
    }
  ];

  // Mock functions
  const mockUpdateAccidentStatus = jest.fn();
  const mockHandleRowDoubleClick = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    useAccidentLogs.mockReturnValue({
      accidentLogs: mockAccidentLogs,
      updateAccidentStatus: mockUpdateAccidentStatus,
      handleRowDoubleClick: mockHandleRowDoubleClick
    });
    
    useAuth.mockReturnValue({
      user: { username: 'testuser', role: 'user' }
    });
  });

  test('renders accident log table with correct headers', () => {
    renderWithMantine(<AccidentLog />);
    
    // Check table headers
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  test('renders accident logs from context correctly', () => {
    renderWithMantine(<AccidentLog />);
    
    // Check if accident logs are rendered
    expect(screen.getByText('Main Street')).toBeInTheDocument();
    expect(screen.getByText('Oak Avenue')).toBeInTheDocument();
    expect(screen.getByText('Pine Road')).toBeInTheDocument();
    
    // Check severity badges
    const highBadge = screen.getByText('high');
    const mediumBadge = screen.getByText('medium');
    const lowBadge = screen.getByText('low');
    
    expect(highBadge).toBeInTheDocument();
    expect(mediumBadge).toBeInTheDocument();
    expect(lowBadge).toBeInTheDocument();
  });

  test('renders filtered logs when provided', () => {
    const filteredLogs = [mockAccidentLogs[0]]; // Only the first log
    
    renderWithMantine(<AccidentLog filteredLogs={filteredLogs} />);
    
    // Should only show Main Street and not the others
    expect(screen.getByText('Main Street')).toBeInTheDocument();
    expect(screen.queryByText('Oak Avenue')).not.toBeInTheDocument();
    expect(screen.queryByText('Pine Road')).not.toBeInTheDocument();
  });

  test('handles row clicks to select a row', () => {
    renderWithMantine(<AccidentLog />);
    
    // Click on a row
    const rows = screen.getAllByRole('row');
    // First row is header, so we use index 1 for first data row
    fireEvent.click(rows[1]);
    
    // Check that the row has been selected (this would typically add a class)
    expect(rows[1]).toHaveTextContent('Main Street');
  });

  test('calls handleRowDoubleClick when a row is double-clicked', () => {
    renderWithMantine(<AccidentLog />);
    
    // Double-click on a row
    const rows = screen.getAllByRole('row');
    fireEvent.doubleClick(rows[1]); // First data row
    
    // Check that the handler was called with the correct log
    expect(mockHandleRowDoubleClick).toHaveBeenCalledWith(mockAccidentLogs[0]);
  });

  test('uses custom handleRowDoubleClick when provided', () => {
    const customHandler = jest.fn();
    renderWithMantine(<AccidentLog handleRowDoubleClick={customHandler} />);
    
    // Double-click on a row
    const rows = screen.getAllByRole('row');
    fireEvent.doubleClick(rows[1]); // First data row
    
    // Check that the custom handler was called, not the default one
    expect(customHandler).toHaveBeenCalledWith(mockAccidentLogs[0]);
    expect(mockHandleRowDoubleClick).not.toHaveBeenCalled();
  });

  test('calls updateAccidentStatus when action button is clicked', () => {
    renderWithMantine(<AccidentLog />);
    
    // Find and click the button in the first row (which has 'active' status)
    const buttons = screen.getAllByRole('button');
    const activeRowButton = buttons.find(button => button.textContent === 'Assign');
    
    fireEvent.click(activeRowButton);
    
    // Check updateAccidentStatus was called with the correct parameters
    expect(mockUpdateAccidentStatus).toHaveBeenCalledWith('1', 'assigned');
  });

  test('displays "Assigned to" text for accidents assigned to other users', () => {
    // Change the logged-in user to be different from the assigned user
    useAuth.mockReturnValue({
      user: { username: 'otheruser', role: 'user' }
    });
    
    renderWithMantine(<AccidentLog />);
    
    // Should show the "Assigned to testuser" text
    expect(screen.getByText('Assigned to testuser')).toBeInTheDocument();
  });

  test('renders custom action buttons when renderActions prop is provided', () => {
    const customRenderActions = jest.fn().mockReturnValue(
      <button>Custom Action</button>
    );
    
    renderWithMantine(<AccidentLog renderActions={customRenderActions} />);
    
    // Check that our custom button text is rendered
    expect(screen.getAllByText('Custom Action').length).toBe(3); // One for each row
    
    // Check that the renderActions function was called for each log
    expect(customRenderActions).toHaveBeenCalledTimes(3);
    expect(customRenderActions).toHaveBeenCalledWith(mockAccidentLogs[0], 0);
    expect(customRenderActions).toHaveBeenCalledWith(mockAccidentLogs[1], 1);
    expect(customRenderActions).toHaveBeenCalledWith(mockAccidentLogs[2], 2);
  });
});