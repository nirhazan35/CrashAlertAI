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

    // Check for status badges - use getAllByText since there are multiple instances
    const onlineBadges = screen.getAllByText('ONLINE');
    expect(onlineBadges.length).toBeGreaterThan(0);
    const riskBadges = screen.getAllByText('LOW RISK');
    expect(riskBadges.length).toBeGreaterThan(0);
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

    // Click list view button - using the icon class
    const listButton = screen.getByTestId('list-view-button');
    fireEvent.click(listButton);

    // Verify list view elements
    await waitFor(() => {
      expect(screen.getByText('Camera 1')).toBeInTheDocument();
      expect(screen.getByText('Camera 2')).toBeInTheDocument();
    });

    // Click grid view button - using the icon class
    const gridButton = screen.getByTestId('grid-view-button');
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

    // Click expand button - using the icon class
    const expandButtons = screen.getAllByTestId('expand-camera-button');
    fireEvent.click(expandButtons[0]);

    // Verify expanded view
    await waitFor(() => {
      // Check for modal title specifically
      expect(screen.getByRole('heading', { name: 'Camera 1' })).toBeInTheDocument();
      // Check for modal content
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

    // Verify filter button is active by checking its color prop
    expect(filterButton).toHaveAttribute('data-variant', 'outline');
    expect(filterButton).toHaveStyle({ '--button-color': 'var(--mantine-color-gray-outline)' });
  });

  test('shows status summary badges', async () => {
    renderWithMantine(
      <BrowserRouter>
        <LiveCameraPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check for status badges in the header
      const statusBadges = screen.getAllByText(/online|offline|maintenance/i);
      expect(statusBadges.length).toBeGreaterThan(0);
      
      // Check for specific status counts
      const onlineCount = screen.getByText(/online/i);
      const offlineCount = screen.getByText(/offline/i);
      const maintenanceCount = screen.getByText(/maintenance/i);
      
      expect(onlineCount).toBeInTheDocument();
      expect(offlineCount).toBeInTheDocument();
      expect(maintenanceCount).toBeInTheDocument();
    });
  });
}); 
