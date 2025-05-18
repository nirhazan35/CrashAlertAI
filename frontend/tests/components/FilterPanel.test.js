import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import FilterPanel from '../../src/components/FilterPanel/FilterPanel';
import { useFilterLogs } from '../../src/components/FilterPanel/useFilterLogs';
import { useCameraData } from '../../src/components/FilterPanel/useCameraData';
import { useAccidentLogs } from '../../src/context/AccidentContext';
import { renderWithMantine } from '../utils/test-utils';

// Mock the required hooks
jest.mock('../../src/context/AccidentContext', () => ({
  useAccidentLogs: jest.fn()
}));

jest.mock('../../src/components/FilterPanel/useFilterLogs', () => ({
  useFilterLogs: jest.fn()
}));

jest.mock('../../src/components/FilterPanel/useCameraData', () => ({
  useCameraData: jest.fn()
}));

describe('FilterPanel Component', () => {
  const mockCameras = ['Camera1', 'Camera2'];
  const mockLocations = ['Location1', 'Location2'];
  const mockAccidentLogs = [
    { id: 1, cameraId: 'Camera1', location: 'Location1' },
    { id: 2, cameraId: 'Camera2', location: 'Location2' }
  ];

  beforeEach(() => {
    useCameraData.mockReturnValue({
      cameras: mockCameras,
      locations: mockLocations
    });

    useAccidentLogs.mockReturnValue({
      accidentLogs: mockAccidentLogs
    });

    useFilterLogs.mockReturnValue({
      filters: {
        cameraId: '',
        location: '',
        severity: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: ''
      },
      setFilters: jest.fn(),
      filteredLogs: mockAccidentLogs,
      applyFilters: jest.fn(),
      clearFilters: jest.fn()
    });
  });

  test('renders all filter inputs', () => {
    renderWithMantine(<FilterPanel />);

    expect(screen.getByRole('combobox', { name: /camera id/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /location/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /severity/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /start date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /end date/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /start time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /end time/i })).toBeInTheDocument();
  });

  test('updates filters when inputs change', () => {
    renderWithMantine(<FilterPanel />);

    const cameraSelect = screen.getByRole('combobox', { name: /camera id/i });
    fireEvent.change(cameraSelect, { target: { value: 'Camera1' } });

    expect(useFilterLogs().setFilters).toHaveBeenCalled();
  });

  test('clears filters when clear button is clicked', () => {
    renderWithMantine(<FilterPanel />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(useFilterLogs().clearFilters).toHaveBeenCalled();
  });

  test('applies filters when apply button is clicked', () => {
    renderWithMantine(<FilterPanel />);

    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);

    expect(useFilterLogs().applyFilters).toHaveBeenCalled();
  });

  test('notifies parent component of filtered logs changes', () => {
    const onFilteredLogsChange = jest.fn();
    renderWithMantine(<FilterPanel onFilteredLogsChange={onFilteredLogsChange} />);

    expect(onFilteredLogsChange).toHaveBeenCalledWith(mockAccidentLogs);
  });
}); 