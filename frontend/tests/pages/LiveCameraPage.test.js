import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import LiveCameraFeed from '../../src/pages/LiveCameraPage/LiveCameraPage';
import { AuthProvider } from '../../src/authentication/AuthProvider';

// Mock the modules
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(() => ({
    user: { token: 'mock-token' },
  })),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

// Mock fetch
global.fetch = jest.fn();

const mockCameras = [
  {
    cameraId: 'CAM001',
    location: 'Main Entrance',
    date: new Date().toISOString(),
    activeAccidents: [],
    accidentHistory: []
  },
  {
    cameraId: 'CAM002',
    location: 'Parking Lot',
    date: new Date().toISOString(),
    activeAccidents: [{ id: 1 }],
    accidentHistory: [{ timestamp: new Date().toISOString() }]
  },
  {
    cameraId: 'CAM005', // Will be set to maintenance status
    location: 'Loading Dock',
    date: new Date().toISOString(),
    activeAccidents: [],
    accidentHistory: []
  },
  {
    cameraId: 'CAM007', // Will be set to offline status
    location: 'Back Entrance',
    date: new Date().toISOString(),
    activeAccidents: [],
    accidentHistory: []
  }
];

describe('LiveCameraPage Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Mock the fetch response
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockCameras,
    });
  });

  it('renders the loading state initially', async () => {
    render(
      <BrowserRouter>
        <LiveCameraFeed />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('fetches and displays cameras', async () => {
    render(
      <BrowserRouter>
        <LiveCameraFeed />
      </BrowserRouter>
    );
    
    // Wait for API call to be made
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    
    // Verify the API call parameters
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_URL_BACKEND}/cameras/get-cameras`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });

    // Check that cameras are displayed
    await waitFor(() => {
      expect(screen.getByText(/Camera CAM001/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Camera CAM002/i)).toBeInTheDocument();
    });
  });

  it('switches between grid and list view modes', async () => {
    render(
      <BrowserRouter>
        <LiveCameraFeed />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Initial mode should be grid
    expect(screen.getByTestId('camera-grid')).toBeInTheDocument();
    
    // Find and click the list view button
    const listViewButton = screen.getByTestId('list-view-button');
    fireEvent.click(listViewButton);
    
    // Should switch to list view
    expect(screen.getByTestId('camera-list')).toBeInTheDocument();
    
    // Find and click the grid view button
    const gridViewButton = screen.getByTestId('grid-view-button');
    fireEvent.click(gridViewButton);
    
    // Should switch back to grid view
    expect(screen.getByTestId('camera-grid')).toBeInTheDocument();
  });

  it('filters cameras by location', async () => {
    render(
      <BrowserRouter>
        <LiveCameraFeed />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByTestId('filter-button');
    fireEvent.click(filterButton);
    
    // Select a location filter
    const locationSelect = screen.getByTestId('location-filter');
    fireEvent.change(locationSelect, { target: { value: 'Parking Lot' } });
    
    // Apply filters
    const applyButton = screen.getByTestId('apply-filters');
    fireEvent.click(applyButton);
    
    // Should only show cameras from that location
    expect(screen.getByText(/Camera CAM002/i)).toBeInTheDocument();
    expect(screen.queryByText(/Camera CAM001/i)).not.toBeInTheDocument();
  });

  it('filters cameras by status', async () => {
    render(
      <BrowserRouter>
        <LiveCameraFeed />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByTestId('filter-button');
    fireEvent.click(filterButton);
    
    // Select a status filter
    const statusSelect = screen.getByTestId('status-filter');
    fireEvent.change(statusSelect, { target: { value: 'maintenance' } });
    
    // Apply filters
    const applyButton = screen.getByTestId('apply-filters');
    fireEvent.click(applyButton);
    
    // Should only show maintenance cameras
    expect(screen.getByText(/Camera CAM005/i)).toBeInTheDocument();
    expect(screen.queryByText(/Camera CAM001/i)).not.toBeInTheDocument();
  });

  it('resets filters properly', async () => {
    render(
      <BrowserRouter>
        <LiveCameraFeed />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Open filters
    const filterButton = screen.getByTestId('filter-button');
    fireEvent.click(filterButton);
    
    // Apply some filters
    const locationSelect = screen.getByTestId('location-filter');
    fireEvent.change(locationSelect, { target: { value: 'Parking Lot' } });
    
    const applyButton = screen.getByTestId('apply-filters');
    fireEvent.click(applyButton);
    
    // Should only show filtered cameras
    expect(screen.queryByText(/Camera CAM001/i)).not.toBeInTheDocument();
    
    // Open filters again
    fireEvent.click(filterButton);
    
    // Reset filters
    const resetButton = screen.getByTestId('reset-filters');
    fireEvent.click(resetButton);
    
    // Close filter panel
    fireEvent.click(applyButton);
    
    // All cameras should be visible again
    expect(screen.getByText(/Camera CAM001/i)).toBeInTheDocument();
    expect(screen.getByText(/Camera CAM002/i)).toBeInTheDocument();
  });

  it('handles camera expansion', async () => {
    render(
      <BrowserRouter>
        <LiveCameraFeed />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Find and click the expand button for a camera
    const expandButton = screen.getAllByTestId('expand-camera')[0];
    fireEvent.click(expandButton);
    
    // A modal should appear with the expanded camera
    expect(screen.getByTestId('expanded-camera-modal')).toBeInTheDocument();
    
    // Close the modal
    const closeButton = screen.getByTestId('close-expanded-camera');
    fireEvent.click(closeButton);
    
    // Modal should be gone
    await waitFor(() => {
      expect(screen.queryByTestId('expanded-camera-modal')).not.toBeInTheDocument();
    });
  });

  it('handles refresh functionality', async () => {
    render(
      <BrowserRouter>
        <LiveCameraFeed />
      </BrowserRouter>
    );
    
    // Wait for first data load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Clear the mock calls from initial load
    fetch.mockClear();
    
    // Find and click the refresh button
    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);
    
    // Should show loading again briefly
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Should have made another API call
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // Wait for loading to finish again
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    // Mock a fetch error for this test
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <LiveCameraFeed />
      </BrowserRouter>
    );
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to load camera data/i)).toBeInTheDocument();
    });
  });
}); 