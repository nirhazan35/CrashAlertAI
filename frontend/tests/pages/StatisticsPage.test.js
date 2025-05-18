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
  getAccidentStatistics: jest.fn(),
  getAccidentTrends: jest.fn(),
  getLocationStatistics: jest.fn(),
  getSeverityDistribution: jest.fn()
}));

describe('StatisticsPage Component', () => {
  const mockUser = {
    username: 'testuser',
    role: 'admin',
    token: 'test-token'
  };

  const mockStatistics = {
    totalAccidents: 100,
    handledAccidents: 80,
    pendingAccidents: 20,
    falsePositives: 10
  };

  const mockTrends = [
    { date: '2024-01', count: 10 },
    { date: '2024-02', count: 15 },
    { date: '2024-03', count: 20 }
  ];

  const mockLocationStats = [
    { location: 'Location1', count: 30 },
    { location: 'Location2', count: 40 },
    { location: 'Location3', count: 30 }
  ];

  const mockSeverityStats = [
    { severity: 'low', count: 40 },
    { severity: 'medium', count: 35 },
    { severity: 'high', count: 25 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    statisticsService.getAccidentStatistics.mockResolvedValue(mockStatistics);
    statisticsService.getAccidentTrends.mockResolvedValue(mockTrends);
    statisticsService.getLocationStatistics.mockResolvedValue(mockLocationStats);
    statisticsService.getSeverityDistribution.mockResolvedValue(mockSeverityStats);
  });

  test('renders statistics page with all sections', async () => {
    renderWithMantine(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );

    // Check for main sections
    expect(screen.getByText(/accident statistics/i)).toBeInTheDocument();
    expect(screen.getByText(/accident trends/i)).toBeInTheDocument();
    expect(screen.getByText(/location distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/severity distribution/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // Total accidents
      expect(screen.getByText('80')).toBeInTheDocument(); // Handled accidents
      expect(screen.getByText('20')).toBeInTheDocument(); // Pending accidents
      expect(screen.getByText('10')).toBeInTheDocument(); // False positives
    });
  });

  test('loads and displays accident statistics', async () => {
    renderWithMantine(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(statisticsService.getAccidentStatistics).toHaveBeenCalled();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  test('loads and displays accident trends', async () => {
    renderWithMantine(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(statisticsService.getAccidentTrends).toHaveBeenCalled();
      expect(screen.getByText('2024-01')).toBeInTheDocument();
      expect(screen.getByText('2024-02')).toBeInTheDocument();
      expect(screen.getByText('2024-03')).toBeInTheDocument();
    });
  });

  test('loads and displays location statistics', async () => {
    renderWithMantine(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(statisticsService.getLocationStatistics).toHaveBeenCalled();
      expect(screen.getByText('Location1')).toBeInTheDocument();
      expect(screen.getByText('Location2')).toBeInTheDocument();
      expect(screen.getByText('Location3')).toBeInTheDocument();
    });
  });

  test('loads and displays severity distribution', async () => {
    renderWithMantine(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(statisticsService.getSeverityDistribution).toHaveBeenCalled();
      expect(screen.getByText('low')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
    });
  });

  test('handles error when loading statistics', async () => {
    statisticsService.getAccidentStatistics.mockRejectedValueOnce(new Error('Failed to load statistics'));

    renderWithMantine(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load statistics/i)).toBeInTheDocument();
    });
  });
}); 