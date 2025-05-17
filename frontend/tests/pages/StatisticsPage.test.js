import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import StatisticsPage from '../../src/pages/StatisticsPage/StatisticsPage';
import { useAuth } from '../../src/authentication/AuthProvider';
import * as statisticsService from '../../src/services/statisticsService';

// Mock the modules
jest.mock('../../src/authentication/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/services/statisticsService', () => ({
  fetchStatisticsData: jest.fn(),
  getChartOptions: jest.fn(),
}));

// Mock charts components
jest.mock('react-apexcharts', () => {
  return function MockChart({ options, series, type, height }) {
    return (
      <div data-testid={`chart-${type}`} className="mock-chart">
        <div>Chart Type: {type}</div>
        <div>Series Count: {series.length}</div>
        <div>Height: {height}</div>
      </div>
    );
  };
});

describe('StatisticsPage Component', () => {
  const mockUser = { token: 'mock-token' };
  const mockStatisticsData = {
    accidentsByLocation: [
      { location: 'Main Street', count: 12 },
      { location: 'Downtown', count: 8 },
      { location: 'Highway', count: 15 }
    ],
    accidentsBySeverity: [
      { severity: 'Low', count: 10 },
      { severity: 'Medium', count: 18 },
      { severity: 'High', count: 7 }
    ],
    accidentsByTime: [
      { hour: '00:00', count: 2 },
      { hour: '06:00', count: 5 },
      { hour: '12:00', count: 10 },
      { hour: '18:00', count: 8 }
    ],
    trendData: [
      { date: '2023-01-01', count: 3 },
      { date: '2023-01-02', count: 5 },
      { date: '2023-01-03', count: 2 },
      { date: '2023-01-04', count: 7 }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    statisticsService.fetchStatisticsData.mockResolvedValue(mockStatisticsData);
    statisticsService.getChartOptions.mockImplementation((type) => ({
      chart: { id: `${type}-chart` },
      labels: ['Label 1', 'Label 2', 'Label 3']
    }));
  });

  it('renders loading state initially', async () => {
    render(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/loading statistics/i)).toBeInTheDocument();
  });

  it('fetches and displays statistics data', async () => {
    render(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );
    
    // Verify service was called with correct parameters
    await waitFor(() => {
      expect(statisticsService.fetchStatisticsData).toHaveBeenCalledWith(
        mockUser.token,
        expect.any(Object) // Date filter params
      );
    });
    
    // Check that loading is no longer displayed
    await waitFor(() => {
      expect(screen.queryByText(/loading statistics/i)).not.toBeInTheDocument();
    });
    
    // Check that charts are rendered
    expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    expect(screen.getByTestId('chart-pie')).toBeInTheDocument();
    expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    
    // Check that statistics titles are displayed
    expect(screen.getByText(/accidents by location/i)).toBeInTheDocument();
    expect(screen.getByText(/accidents by severity/i)).toBeInTheDocument();
    expect(screen.getByText(/accidents by time of day/i)).toBeInTheDocument();
    expect(screen.getByText(/accident trends/i)).toBeInTheDocument();
  });

  it('handles date filter changes', async () => {
    render(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText(/loading statistics/i)).not.toBeInTheDocument();
    });
    
    // Reset mock call counts
    statisticsService.fetchStatisticsData.mockClear();
    
    // Find and interact with date filters
    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    
    const endDateInput = screen.getByLabelText(/end date/i);
    fireEvent.change(endDateInput, { target: { value: '2023-01-31' } });
    
    // Find and click apply filters button
    const applyButton = screen.getByText(/apply filters/i);
    fireEvent.click(applyButton);
    
    // Verify service was called again with updated date range
    await waitFor(() => {
      expect(statisticsService.fetchStatisticsData).toHaveBeenCalledWith(
        mockUser.token,
        expect.objectContaining({
          startDate: '2023-01-01',
          endDate: '2023-01-31'
        })
      );
    });
  });

  it('handles preset date range selections', async () => {
    render(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText(/loading statistics/i)).not.toBeInTheDocument();
    });
    
    // Reset mock call counts
    statisticsService.fetchStatisticsData.mockClear();
    
    // Find and click on preset ranges
    const lastWeekButton = screen.getByText(/last 7 days/i);
    fireEvent.click(lastWeekButton);
    
    // Verify service was called with correct date range
    await waitFor(() => {
      expect(statisticsService.fetchStatisticsData).toHaveBeenCalledWith(
        mockUser.token,
        expect.objectContaining({
          startDate: expect.any(String),
          endDate: expect.any(String)
        })
      );
    });
    
    // Now try another preset
    statisticsService.fetchStatisticsData.mockClear();
    
    const lastMonthButton = screen.getByText(/last 30 days/i);
    fireEvent.click(lastMonthButton);
    
    await waitFor(() => {
      expect(statisticsService.fetchStatisticsData).toHaveBeenCalledWith(
        mockUser.token,
        expect.objectContaining({
          startDate: expect.any(String),
          endDate: expect.any(String)
        })
      );
    });
  });

  it('handles fetch errors gracefully', async () => {
    // Mock a failed fetch
    statisticsService.fetchStatisticsData.mockRejectedValueOnce(new Error('Failed to fetch statistics'));
    
    render(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/error loading statistics data/i)).toBeInTheDocument();
    });
    
    // Check for retry button
    const retryButton = screen.getByText(/retry/i);
    expect(retryButton).toBeInTheDocument();
    
    // Reset mock and click retry
    statisticsService.fetchStatisticsData.mockResolvedValueOnce(mockStatisticsData);
    fireEvent.click(retryButton);
    
    // Should call the service again
    await waitFor(() => {
      expect(statisticsService.fetchStatisticsData).toHaveBeenCalledTimes(2);
    });
    
    // Should display data after retry
    await waitFor(() => {
      expect(screen.queryByText(/error loading statistics data/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    });
  });

  it('allows exporting statistics data', async () => {
    // Mock export function
    const mockExportStats = jest.fn();
    statisticsService.exportStatisticsToCSV = mockExportStats;
    
    render(
      <BrowserRouter>
        <StatisticsPage />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading statistics/i)).not.toBeInTheDocument();
    });
    
    // Find and click export button
    const exportButton = screen.getByText(/export data/i);
    fireEvent.click(exportButton);
    
    // Check if export function was called with correct data
    expect(mockExportStats).toHaveBeenCalledWith(mockStatisticsData);
  });
}); 