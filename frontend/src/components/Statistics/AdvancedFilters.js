import React from 'react';
import {
  Text,
  Group,
  Stack,
  ActionIcon,
  Divider,
  Box,
  Select,
  MultiSelect,
  Button
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';

const AdvancedFilters = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange,
  onAdvancedFiltersChange,
  availableLocations = [],
  availableCameras = []
}) => {
  // Update a single filter field
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Reset all filters to default values
  const handleClear = () => {
    const clearedFilters = {
      startDate: null,
      endDate: null,
      startTime: '',
      endTime: '',
      locations: [],
      cameras: [],
      severityLevels: []
    };
    onFiltersChange(clearedFilters);
    onAdvancedFiltersChange(clearedFilters);
  };

  // Apply current filter values and close popover
  const handleApplyFilters = () => {
    onAdvancedFiltersChange(filters);
    onClose();
  };

  return (
    <Stack spacing="md" p="md" style={{ minWidth: 300 }}>
      <Group position="apart" mb="xs">
        <Text weight={500}>Advanced Filters</Text>
        <ActionIcon onClick={onClose} variant="subtle" color="gray">
          <IconX size={16} />
        </ActionIcon>
      </Group>
      
      <Divider />

      {/* Date Range */}
      <Stack spacing="xs">
        <Text size="sm" weight={500}>Date Range</Text>
        <Group grow>
          <Box>
            <Text size="xs" mb={4}>Start Date</Text>
            <input
              type="date"
              className="native-date-input"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
            />
          </Box>
          <Box>
            <Text size="xs" mb={4}>End Date</Text>
            <input
              type="date"
              className="native-date-input"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
            />
          </Box>
        </Group>
      </Stack>

      {/* Time Range */}
      <Stack spacing="xs">
        <Text size="sm" weight={500}>Time Range</Text>
        <Group grow>
          <Select
            size="xs"
            label="Start Time"
            placeholder="Select time"
            data={Array.from({ length: 24 }, (_, i) => ({
              value: `${i.toString().padStart(2, '0')}:00`,
              label: `${i.toString().padStart(2, '0')}:00`
            }))}
            value={filters.startTime}
            onChange={(value) => handleFilterChange('startTime', value)}
            clearable
          />
          <Select
            size="xs"
            label="End Time"
            placeholder="Select time"
            data={Array.from({ length: 24 }, (_, i) => ({
              value: `${i.toString().padStart(2, '0')}:00`,
              label: `${i.toString().padStart(2, '0')}:00`
            }))}
            value={filters.endTime}
            onChange={(value) => handleFilterChange('endTime', value)}
            clearable
          />
        </Group>
      </Stack>

      {/* Locations */}
      <Stack spacing="xs">
        <Text size="sm" weight={500}>Locations</Text>
        <MultiSelect
          size="xs"
          data={availableLocations}
          placeholder="Select locations"
          value={filters.locations}
          onChange={(value) => handleFilterChange('locations', value)}
          searchable
          clearable
        />
      </Stack>

      {/* Cameras */}
      <Stack spacing="xs">
        <Text size="sm" weight={500}>Cameras</Text>
        <MultiSelect
          size="xs"
          data={availableCameras}
          placeholder="Select cameras"
          value={filters.cameras}
          onChange={(value) => handleFilterChange('cameras', value)}
          searchable
          clearable
        />
      </Stack>

      {/* Severity */}
      <Stack spacing="xs">
        <Text size="sm" weight={500}>Severity</Text>
        <MultiSelect
          size="xs"
          data={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]}
          placeholder="Select severity levels"
          value={filters.severityLevels || []}
          onChange={(value) => handleFilterChange('severityLevels', value)}
          clearable
        />
      </Stack>

      <Group position="right" mt="md">
        <Button variant="outline" size="xs" onClick={handleClear}>
          Clear
        </Button>
        <Button size="xs" onClick={handleApplyFilters}>
          Apply
        </Button>
      </Group>
    </Stack>
  );
};

export default AdvancedFilters; 