import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import AdminPage from '../../src/pages/AdminPage/AdminPage';
import { renderWithMantine } from '../utils/test-utils';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('AdminPage Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders admin page with all sections', () => {
    renderWithMantine(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/manage users/i)).toBeInTheDocument();
    expect(screen.getByText(/manage cameras/i)).toBeInTheDocument();
    expect(screen.getByText(/view statistics/i)).toBeInTheDocument();
  });

  test('navigates to manage users page', () => {
    renderWithMantine(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );

    const manageUsersButton = screen.getByText(/manage users/i);
    fireEvent.click(manageUsersButton);
    expect(mockNavigate).toHaveBeenCalledWith('/manage-users');
  });

  test('navigates to manage cameras page', () => {
    renderWithMantine(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );

    const manageCamerasButton = screen.getByText(/manage cameras/i);
    fireEvent.click(manageCamerasButton);
    expect(mockNavigate).toHaveBeenCalledWith('/manage-cameras');
  });

  test('navigates to statistics page', () => {
    renderWithMantine(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    );

    const statisticsButton = screen.getByText(/view statistics/i);
    fireEvent.click(statisticsButton);
    expect(mockNavigate).toHaveBeenCalledWith('/statistics');
  });
}); 