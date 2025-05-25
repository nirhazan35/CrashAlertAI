import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CoreStatistics from '../../src/components/Statistics/CoreStatistics';
import { renderWithMantine } from '../utils/test-utils';

// Mock AdvancedFilters component to simplify testing
jest.mock('../../src/components/Statistics/AdvancedFilters', () => {
  const MockAdvancedFilters = ({ 
    onClose, 
    filters, 
    onFiltersChange, 
    onAdvancedFiltersChange 
  }) => {
    return (
      <div data-testid="advanced-filters">
        <button 
          data-testid="apply-filters" 
          onClick={() => {
            const newFilters = { ...filters, locations: ['Main Street'] };
            onFiltersChange(newFilters);
            onAdvancedFiltersChange(newFilters);
            onClose();
          }}
        >
          Apply Filters
        </button>
        <button data-testid="close-filters" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };
  
  // Make sure to return the component function
  return MockAdvancedFilters;
});

describe('CoreStatistics Component', () => {
  const mockStatistics = {
    totalHandled: 125,
    falsePositiveRate: 15.3,
    severityDistribution: {
      low: { count: 45, percentage: '36.0' },
      medium: { count: 62, percentage: '49.6' },
      high: { count: 18, percentage: '14.4' }
    },
    top5Locations: [
      { location: 'Main Street', count: 32 },
      { location: 'Downtown', count: 27 },
      { location: 'Highway 101', count: 21 },
      { location: 'Central Park', count: 18 },
      { location: 'Market Street', count: 15 }
    ],
    mostActiveResponders: [
      { responder: 'John Smith', count: 42 },
      { responder: 'Emily Johnson', count: 36 },
      { responder: 'Michael Brown', count: 28 },
      { responder: 'Sarah Davis', count: 19 }
    ]
  };

  const mockLocations = ['Main Street', 'Downtown', 'Highway 101', 'Central Park', 'Market Street'];
  const mockCameras = ['CAM001', 'CAM002', 'CAM003', 'CAM004', 'CAM005'];
  const mockUserNames = ['John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis'];

  const mockHandleTimeFilterChange = jest.fn();
  const mockHandleAdvancedFiltersChange = jest.fn();

  it('renders all statistics cards correctly', () => {
    renderWithMantine(
      <CoreStatistics 
        statistics={mockStatistics}
        availableLocations={mockLocations}
        availableCameras={mockCameras}
        availableUserNames={mockUserNames}
        onTimeFilterChange={mockHandleTimeFilterChange}
        onAdvancedFiltersChange={mockHandleAdvancedFiltersChange}
      />
    );
    
    // Check main stat cards are rendered
    expect(screen.getByText('Total Handled Accidents')).toBeInTheDocument();
    expect(screen.getByText('125')).toBeInTheDocument();
    
    expect(screen.getByText('False Positive Rate')).toBeInTheDocument();
    expect(screen.getByText('15.3%')).toBeInTheDocument();
    
    expect(screen.getByText('Active Responders')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // Check severity distribution
    expect(screen.getByText('Severity Distribution')).toBeInTheDocument();
    expect(screen.getByText('low', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('36.0%')).toBeInTheDocument();
    
    expect(screen.getByText('medium', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('62')).toBeInTheDocument();
    expect(screen.getByText('49.6%')).toBeInTheDocument();
    
    // Use a more specific selector for high severity
    const highSeverityText = screen.getByText('high', { selector: '[transform="capitalize"]' });
    expect(highSeverityText).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('14.4%')).toBeInTheDocument();
    
    // Check top locations and responders
    expect(screen.getByText('Top Locations')).toBeInTheDocument();
    expect(screen.getByText('Main Street')).toBeInTheDocument();
    expect(screen.getByText('32 accidents', { exact: false })).toBeInTheDocument();
    
    expect(screen.getByText('Top Responders')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('42 accidents', { exact: false })).toBeInTheDocument();
  });

  it('handles time filter changes', () => {
    renderWithMantine(
      <CoreStatistics 
        statistics={mockStatistics}
        timeFilter="all"
        onTimeFilterChange={mockHandleTimeFilterChange}
        onAdvancedFiltersChange={mockHandleAdvancedFiltersChange}
      />
    );
    
    // Find the day filter option and click it
    const dayFilterOption = screen.getByText('Day');
    fireEvent.click(dayFilterOption);
    
    // Check if the callback was called with the right value
    expect(mockHandleTimeFilterChange).toHaveBeenCalledWith('day');
  });

  it('opens and closes advanced filters popover', async () => {
    renderWithMantine(
      <CoreStatistics 
        statistics={mockStatistics}
        onTimeFilterChange={mockHandleTimeFilterChange}
        onAdvancedFiltersChange={mockHandleAdvancedFiltersChange}
      />
    );
    
    // Advanced filters button should be visible
    const advancedFiltersButton = screen.getByText('Advanced Filters');
    expect(advancedFiltersButton).toBeInTheDocument();
    
    // Click to open filters
    fireEvent.click(advancedFiltersButton);
    
    // Wait for the popover content to appear
    await waitFor(() => {
      expect(screen.getByTestId('advanced-filters')).toBeInTheDocument();
    });
    
    // Click close button to close filters
    const closeButton = screen.getByTestId('close-filters');
    fireEvent.click(closeButton);
    
    // Advanced filters should be closed now, but the button should still be there
    await waitFor(() => {
      expect(screen.queryByTestId('advanced-filters')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
  });

  it('applies advanced filters', async () => {
    renderWithMantine(
      <CoreStatistics 
        statistics={mockStatistics}
        onTimeFilterChange={mockHandleTimeFilterChange}
        onAdvancedFiltersChange={mockHandleAdvancedFiltersChange}
      />
    );
    
    // Open advanced filters
    const advancedFiltersButton = screen.getByText('Advanced Filters');
    fireEvent.click(advancedFiltersButton);
    
    // Wait for the popover content to appear
    await waitFor(() => {
      expect(screen.getByTestId('advanced-filters')).toBeInTheDocument();
    });
    
    // Click apply filters button
    const applyButton = screen.getByTestId('apply-filters');
    fireEvent.click(applyButton);
    
    // Check if the callback was called with the right filters
    expect(mockHandleAdvancedFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        locations: ['Main Street']
      })
    );
    
    // Popover should be closed after applying
    await waitFor(() => {
      expect(screen.queryByTestId('advanced-filters')).not.toBeInTheDocument();
    });
  });

  it('handles empty statistics gracefully', () => {
    renderWithMantine(
      <CoreStatistics 
        onTimeFilterChange={mockHandleTimeFilterChange}
        onAdvancedFiltersChange={mockHandleAdvancedFiltersChange}
      />
    );
    
    // Even with no statistics, cards should render with default values
    expect(screen.getByText('Total Handled Accidents')).toBeInTheDocument();
    expect(screen.getAllByText('0')[0]).toBeInTheDocument();
    
    expect(screen.getByText('False Positive Rate')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    
    expect(screen.getByText('Active Responders')).toBeInTheDocument();
    expect(screen.getAllByText('0')[1]).toBeInTheDocument();
  });
});
