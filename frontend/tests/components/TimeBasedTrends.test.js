import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeBasedTrends from '../../src/components/Statistics/TimeBasedTrends';

// Mock the LineChart component since it's complex and we're more interested in testing the data preparation
jest.mock('@mantine/charts', () => ({
  LineChart: ({ data, dataKey, series }) => (
    <div data-testid={`line-chart-${dataKey}`}>
      <div data-testid={`chart-data-${dataKey}`}>{JSON.stringify(data)}</div>
      <div data-testid={`chart-series-${dataKey}`}>{JSON.stringify(series)}</div>
    </div>
  )
}));

describe('TimeBasedTrends Component', () => {
  const mockTrends = {
    monthlyTrends: [
      { date: '2023-01', count: 15 },
      { date: '2023-02', count: 22 },
      { date: '2023-03', count: 18 }
    ],
    weeklyTrends: [
      { week: '2023-01', count: 5 },
      { week: '2023-02', count: 8 },
      { week: '2023-03', count: 6 },
      { week: '2023-04', count: 9 }
    ],
    hourlyTrends: [
      { hour: '8', count: 3 },
      { hour: '12', count: 7 },
      { hour: '17', count: 12 },
      { hour: '22', count: 4 }
    ]
  };

  it('renders all three trend sections', () => {
    render(<TimeBasedTrends trends={mockTrends} />);
    
    // Check that all section titles are rendered
    expect(screen.getByText('Monthly Accident Trends')).toBeInTheDocument();
    expect(screen.getByText('Weekly Accident Trends')).toBeInTheDocument();
    expect(screen.getByText('Time of Day Analysis')).toBeInTheDocument();
    
    // Check that all three charts are rendered
    expect(screen.getByTestId('line-chart-month')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-week')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-hour')).toBeInTheDocument();
  });

  it('formats monthly data correctly', () => {
    render(<TimeBasedTrends trends={mockTrends} />);
    
    // Get the monthly chart data
    const chartData = screen.getByTestId('chart-data-month').textContent;
    const data = JSON.parse(chartData);
    
    // Check data formatting
    expect(data.length).toBe(3);
    expect(data[0].month).toBe('Jan 2023');
    expect(data[0].accidents).toBe(15);
    expect(data[1].month).toBe('Feb 2023');
    expect(data[1].accidents).toBe(22);
    expect(data[2].month).toBe('Mar 2023');
    expect(data[2].accidents).toBe(18);
    
    // Check series configuration
    const seriesData = screen.getByTestId('chart-series-month').textContent;
    const series = JSON.parse(seriesData);
    expect(series[0].name).toBe('accidents');
    expect(series[0].color).toBe('blue.6');
  });

  it('formats weekly data correctly', () => {
    render(<TimeBasedTrends trends={mockTrends} />);
    
    // Get the weekly chart data
    const chartData = screen.getByTestId('chart-data-week').textContent;
    const data = JSON.parse(chartData);
    
    // Check data formatting
    expect(data.length).toBe(4);
    expect(data[0].week).toBe('Week 1');
    expect(data[0].accidents).toBe(5);
    expect(data[1].week).toBe('Week 2');
    expect(data[1].accidents).toBe(8);
    expect(data[2].week).toBe('Week 3');
    expect(data[2].accidents).toBe(6);
    expect(data[3].week).toBe('Week 4');
    expect(data[3].accidents).toBe(9);
    
    // Check series configuration
    const seriesData = screen.getByTestId('chart-series-week').textContent;
    const series = JSON.parse(seriesData);
    expect(series[0].name).toBe('accidents');
    expect(series[0].color).toBe('violet.6');
  });

  it('formats hourly data correctly', () => {
    render(<TimeBasedTrends trends={mockTrends} />);
    
    // Get the hourly chart data
    const chartData = screen.getByTestId('chart-data-hour').textContent;
    const data = JSON.parse(chartData);
    
    // Check data formatting
    expect(data.length).toBe(4);
    expect(data[0].hour).toBe('8:00');
    expect(data[0].accidents).toBe(3);
    expect(data[1].hour).toBe('12:00');
    expect(data[1].accidents).toBe(7);
    expect(data[2].hour).toBe('17:00');
    expect(data[2].accidents).toBe(12);
    expect(data[3].hour).toBe('22:00');
    expect(data[3].accidents).toBe(4);
    
    // Check series configuration
    const seriesData = screen.getByTestId('chart-series-hour').textContent;
    const series = JSON.parse(seriesData);
    expect(series[0].name).toBe('accidents');
    expect(series[0].color).toBe('teal.6');
  });

  it('handles empty data gracefully', () => {
    const emptyTrends = {
      monthlyTrends: [],
      weeklyTrends: [],
      hourlyTrends: []
    };
    
    render(<TimeBasedTrends trends={emptyTrends} />);
    
    // Charts should still render with empty data
    expect(screen.getByTestId('line-chart-month')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-week')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-hour')).toBeInTheDocument();
    
    // Check that empty arrays are passed to the charts
    const monthlyData = screen.getByTestId('chart-data-month').textContent;
    expect(JSON.parse(monthlyData)).toEqual([]);
    
    const weeklyData = screen.getByTestId('chart-data-week').textContent;
    expect(JSON.parse(weeklyData)).toEqual([]);
    
    const hourlyData = screen.getByTestId('chart-data-hour').textContent;
    expect(JSON.parse(hourlyData)).toEqual([]);
  });
}); 