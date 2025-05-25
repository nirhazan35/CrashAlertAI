import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../src/authentication/AuthProvider';
import { useAccidentLogs } from '../../src/context/AccidentContext';
import Alert from '../../src/components/AccidentView/Alert';
import { renderWithMantine } from '../utils/test-utils';

// Mock the authentication hook
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock the accident logs context
jest.mock('../../src/context/AccidentContext', () => ({
  useAccidentLogs: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();
global.confirm = jest.fn();

describe('Alert Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'user',
    token: 'test-token',
    isLoggedIn: true
  };
  
  const mockAccident = {
    _id: 'accident123',
    date: '2023-05-15T10:30:00Z',
    displayDate: 'May 15, 2023',
    displayTime: '10:30 AM',
    location: 'Main Street Camera',
    severity: 'high',
    description: 'Vehicle collision',
    status: 'active',
    cameraId: 'CAM001',
    falsePositive: false,
    assignedTo: 'testuser',
    images: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'
    ]
  };

  const mockAccidentLogsContext = {
    selectedAlert: mockAccident,
    updateAccidentDetails: jest.fn(),
    updateAccidentStatus: jest.fn(),
    clearSelectedAlert: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default auth mock
    useAuth.mockReturnValue({ user: mockUser });
    
    // Setup default accident logs context mock
    useAccidentLogs.mockReturnValue(mockAccidentLogsContext);
    
    // Setup default confirm behavior
    global.confirm.mockReturnValue(true);
  });

  it('renders accident details correctly', () => {
    renderWithMantine(
      <BrowserRouter>
        <Alert />
      </BrowserRouter>
    );
    
    // Check that accident details are displayed
    expect(screen.getByText(/main street camera/i)).toBeInTheDocument();
    expect(screen.getByText(/vehicle collision/i)).toBeInTheDocument();
    expect(screen.getByText(/may 15, 2023/i)).toBeInTheDocument();
    expect(screen.getByText(/10:30 am/i)).toBeInTheDocument();
    
    // Check severity badge - updated to match actual component structure
    const severityBadge = screen.getByText(/high priority response needed/i);
    expect(severityBadge).toBeInTheDocument();
  });

  it('calls updateAccidentStatus when marking an accident as handled', async () => {
    renderWithMantine(
      <BrowserRouter>
        <Alert />
      </BrowserRouter>
    );
    
    // Find and click the "Handled" button
    const handleButton = screen.getByRole('button', { name: /handled/i });
    await fireEvent.click(handleButton);
    
    // Confirm dialog should appear and be confirmed (mocked)
    expect(global.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Mark this accident as handled?')
    );
    
    // Context's updateAccidentStatus should be called
    expect(mockAccidentLogsContext.updateAccidentStatus).toHaveBeenCalledWith('accident123', 'handled');
  });

  it('shows no accident selected message when no alert is selected', () => {
    // Mock no selected alert
    useAccidentLogs.mockReturnValue({
      ...mockAccidentLogsContext,
      selectedAlert: null
    });
    
    renderWithMantine(
      <BrowserRouter>
        <Alert />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/no accident selected/i)).toBeInTheDocument();
    expect(screen.getByText(/select an accident from the logs to view details/i)).toBeInTheDocument();
  });

  it('renders different actions based on accident status', () => {
    // Update the mock accident to have 'handled' status
    useAccidentLogs.mockReturnValue({
      ...mockAccidentLogsContext,
      selectedAlert: { 
        ...mockAccident, 
        status: 'handled',
        falsePositive: false 
      }
    });
    
    renderWithMantine(
      <BrowserRouter>
        <Alert />
      </BrowserRouter>
    );
    
    // Should show "Not an Accident" button
    const notAccidentButton = screen.getByRole('button', { name: /not an accident/i });
    expect(notAccidentButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /handled/i })).not.toBeInTheDocument();
  });

  it('allows admin users to see additional actions', () => {
    // Set up admin user
    useAuth.mockReturnValue({ 
      user: { ...mockUser, role: 'admin' } 
    });
    
    renderWithMantine(
      <BrowserRouter>
        <Alert />
      </BrowserRouter>
    );
    
    // Should show admin-specific actions
    const notAccidentButton = screen.getByRole('button', { name: /not an accident/i });
    expect(notAccidentButton).toBeInTheDocument();
  });
}); 