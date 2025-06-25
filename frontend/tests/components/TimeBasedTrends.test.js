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
      { date: '2024-03-01', count: 5 },
      { date: '2024-02-01', count: 8 },
      { date: '2024-01-01', count: 3 }
    ],
    weeklyTrends: [
      { week: '2024-10', count: 2 },
      { week: '2024-09', count: 4 },
      { week: '2024-08', count: 1 }
    ],
    dailyTrends: [
      { date: '2024-03-01', count: 1 },
      { date: '2024-03-02', count: 2 }
    ],
    hourlyTrends: [
      { hour: 0, count: 1 },
      { hour: 1, count: 2 },
      { hour: 2, count: 3 }
    ]
  };

  test('renders only hourly chart and title when rangeDays is 1', () => {
    renderWithMantine(<TimeBasedTrends trends={mockTrends} rangeDays={1} />);
    expect(screen.getByText('Time-of-Day Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-hour')).toBeInTheDocument();
    expect(screen.queryByText('Monthly Accident Trends')).not.toBeInTheDocument();
    expect(screen.queryByText('Weekly Accident Trends')).not.toBeInTheDocument();
    expect(screen.queryByText('Daily Accident Trends')).not.toBeInTheDocument();
  });

  test('renders daily and hourly charts when rangeDays is 7', () => {
    renderWithMantine(<TimeBasedTrends trends={mockTrends} rangeDays={7} />);
    expect(screen.getByText('Daily Accident Trends')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-day')).toBeInTheDocument();
    expect(screen.getByText('Time-of-Day Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-hour')).toBeInTheDocument();
    expect(screen.queryByText('Monthly Accident Trends')).not.toBeInTheDocument();
    expect(screen.queryByText('Weekly Accident Trends')).not.toBeInTheDocument();
  });

  test('renders weekly, daily, and hourly charts when rangeDays is 14', () => {
    renderWithMantine(<TimeBasedTrends trends={mockTrends} rangeDays={14} />);
    expect(screen.getByText('Weekly Accident Trends')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-week')).toBeInTheDocument();
    expect(screen.getByText('Daily Accident Trends')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-day')).toBeInTheDocument();
    expect(screen.getByText('Time-of-Day Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-hour')).toBeInTheDocument();
    expect(screen.queryByText('Monthly Accident Trends')).not.toBeInTheDocument();
  });

  test('renders monthly, weekly, and hourly charts when rangeDays is 90', () => {
    renderWithMantine(<TimeBasedTrends trends={mockTrends} rangeDays={90} />);
    expect(screen.getByText('Monthly Accident Trends')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-month')).toBeInTheDocument();
    expect(screen.getByText('Weekly Accident Trends')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-week')).toBeInTheDocument();
    expect(screen.getByText('Time-of-Day Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-hour')).toBeInTheDocument();
    expect(screen.queryByText('Daily Accident Trends')).not.toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    renderWithMantine(
      <TimeBasedTrends 
        trends={{
          monthlyTrends: [],
          weeklyTrends: [],
          dailyTrends: [],
          hourlyTrends: []
        }} 
        rangeDays={1}
      />
    );
    expect(screen.getByText('Time-of-Day Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart-hour')).toBeInTheDocument();
  });
}); 