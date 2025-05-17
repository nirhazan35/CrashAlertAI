import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import AdminPage from '../../src/pages/AdminPage/AdminPage';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('AdminPage Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders the admin page correctly', () => {
    render(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );
    
    // Check if main elements are rendered
    expect(screen.getByText('Welcome, Admin!')).toBeInTheDocument();
    expect(screen.getByText('Manage your system settings and configurations')).toBeInTheDocument();
    
    // Check if all buttons are present
    expect(screen.getByText("Manage User's Cameras")).toBeInTheDocument();
    expect(screen.getByText('Add New Camera')).toBeInTheDocument();
    expect(screen.getByText('Register New User')).toBeInTheDocument();
    expect(screen.getByText('Delete User')).toBeInTheDocument();
  });

  it('navigates to Manage Cameras page when button is clicked', () => {
    render(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );
    
    const manageCamerasButton = screen.getByText("Manage User's Cameras");
    fireEvent.click(manageCamerasButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/manage-cameras');
  });

  it('navigates to Add New Camera page when button is clicked', () => {
    render(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );
    
    const addNewCameraButton = screen.getByText('Add New Camera');
    fireEvent.click(addNewCameraButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/add-new-camera');
  });

  it('navigates to Register New User page when button is clicked', () => {
    render(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );
    
    const registerButton = screen.getByText('Register New User');
    fireEvent.click(registerButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('navigates to Delete User page when button is clicked', () => {
    render(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );
    
    const deleteUserButton = screen.getByText('Delete User');
    fireEvent.click(deleteUserButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/delete-user');
  });
}); 