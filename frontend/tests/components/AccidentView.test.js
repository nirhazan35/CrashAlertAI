import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AccidentView from '../../src/components/AccidentView/AccidentView';
import { useAuth } from '../../src/authentication/AuthProvider';

// Mock the authentication hook
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();
global.confirm = jest.fn();

describe('AccidentView Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'user',
    token: 'test-token',
    isLoggedIn: true
  };
  
  const mockAccident = {
    _id: 'accident123',
    date: '2023-05-15T10:30:00Z',
    location: 'Main Street Camera',
    severity: 'high',
    description: 'Vehicle collision',
    status: 'active',
    cameraId: 'CAM001',
    images: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default auth mock
    useAuth.mockReturnValue({ user: mockUser });
    
    // Setup default fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    
    // Setup default confirm behavior
    global.confirm.mockReturnValue(true);
  });

  it('renders accident details correctly', () => {
    render(
      <BrowserRouter>
        <AccidentView accident={mockAccident} onClose={jest.fn()} />
      </BrowserRouter>
    );
    
    // Check that accident details are displayed
    expect(screen.getByText(/accident details/i)).toBeInTheDocument();
    expect(screen.getByText(/main street camera/i)).toBeInTheDocument();
    expect(screen.getByText(/vehicle collision/i)).toBeInTheDocument();
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    
    // Check formatted date
    const date = new Date(mockAccident.date).toLocaleString();
    expect(screen.getByText(date)).toBeInTheDocument();
    
    // Check that images are displayed
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(mockAccident.images.length);
  });

  it('allows marking an accident as handled', async () => {
    render(
      <BrowserRouter>
        <AccidentView 
          accident={mockAccident} 
          onClose={jest.fn()} 
          onStatusChange={jest.fn()}
        />
      </BrowserRouter>
    );
    
    // Find and click the "Mark as Handled" button
    const handleButton = screen.getByText(/mark as handled/i);
    fireEvent.click(handleButton);
    
    // Confirm dialog should appear and be confirmed (mocked)
    expect(global.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Mark this accident as handled?')
    );
    
    // API call should be made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/accidents/accident-status-update`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            accident_id: 'accident123',
            status: 'handled'
          })
        })
      );
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock a failed API call
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        success: false, 
        message: 'Failed to update accident status' 
      })
    });
    
    const mockOnClose = jest.fn();
    
    render(
      <BrowserRouter>
        <AccidentView 
          accident={mockAccident} 
          onClose={mockOnClose} 
          onStatusChange={jest.fn()} 
        />
      </BrowserRouter>
    );
    
    // Find and click the action button
    const handleButton = screen.getByText(/mark as handled/i);
    fireEvent.click(handleButton);
    
    // API call should be attempted
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // Error message should be displayed
    expect(screen.getByText(/failed to update accident status/i)).toBeInTheDocument();
    
    // Modal should not be closed automatically on error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('allows closing the view', () => {
    const mockOnClose = jest.fn();
    
    render(
      <BrowserRouter>
        <AccidentView accident={mockAccident} onClose={mockOnClose} />
      </BrowserRouter>
    );
    
    // Find and click the close button
    const closeButton = screen.getByText(/close/i);
    fireEvent.click(closeButton);
    
    // Close handler should be called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onStatusChange when status is successfully updated', async () => {
    const mockOnStatusChange = jest.fn();
    
    render(
      <BrowserRouter>
        <AccidentView 
          accident={mockAccident} 
          onClose={jest.fn()} 
          onStatusChange={mockOnStatusChange} 
        />
      </BrowserRouter>
    );
    
    // Find and click the action button
    const handleButton = screen.getByText(/mark as handled/i);
    fireEvent.click(handleButton);
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // Status change handler should be called with updated accident
    expect(mockOnStatusChange).toHaveBeenCalledWith({
      ...mockAccident,
      status: 'handled'
    });
  });

  it('renders different actions based on accident status', () => {
    // Render with 'handled' accident status
    const handledAccident = {
      ...mockAccident,
      status: 'handled'
    };
    
    render(
      <BrowserRouter>
        <AccidentView accident={handledAccident} onClose={jest.fn()} />
      </BrowserRouter>
    );
    
    // Should show "Mark as Unhandled" instead of "Mark as Handled"
    expect(screen.getByText(/mark as unhandled/i)).toBeInTheDocument();
    expect(screen.queryByText(/mark as handled/i)).not.toBeInTheDocument();
  });

  it('allows admin users to see additional actions', () => {
    // Set up admin user
    useAuth.mockReturnValue({ 
      user: { ...mockUser, role: 'admin' } 
    });
    
    render(
      <BrowserRouter>
        <AccidentView accident={mockAccident} onClose={jest.fn()} />
      </BrowserRouter>
    );
    
    // Should show admin-specific actions
    expect(screen.getByText(/delete accident/i)).toBeInTheDocument();
  });
}); 