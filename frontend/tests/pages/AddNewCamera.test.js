import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AddNewCamera from '../../src/pages/AddNewCamera/AddNewCamera';
import { useAuth } from '../../src/authentication/AuthProvider';
import * as AdminActions from '../../src/pages/AdminPage/AdminActions';

// Mock the authentication
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock the admin actions
jest.mock('../../src/pages/AdminPage/AdminActions', () => ({
  addNewCamera: jest.fn(),
}));

// Mock window.alert
global.alert = jest.fn();

describe('AddNewCamera Component', () => {
  const mockUser = { token: 'mock-token' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    useAuth.mockReturnValue({ user: mockUser });
    AdminActions.addNewCamera.mockResolvedValue({ success: true });
  });

  it('renders the form correctly', () => {
    render(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );
    
    // Check if the title is rendered
    expect(screen.getByText('Add New Camera')).toBeInTheDocument();
    
    // Check if all form fields are present
    expect(screen.getByLabelText(/camera id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/camera name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stream url/i)).toBeInTheDocument();
    
    // Check if the submit button is present
    expect(screen.getByRole('button', { name: /add camera/i })).toBeInTheDocument();
  });

  it('validates form fields before submission', async () => {
    render(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );
    
    // Try to submit without filling in the required fields
    const submitButton = screen.getByRole('button', { name: /add camera/i });
    fireEvent.click(submitButton);
    
    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText(/camera id is required/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/camera name is required/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/location is required/i)).toBeInTheDocument();
    });
    
    // Verify that the API wasn't called
    expect(AdminActions.addNewCamera).not.toHaveBeenCalled();
  });

  it('successfully submits the form with valid data', async () => {
    render(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );
    
    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/camera id/i), { 
      target: { value: 'CAM001' } 
    });
    
    fireEvent.change(screen.getByLabelText(/camera name/i), { 
      target: { value: 'Front Entrance Camera' } 
    });
    
    fireEvent.change(screen.getByLabelText(/location/i), { 
      target: { value: 'Main Building Entrance' } 
    });
    
    fireEvent.change(screen.getByLabelText(/stream url/i), { 
      target: { value: 'rtsp://example.com/stream1' } 
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add camera/i });
    fireEvent.click(submitButton);
    
    // Verify that the API was called with the correct data
    await waitFor(() => {
      expect(AdminActions.addNewCamera).toHaveBeenCalledWith(
        mockUser,
        {
          cameraId: 'CAM001',
          name: 'Front Entrance Camera',
          location: 'Main Building Entrance',
          streamUrl: 'rtsp://example.com/stream1'
        }
      );
    });
    
    // Check for success message
    expect(global.alert).toHaveBeenCalledWith('Camera added successfully');
    
    // Form should be reset after successful submission
    await waitFor(() => {
      expect(screen.getByLabelText(/camera id/i).value).toBe('');
      expect(screen.getByLabelText(/camera name/i).value).toBe('');
      expect(screen.getByLabelText(/location/i).value).toBe('');
      expect(screen.getByLabelText(/stream url/i).value).toBe('');
    });
  });

  it('handles API errors during submission', async () => {
    // Mock API error
    const errorMessage = 'Failed to add camera: Duplicate camera ID';
    AdminActions.addNewCamera.mockRejectedValueOnce(new Error(errorMessage));
    
    render(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );
    
    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/camera id/i), { 
      target: { value: 'CAM001' } 
    });
    
    fireEvent.change(screen.getByLabelText(/camera name/i), { 
      target: { value: 'Front Entrance Camera' } 
    });
    
    fireEvent.change(screen.getByLabelText(/location/i), { 
      target: { value: 'Main Building Entrance' } 
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add camera/i });
    fireEvent.click(submitButton);
    
    // Verify API call was made
    await waitFor(() => {
      expect(AdminActions.addNewCamera).toHaveBeenCalled();
    });
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/error:/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to add camera/i)).toBeInTheDocument();
    });
    
    // Form values should still be present (not reset)
    expect(screen.getByLabelText(/camera id/i).value).toBe('CAM001');
    expect(screen.getByLabelText(/camera name/i).value).toBe('Front Entrance Camera');
  });

  it('has a cancel button that resets the form', () => {
    render(
      <BrowserRouter>
        <AddNewCamera />
      </BrowserRouter>
    );
    
    // Fill in a form field
    fireEvent.change(screen.getByLabelText(/camera id/i), { 
      target: { value: 'CAM001' } 
    });
    
    // Click the cancel/reset button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Form should be reset
    expect(screen.getByLabelText(/camera id/i).value).toBe('');
  });
}); 