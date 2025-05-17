import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '../../src/components/AccidentView/Alert';
import { useAuth } from '../../src/authentication/AuthProvider';
import { useAccidentLogs } from '../../src/context/AccidentContext';

// Mock the required hooks
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../src/context/AccidentContext', () => ({
  useAccidentLogs: jest.fn()
}));

// Mock window.confirm
window.confirm = jest.fn();

// Mock the Mantine components
jest.mock('@mantine/core', () => {
  const actual = jest.requireActual('@mantine/core');
  return {
    ...actual,
    useMantineTheme: () => ({
      colors: {
        brand: { 5: '#3380FF' },
        gray: { 3: '#CCCCCC' }
      }
    }),
    Box: ({ children, className, id }) => <div className={className} id={id}>{children}</div>,
    Text: ({ children, size, c }) => <span className={`text-${size}-${c}`}>{children}</span>,
    Group: ({ children, position }) => <div className={`group-${position}`}>{children}</div>,
    Select: ({ data, value, onChange }) => (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {data.map((option, i) => (
          <option key={i} value={option.value}>{option.label}</option>
        ))}
      </select>
    ),
    Textarea: ({ value, onChange, placeholder }) => (
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ),
    Button: ({ children, onClick, color, variant, size }) => (
      <button 
        onClick={onClick} 
        className={`button-${color}-${variant}-${size}`}
      >
        {children}
      </button>
    ),
    Badge: ({ children, color, size }) => <span className={`badge-${color}-${size}`}>{children}</span>,
    Stack: ({ children, spacing }) => <div className={`stack-${spacing}`}>{children}</div>,
    Grid: ({ children }) => <div className="grid">{children}</div>,
    'Grid.Col': ({ children, span }) => <div className="grid-col">{children}</div>,
    ActionIcon: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
    Divider: () => <hr />,
    Paper: ({ children, p, radius, shadow, className }) => (
      <div className={`paper-${p}-${radius}-${shadow} ${className}`}>{children}</div>
    )
  };
});

describe('Alert Component', () => {
  // Mock data
  const mockSelectedAlert = {
    _id: '123',
    video: 'https://drive.google.com/file/d/abc123/view',
    location: 'Main Street',
    date: '2023-05-15T10:30:00Z',
    displayDate: '15/05/2023',
    displayTime: '10:30 AM',
    severity: 'high',
    description: 'Vehicle collision with pedestrian',
    status: 'assigned',
    assignedTo: 'testuser',
    falsePositive: false
  };
  
  const mockUpdateAccidentDetails = jest.fn();
  const mockUpdateAccidentStatus = jest.fn();
  const mockClearSelectedAlert = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock return values
    useAuth.mockReturnValue({
      user: { username: 'testuser', role: 'user' }
    });
    
    useAccidentLogs.mockReturnValue({
      selectedAlert: mockSelectedAlert,
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert
    });
    
    // Default window.confirm behavior
    window.confirm.mockReturnValue(true);
  });

  test('renders "No accident selected" when no alert is selected', () => {
    useAccidentLogs.mockReturnValue({
      selectedAlert: null
    });
    
    render(<Alert />);
    
    expect(screen.getByText('No accident selected')).toBeInTheDocument();
    expect(screen.getByText('Select an accident from the logs to view details')).toBeInTheDocument();
  });

  test('renders accident details when an alert is selected', () => {
    render(<Alert />);
    
    // Check that status badge is rendered
    expect(screen.getByText('ASSIGNED TO TESTUSER')).toBeInTheDocument();
    
    // Check that iframe with video is rendered with correct URL
    const iframe = screen.getByTitle('Accident Video');
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toContain('https://drive.google.com/file/d/abc123/preview');
    
    // Check that location is displayed
    expect(screen.getByText('Main Street')).toBeInTheDocument();
    
    // Check that date is displayed
    expect(screen.getByText('15/05/2023')).toBeInTheDocument();
    
    // Check that time is displayed
    expect(screen.getByText('10:30 AM')).toBeInTheDocument();
    
    // Check that severity is displayed
    expect(screen.getByText('high')).toBeInTheDocument();
    
    // Check that description is displayed
    expect(screen.getByText('Vehicle collision with pedestrian')).toBeInTheDocument();
  });

  test('allows editing description when alert is assigned to current user', () => {
    render(<Alert />);
    
    // Find and click edit button for description
    const editButtons = screen.getAllByRole('button');
    const descEditButton = editButtons.find(button => button.textContent === 'Edit Description');
    fireEvent.click(descEditButton);
    
    // Check that textarea appears
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('Vehicle collision with pedestrian');
    
    // Change description
    fireEvent.change(textarea, { target: { value: 'Updated description' } });
    
    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Check that updateAccidentDetails was called with correct params
    expect(mockUpdateAccidentDetails).toHaveBeenCalledWith({
      accident_id: '123',
      description: 'Updated description'
    });
  });

  test('allows changing severity when alert is assigned to current user', () => {
    render(<Alert />);
    
    // Find severity select
    const severitySelect = screen.getByRole('combobox');
    expect(severitySelect).toBeInTheDocument();
    
    // Change severity
    fireEvent.change(severitySelect, { target: { value: 'medium' } });
    
    // Check that confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith('Change severity from high to medium?');
    
    // Check that updateAccidentDetails was called with correct params
    expect(mockUpdateAccidentDetails).toHaveBeenCalledWith({
      accident_id: '123',
      severity: 'medium'
    });
  });

  test('allows marking as "Not an Accident" when alert is assigned to current user', () => {
    render(<Alert />);
    
    // Find not an accident button
    const notAccidentButton = screen.getByText('Not an Accident');
    expect(notAccidentButton).toBeInTheDocument();
    
    // Click button
    fireEvent.click(notAccidentButton);
    
    // Check that confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith('Mark as not an accident?');
    
    // Check that updateAccidentDetails was called with correct params
    expect(mockUpdateAccidentDetails).toHaveBeenCalledWith({
      accident_id: '123',
      falsePositive: true
    });
  });

  test('allows marking as "Handled" when alert is assigned to current user', () => {
    render(<Alert />);
    
    // Find handled button
    const handledButton = screen.getByText('Handled');
    expect(handledButton).toBeInTheDocument();
    
    // Click button
    fireEvent.click(handledButton);
    
    // Check that confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith('Mark this accident as handled?');
    
    // Check that updateAccidentStatus was called with correct params
    expect(mockUpdateAccidentStatus).toHaveBeenCalledWith('123', 'handled');
    
    // Check that clearSelectedAlert was called
    expect(mockClearSelectedAlert).toHaveBeenCalled();
  });

  test('does not allow edits when alert is not assigned to current user', () => {
    useAccidentLogs.mockReturnValue({
      selectedAlert: {
        ...mockSelectedAlert,
        assignedTo: 'otheruser'
      },
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert
    });
    
    render(<Alert />);
    
    // Action buttons should not be present
    expect(screen.queryByText('Not an Accident')).not.toBeInTheDocument();
    expect(screen.queryByText('Handled')).not.toBeInTheDocument();
    
    // Edit description button should not be present
    const editButtons = screen.getAllByRole('button');
    const descEditButton = editButtons.find(button => button.textContent === 'Edit Description');
    expect(descEditButton).toBeUndefined();
  });
}); 