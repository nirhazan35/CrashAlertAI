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
  const mockData = {
    accidentCount: [
      { date: '2024-03-01', count: 5 },
      { date: '2024-03-02', count: 8 },
      { date: '2024-03-03', count: 3 }
    ],
    severityDistribution: [
      { date: '2024-03-01', high: 2, medium: 2, low: 1 },
      { date: '2024-03-02', high: 3, medium: 4, low: 1 },
      { date: '2024-03-03', high: 1, medium: 1, low: 1 }
    ]
  };

  test('renders time-based trends with correct title', () => {
    renderWithMantine(<TimeBasedTrends data={mockData} />);
    expect(screen.getByText(/time-based trends/i)).toBeInTheDocument();
  });

  test('displays accident count chart', () => {
    renderWithMantine(<TimeBasedTrends data={mockData} />);
    const chart = screen.getByTestId('line-chart-accidentCount');
    expect(chart).toBeInTheDocument();
    
    const chartData = screen.getByTestId('chart-data-accidentCount');
    expect(JSON.parse(chartData.textContent)).toEqual(mockData.accidentCount);
  });

  test('displays severity distribution chart', () => {
    renderWithMantine(<TimeBasedTrends data={mockData} />);
    const chart = screen.getByTestId('line-chart-severityDistribution');
    expect(chart).toBeInTheDocument();
    
    const chartData = screen.getByTestId('chart-data-severityDistribution');
    expect(JSON.parse(chartData.textContent)).toEqual(mockData.severityDistribution);
  });

  test('handles time range changes', () => {
    const onTimeRangeChange = jest.fn();
    renderWithMantine(
      <TimeBasedTrends 
        data={mockData} 
        onTimeRangeChange={onTimeRangeChange}
      />
    );
    
    const weekButton = screen.getByText('Week');
    fireEvent.click(weekButton);
    
    expect(onTimeRangeChange).toHaveBeenCalledWith('week');
  });

  test('handles empty data gracefully', () => {
    renderWithMantine(<TimeBasedTrends data={{ accidentCount: [], severityDistribution: [] }} />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });
}); 