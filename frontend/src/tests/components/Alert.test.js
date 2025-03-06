// frontend/src/components/AccidentLogs/Alert.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from '../../components/AccidentView/Alert';
import { useAccidentLogs } from '../../context/AccidentContext';
import { useAuth } from '../../authentication/AuthProvider';

// Mock the context hooks
jest.mock('../../context/AccidentContext');
jest.mock('../../authentication/AuthProvider');

// Mock window.confirm
window.confirm = jest.fn();

describe('Alert Component', () => {
  // Mock accident alert data
  const mockSelectedAlert = {
    _id: '123',
    status: 'assigned',
    assignedTo: 'currentUser',
    cameraId: '2',
    location: 'Highway 1',
    displayDate: '01/03/2023',
    displayTime: '14:30',
    severity: 'medium',
    description: 'Vehicle collision',
    falsePositive: false,
    video: 'https://example.com/accident-video.mp4'
  };

  // Mock functions from context
  const mockUpdateAccidentDetails = jest.fn();
  const mockUpdateAccidentStatus = jest.fn();
  const mockClearSelectedAlert = jest.fn();

  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock the authentication context
    useAuth.mockReturnValue({
      user: { username: 'currentUser' }
    });
    
    // Mock the accident logs context
    useAccidentLogs.mockReturnValue({
      selectedAlert: mockSelectedAlert,
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert
    });
    
    // Setup window.confirm to return true by default
    window.confirm.mockReturnValue(true);
  });

  it('renders "No accident selected" when no alert is selected', () => {
    // Override the mock to return null for selectedAlert
    useAccidentLogs.mockReturnValue({
      selectedAlert: null,
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert
    });
    
    render(<Alert />);
    expect(screen.getByText('No accident selected.')).toBeInTheDocument();
  });

  it('renders the accident details when an alert is selected', () => {
    render(<Alert />);
    
    // Check if all the expected details are displayed
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('assigned')).toBeInTheDocument();
    expect(screen.getByText('Camera ID:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Location:')).toBeInTheDocument();
    expect(screen.getByText('Highway 1')).toBeInTheDocument();
    expect(screen.getByText('Date:')).toBeInTheDocument();
    expect(screen.getByText('01/03/2023')).toBeInTheDocument();
    expect(screen.getByText('Time:')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.getByText('Severity:')).toBeInTheDocument();
    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(screen.getByText('Vehicle collision')).toBeInTheDocument();
    expect(screen.getByText('Accident Mark:')).toBeInTheDocument();
    expect(screen.getByText('Accident')).toBeInTheDocument();
  });

  it('renders video element with correct source', () => {
    render(<Alert />);
    
    const videoElement = screen.getByText('Your browser does not support the video tag.');
    const sourceElement = videoElement.previousSibling;
    
    expect(videoElement.parentElement.tagName).toBe('VIDEO');
    expect(sourceElement.tagName).toBe('SOURCE');
    expect(sourceElement.getAttribute('src')).toBe('https://example.com/accident-video.mp4');
    expect(sourceElement.getAttribute('type')).toBe('video/mp4');
  });

  it('renders editable controls when alert is assigned to current user', () => {
    render(<Alert />);
    
    // Should show edit button for description
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    
    // Should show severity dropdown
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Should show action buttons
    expect(screen.getByRole('button', { name: 'Mark As Not An Accident' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark As Handled' })).toBeInTheDocument();
  });

  it('does not render editable controls when alert is assigned to another user', () => {
    // Override the mock to simulate alert assigned to another user
    useAccidentLogs.mockReturnValue({
      selectedAlert: {
        ...mockSelectedAlert,
        assignedTo: 'anotherUser'
      },
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert
    });
    
    render(<Alert />);
    
    // Edit button should not be present
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    
    // Should show severity text instead of dropdown
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    
    // Action buttons should not be present
    expect(screen.queryByRole('button', { name: 'Mark As Not An Accident' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark As Handled' })).not.toBeInTheDocument();
  });

  it('enters description edit mode when Edit button is clicked', () => {
    render(<Alert />);
    
    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    
    // Should now show textarea and save/cancel buttons
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    
    // The original text shouldn't be visible now
    expect(screen.queryByText('Vehicle collision')).not.toBeInTheDocument();
  });

  it('updates description when Save button is clicked', async () => {
    render(<Alert />);
    
    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    
    // Change textarea content
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated description' } });
    
    // Click save button
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    
    // Should call the update function with correct parameters
    expect(mockUpdateAccidentDetails).toHaveBeenCalledWith({
      accident_id: '123',
      description: 'Updated description'
    });
    
    // Should exit edit mode
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('exits edit mode without saving when Cancel button is clicked', () => {
    render(<Alert />);
    
    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    
    // Change textarea content
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated description' } });
    
    // Click cancel button
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    // Should not call the update function
    expect(mockUpdateAccidentDetails).not.toHaveBeenCalled();
    
    // Should exit edit mode
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('changes severity when dropdown is changed', () => {
    render(<Alert />);
    
    // Select a different severity
    const severityDropdown = screen.getByRole('combobox');
    fireEvent.change(severityDropdown, { target: { value: 'high' } });
    
    // Should show confirmation dialog
    expect(window.confirm).toHaveBeenCalledWith('Change severity from medium to high?');
    
    // Should call update function with correct parameters
    expect(mockUpdateAccidentDetails).toHaveBeenCalledWith({
      accident_id: '123',
      severity: 'high'
    });
  });

  it('does not update severity if same value is selected', () => {
    render(<Alert />);
    
    // Select the same severity
    const severityDropdown = screen.getByRole('combobox');
    fireEvent.change(severityDropdown, { target: { value: 'medium' } });
    
    // Should not show confirmation or call update
    expect(window.confirm).not.toHaveBeenCalled();
    expect(mockUpdateAccidentDetails).not.toHaveBeenCalled();
  });

  it('does not update severity if confirmation is cancelled', () => {
    // Set window.confirm to return false
    window.confirm.mockReturnValueOnce(false);
    
    render(<Alert />);
    
    // Select a different severity
    const severityDropdown = screen.getByRole('combobox');
    fireEvent.change(severityDropdown, { target: { value: 'high' } });
    
    // Should show confirmation dialog
    expect(window.confirm).toHaveBeenCalledWith('Change severity from medium to high?');

    // Should not call update function
    expect(mockUpdateAccidentDetails).not.toHaveBeenCalled();
  });

  it('toggles accident mark when button is clicked', () => {
    render(<Alert />);

    // Click toggle button
    fireEvent.click(screen.getByRole('button', { name: 'Mark As Not An Accident' }));

    // Should show confirmation dialog
    expect(window.confirm).toHaveBeenCalledWith('Mark as not an accident?');

    // Should call update function with correct parameters
    expect(mockUpdateAccidentDetails).toHaveBeenCalledWith({
      accident_id: '123',
      falsePositive: true
    });
  });

  it('shows correct toggle button text when falsePositive is true', () => {
    // Override the mock to simulate falsePositive alert
    useAccidentLogs.mockReturnValue({
      selectedAlert: {
        ...mockSelectedAlert,
        falsePositive: true
      },
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert
    });

    render(<Alert />);

    // Should show "Mark As An Accident" button
    expect(screen.getByRole('button', { name: 'Mark As An Accident' })).toBeInTheDocument();
    expect(screen.getByText('Not an Accident')).toBeInTheDocument();
    expect(screen.getByText('Not an Accident')).toHaveStyle('color: red');
  });

  it('marks alert as handled when button is clicked', () => {
    render(<Alert />);

    // Click mark as handled button
    fireEvent.click(screen.getByRole('button', { name: 'Mark As Handled' }));

    // Should show confirmation dialog
    expect(window.confirm).toHaveBeenCalledWith('Mark this accident as handled?');

    // Should call update function with correct parameters
    expect(mockUpdateAccidentStatus).toHaveBeenCalledWith('123', 'handled');

    // Should clear selected alert
    expect(mockClearSelectedAlert).toHaveBeenCalled();
  });

  it('does not show handled button when status is already handled', () => {
    // Override the mock to simulate handled alert
    useAccidentLogs.mockReturnValue({
      selectedAlert: {
        ...mockSelectedAlert,
        status: 'handled'
      },
      updateAccidentDetails: mockUpdateAccidentDetails,
      updateAccidentStatus: mockUpdateAccidentStatus,
      clearSelectedAlert: mockClearSelectedAlert
    });

    render(<Alert />);

    // Should not show "Mark As Handled" button
    expect(screen.queryByRole('button', { name: 'Mark As Handled' })).not.toBeInTheDocument();
  });

  it('initializes form values from selected alert on component mount', () => {
    render(<Alert />);

    // Check if severity dropdown has correct initial value
    const severityDropdown = screen.getByRole('combobox');
    expect(severityDropdown.value).toBe('medium');

    // Enter edit mode to check description
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toBe('Vehicle collision');
  });
});