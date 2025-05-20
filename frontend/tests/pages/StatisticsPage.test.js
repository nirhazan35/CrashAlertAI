import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import StatisticsPage from '../../src/pages/StatisticsPage/StatisticsPage';
import { useAuth } from '../../src/authentication/AuthProvider';
import * as statisticsService from '../../src/services/statisticsService';
import { renderWithMantine } from '../utils/test-utils';

// Mock the modules
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../src/services/statisticsService', () => ({
  fetchHandledAccidents: jest.fn(),
  fetchCamerasLocations: jest.fn(),
  fetchUsers: jest.fn(),
  calculateCoreStatistics: jest.fn(),
  calculateTimeBasedTrends: jest.fn(),
  calculateFalsePositiveTrends: jest.fn(),
  exportStatisticsToCSV: jest.fn()
}));

// Mock the child components
jest.mock('../../src/components/Statistics/CoreStatistics', () => {
  return function MockCoreStatistics({ statistics }) {
    return (
      <div data-testid="core-statistics">
        <div>Total Handled: {statistics.totalHandled}</div>
        <div>False Positive Rate: {statistics.falsePositiveRate}%</div>
      </div>
    );
  };
});

jest.mock('../../src/components/Statistics/TimeBasedTrends', () => {
  return function MockTimeBasedTrends({ trends }) {
    return (
      <div data-testid="time-based-trends">
        <div>Monthly Trends: {trends.monthlyTrends.length}</div>
        <div>Weekly Trends: {trends.weeklyTrends.length}</div>
        <div>Hourly Trends: {trends.hourlyTrends.length}</div>
      </div>
    );
  };
});

jest.mock('../../src/components/Statistics/FalsePositiveTrends', () => {
  return function MockFalsePositiveTrends({ trends }) {
    return (
      <div data-testid="false-positive-trends">
        <div>Location Trends: {trends.locationTrends.length}</div>
        <div>Camera Trends: {trends.cameraTrends.length}</div>
      </div>
    );
  };
});

describe('StatisticsPage Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  const mockHandledAccidents = [
    {
      _id: '1',
      date: '2024-03-01T10:00:00Z',
      location: 'Location1',
      cameraId: 'Camera1',
      severity: 'high',
      assignedTo: 'user1',
      isFalsePositive: false
    },
    {
      _id: '2',
      date: '2024-03-02T15:00:00Z',
      location: 'Location2',
      cameraId: 'Camera2',
      severity: 'medium',
      assignedTo: 'user2',
      isFalsePositive: true
    }
  ];

  const mockUsers = [
    { username: 'user1', role: 'admin' },
    { username: 'user2', role: 'user' }
  ];

  const mockCamerasLocations = [
    { cameraId: 'Camera1', location: 'Location1' },
    { cameraId: 'Camera2', location: 'Location2' }
  ];

  const mockCoreStats = {
    totalHandled: 100,
    falsePositiveRate: 20,
    severityDistribution: { high: 30, medium: 40, low: 30 },
    top5Locations: ['Location1', 'Location2'],
    mostActiveResponders: ['user1', 'user2']
  };

  const mockTimeBasedStats = {
    monthlyTrends: [{ date: '2024-03', count: 10 }],
    weeklyTrends: [{ week: '2024-W10', count: 5 }],
    hourlyTrends: [{ hour: '10', count: 3 }]
  };

  const mockFalsePositiveStats = {
    byLocation: [{ location: 'Location1', count: 5 }],
    byCameraId: [{ cameraId: 'Camera1', count: 3 }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    statisticsService.fetchHandledAccidents.mockResolvedValue(mockHandledAccidents);
    statisticsService.fetchUsers.mockResolvedValue(mockUsers);
    statisticsService.fetchCamerasLocations.mockResolvedValue(mockCamerasLocations);
    statisticsService.calculateCoreStatistics.mockReturnValue(mockCoreStats);
    statisticsService.calculateTimeBasedTrends.mockReturnValue(mockTimeBasedStats);
    statisticsService.calculateFalsePositiveTrends.mockReturnValue(mockFalsePositiveStats);
  });

  test('renders statistics page with all sections', async () => {
    renderWithMantine(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );

    // Check for main sections
    expect(screen.getByTestId('core-statistics')).toBeInTheDocument();
    expect(screen.getByTestId('time-based-trends')).toBeInTheDocument();
    expect(screen.getByTestId('false-positive-trends')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Handled: 100')).toBeInTheDocument();
      expect(screen.getByText('False Positive Rate: 20%')).toBeInTheDocument();
    });
  });

  test('loads and displays accident statistics', async () => {
    renderWithMantine(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(statisticsService.fetchHandledAccidents).toHaveBeenCalledWith(mockUser.token);
      expect(statisticsService.calculateCoreStatistics).toHaveBeenCalled();
      expect(screen.getByText('Total Handled: 100')).toBeInTheDocument();
    });
  });

  test('handles error when loading statistics', async () => {
    statisticsService.fetchHandledAccidents.mockRejectedValueOnce(new Error('Failed to load statistics'));

    renderWithMantine(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load statistics. Please try again.')).toBeInTheDocument();
    });
  });

  test('handles refresh action', async () => {
    renderWithMantine(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText('Total Handled: 100')).toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    // Wait for loading to complete and verify the fetch was called twice
    await waitFor(() => {
      expect(statisticsService.fetchHandledAccidents).toHaveBeenCalledTimes(2);
    }, { timeout: 3000 });
  });
}); 