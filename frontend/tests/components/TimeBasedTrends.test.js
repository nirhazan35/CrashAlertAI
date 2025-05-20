import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeBasedTrends from '../../src/components/Statistics/TimeBasedTrends';
import { renderWithMantine } from '../utils/test-utils';

// Mock Mantine components
jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
  Paper: ({ children, ...props }) => <div data-testid="mantine-paper" {...props}>{children}</div>,
  Title: ({ children, ...props }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }) => <div {...props}>{children}</div>,
  Group: ({ children, ...props }) => <div {...props}>{children}</div>,
  Stack: ({ children, ...props }) => <div {...props}>{children}</div>,
  SegmentedControl: ({ data, value, onChange, ...props }) => (
    <div {...props}>
      {data.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          data-selected={value === item.value}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}));

// Mock the LineChart component
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
      { date: '2024-03', count: 5 },
      { date: '2024-02', count: 8 },
      { date: '2024-01', count: 3 }
    ],
    weeklyTrends: [
      { week: '2024-W10', count: 2 },
      { week: '2024-W09', count: 4 },
      { week: '2024-W08', count: 1 }
    ],
    hourlyTrends: [
      { hour: '00', count: 1 },
      { hour: '01', count: 2 },
      { hour: '02', count: 3 }
    ]
  };

  test('renders time-based trends with correct title', () => {
    renderWithMantine(<TimeBasedTrends trends={mockTrends} />);
    expect(screen.getByText('Monthly Accident Trends')).toBeInTheDocument();
    expect(screen.getByText('Weekly Accident Trends')).toBeInTheDocument();
    expect(screen.getByText('Time of Day Analysis')).toBeInTheDocument();
  });

  test('displays monthly trends chart', () => {
    renderWithMantine(<TimeBasedTrends trends={mockTrends} />);
    const chart = screen.getByTestId('line-chart-month');
    expect(chart).toBeInTheDocument();
    
    const chartData = screen.getByTestId('chart-data-month');
    expect(JSON.parse(chartData.textContent)).toEqual(
      mockTrends.monthlyTrends.map(item => ({
        month: expect.any(String),
        accidents: item.count
      }))
    );
  });

  test('displays weekly trends chart', () => {
    renderWithMantine(<TimeBasedTrends trends={mockTrends} />);
    const chart = screen.getByTestId('line-chart-week');
    expect(chart).toBeInTheDocument();
    
    const chartData = screen.getByTestId('chart-data-week');
    expect(JSON.parse(chartData.textContent)).toEqual(
      mockTrends.weeklyTrends.map(item => ({
        week: expect.any(String),
        accidents: item.count
      }))
    );
  });

  test('displays hourly trends chart', () => {
    renderWithMantine(<TimeBasedTrends trends={mockTrends} />);
    const chart = screen.getByTestId('line-chart-hour');
    expect(chart).toBeInTheDocument();
    
    const chartData = screen.getByTestId('chart-data-hour');
    expect(JSON.parse(chartData.textContent)).toEqual(
      mockTrends.hourlyTrends.map(item => ({
        hour: expect.any(String),
        accidents: item.count
      }))
    );
  });

  test('handles empty data gracefully', () => {
    renderWithMantine(
      <TimeBasedTrends 
        trends={{
          monthlyTrends: [],
          weeklyTrends: [],
          hourlyTrends: []
        }} 
      />
    );
    expect(screen.getByText('Monthly Accident Trends')).toBeInTheDocument();
    expect(screen.getByText('Weekly Accident Trends')).toBeInTheDocument();
    expect(screen.getByText('Time of Day Analysis')).toBeInTheDocument();
  });
}); 