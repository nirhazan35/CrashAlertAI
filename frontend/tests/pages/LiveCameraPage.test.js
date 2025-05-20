import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LiveCameraPage from '../../src/pages/LiveCameraPage/LiveCameraPage';
import { useAuth } from '../../src/authentication/AuthProvider';
import { renderWithMantine } from '../utils/test-utils';

// Mock the modules
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

// Mock fetch API
global.fetch = jest.fn();

describe('LiveCameraPage Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  const mockCameras = [
    {
      cameraId: '1',
      location: 'Location1',
      date: '2024-03-01T10:00:00Z',
      activeAccidents: [],
      accidentHistory: []
    },
    {
      cameraId: '2',
      location: 'Location2',
      date: '2024-03-02T15:30:00Z',
      activeAccidents: [{ id: '1' }],
      accidentHistory: [{ id: '1', date: '2024-03-02T15:00:00Z' }]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCameras)
    });
  });

  test('renders live camera page with loading state', () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Live Camera Feeds')).toBeInTheDocument();
    expect(screen.getByText('Loading camera feeds...')).toBeInTheDocument();
  });

  test('loads and displays cameras in grid view', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument();
      expect(screen.getByText('Location1')).toBeInTheDocument();
      expect(screen.getByText('Camera 2')).toBeInTheDocument();
      expect(screen.getByText('Location2')).toBeInTheDocument();
    });

    // Check for status badges
    expect(screen.getByText('ONLINE')).toBeInTheDocument();
    expect(screen.getByText('LOW RISK')).toBeInTheDocument();
  });

  test('toggles between grid and list view', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument();
    });

    // Click list view button
    const listButton = screen.getByRole('button', { name: /list view/i });
    fireEvent.click(listButton);

    // Verify list view elements
    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument();
      expect(screen.getByText('Camera 2')).toBeInTheDocument();
      expect(screen.getByText('Expand')).toBeInTheDocument();
    });

    // Click grid view button
    const gridButton = screen.getByRole('button', { name: /grid view/i });
    fireEvent.click(gridButton);

    // Verify grid view elements
    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument();
      expect(screen.getByText('Camera 2')).toBeInTheDocument();
    });
  });

  test('expands camera view when clicked', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument();
    });

    // Click expand button
    const expandButton = screen.getByRole('button', { name: /expand/i });
    fireEvent.click(expandButton);

    // Verify expanded view
    await waitFor(() => {
      expect(screen.getByText('Camera Feed')).toBeInTheDocument();
      expect(screen.getByText('Camera ID')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Risk Level')).toBeInTheDocument();
      expect(screen.getByText('Last Incident')).toBeInTheDocument();
    });
  });

  test('handles error when loading cameras', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to load cameras'));

    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load camera data. Please try again.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  test('handles refresh action', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('shows and applies filters', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);

    // Verify filter modal
    await waitFor(() => {
      expect(screen.getByText('Filter Cameras')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    // Apply filters
    const applyButton = screen.getByRole('button', { name: /apply filters/i });
    fireEvent.click(applyButton);

    // Verify filter button is active
    expect(filterButton).toHaveClass('active-filter-button');
  });

  test('shows status summary badges', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByText('Offline')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });
  });
}); 
