// src/components/FilterPanel.js
import React, { useEffect } from 'react';
import { useAccidentLogs } from '../../context/AccidentContext';
import { useCameraData } from './useCameraData';
import { useFilterLogs } from './useFilterLogs';
import {
  Button,
  Group,
  Select,
  Text,
  Paper,
  Box,
  Grid,
  useMantineTheme,
} from '@mantine/core';
import {
  IconCamera,
  IconMapPin,
  IconCalendar,
  IconAlertTriangle,
  IconClock,
  IconX,
  IconFilter,
} from '@tabler/icons-react';
import './FilterPanel.css';

// time options for each hour
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0');
  return { value: `${h}:00`, label: `${h}:00` };
});

export default function FilterPanel({
  colSpan = { base: 12, sm: 6, md: 4, lg: 1.7 },
  onFilteredLogsChange,
  initialLogs = [],
}) {
  const theme = useMantineTheme();
  const { cameras, locations } = useCameraData();
  const { accidentLogs } = useAccidentLogs();
  const logsToFilter = initialLogs.length > 0 ? initialLogs : accidentLogs;

  const {
    filters,
    setFilters,
    filteredLogs,
    applyFilters,
    clearFilters,
  } = useFilterLogs(logsToFilter);

  // notify parent on change
  useEffect(() => {
    onFilteredLogsChange?.(filteredLogs);
  }, [filteredLogs, onFilteredLogsChange]);

  const handleChange = (name, value) =>
    setFilters((prev) => ({ ...prev, [name]: value }));

  const cameraOptions = cameras.map((c) => ({ value: c, label: c }));
  const locationOptions = locations.map((l) => ({ value: l, label: l }));

  return (
    <Paper shadow="sm" p="lg" radius="md" mb="xl" className="filter-section">
      <div className="filter-bg-bubble-1" />
      <div className="filter-bg-bubble-2" />
      <div className="filter-content">
        <Grid align="flex-end" gutter="md">
          {/* Camera */}
          <Grid.Col span={colSpan}>
            <Group spacing="xs" mb={6}>
              <Box style={{ color: theme.colors.brand[5] }}>
                <IconCamera size={16} />
              </Box>
              <Text className="filter-label">Camera ID</Text>
            </Group>
            <Select
              placeholder="All"
              data={[{ value: '', label: 'All' }, ...cameraOptions]}
              value={filters.cameraId}
              onChange={(v) => handleChange('cameraId', v)}
              searchable
              clearable
              radius="xl"
              size="md"
              styles={(t) => ({
                input: {
                  border: `1px solid ${t.colors.gray[3]}`,
                  '&:focus': {
                    borderColor: t.colors.brand[5],
                    boxShadow: `0 0 0 3px rgba(59,130,246,0.15)`,
                  },
                },
                item: { borderRadius: '6px' },
              })}
            />
          </Grid.Col>

          {/* Location */}
          <Grid.Col span={colSpan}>
            <Group spacing="xs" mb={6}>
              <Box style={{ color: theme.colors.brand[5] }}>
                <IconMapPin size={16} />
              </Box>
              <Text className="filter-label">Location</Text>
            </Group>
            <Select
              placeholder="All"
              data={[{ value: '', label: 'All' }, ...locationOptions]}
              value={filters.location}
              onChange={(v) => handleChange('location', v)}
              searchable
              clearable
              radius="xl"
              size="md"
              styles={(t) => ({
                input: {
                  border: `1px solid ${t.colors.gray[3]}`,
                  '&:focus': {
                    borderColor: t.colors.brand[5],
                    boxShadow: `0 0 0 3px rgba(59,130,246,0.15)`,
                  },
                },
                item: { borderRadius: '6px' },
              })}
            />
          </Grid.Col>

          {/* Start Date */}
          <Grid.Col span={colSpan}>
            <Group spacing="xs" mb={6}>
              <Box style={{ color: theme.colors.brand[5] }}>
                <IconCalendar size={16} />
              </Box>
              <Text className="filter-label">Start Date</Text>
            </Group>
            <input
              type="date"
              className="native-date-input"
              value={filters.startDate || ''}
              onChange={(e) =>
                handleChange('startDate', e.target.value)
              }
            />
          </Grid.Col>

          {/* End Date */}
          <Grid.Col span={colSpan}>
            <Group spacing="xs" mb={6}>
              <Box style={{ color: theme.colors.brand[5] }}>
                <IconCalendar size={16} />
              </Box>
              <Text className="filter-label">End Date</Text>
            </Group>
            <input
              type="date"
              className="native-date-input"
              value={filters.endDate || ''}
              onChange={(e) =>
                handleChange('endDate', e.target.value)
              }
            />
          </Grid.Col>

          {/* Severity */}
          <Grid.Col span={colSpan}>
            <Group spacing="xs" mb={6}>
              <Box style={{ color: theme.colors.brand[5] }}>
                <IconAlertTriangle size={16} />
              </Box>
              <Text className="filter-label">Severity</Text>
            </Group>
            <Select
              placeholder="All"
              data={[
                { value: '', label: 'All' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              value={filters.severity}
              onChange={(v) => handleChange('severity', v)}
              clearable
              radius="xl"
              size="md"
              styles={(t) => ({
                input: {
                  border: `1px solid ${t.colors.gray[3]}`,
                  '&:focus': {
                    borderColor: t.colors.brand[5],
                    boxShadow: `0 0 0 3px rgba(59,130,246,0.15)`,
                  },
                },
                item: { borderRadius: '6px' },
              })}
            />
          </Grid.Col>

          {/* From Time */}
          <Grid.Col span={colSpan}>
            <Group spacing="xs" mb={6}>
              <Box style={{ color: theme.colors.brand[5] }}>
                <IconClock size={16} />
              </Box>
              <Text className="filter-label">From Time</Text>
            </Group>
            <Select
              placeholder="All"
              data={[{ value: '', label: 'All' }, ...timeOptions]}
              value={filters.startTime}
              onChange={(v) => handleChange('startTime', v)}
              clearable
              radius="xl"
              size="md"
              styles={(t) => ({
                input: {
                  border: `1px solid ${t.colors.gray[3]}`,
                  '&:focus': {
                    borderColor: t.colors.brand[5],
                    boxShadow: `0 0 0 3px rgba(59,130,246,0.15)`,
                  },
                },
                item: { borderRadius: '6px' },
              })}
            />
          </Grid.Col>

          {/* To Time */}
          <Grid.Col span={colSpan}>
            <Group spacing="xs" mb={6}>
              <Box style={{ color: theme.colors.brand[5] }}>
                <IconClock size={16} />
              </Box>
              <Text className="filter-label">To Time</Text>
            </Group>
            <Select
              placeholder="All"
              data={[{ value: '', label: 'All' }, ...timeOptions]}
              value={filters.endTime}
              onChange={(v) => handleChange('endTime', v)}
              clearable
              radius="xl"
              size="md"
              styles={(t) => ({
                input: {
                  border: `1px solid ${t.colors.gray[3]}`,
                  '&:focus': {
                    borderColor: t.colors.brand[5],
                    boxShadow: `0 0 0 3px rgba(59,130,246,0.15)`,
                  },
                },
                item: { borderRadius: '6px' },
              })}
            />
          </Grid.Col>

          {/* Actions */}
          <Grid.Col span={{ base: 12 }} mt={5}>
            <Group position="apart">
              {filteredLogs.length > 0 && (
                <Text c="dimmed" fz="sm">
                  {filteredLogs.length} accident log
                  {filteredLogs.length !== 1 ? 's' : ''} found
                </Text>
              )}
              <Group>
                <Button
                  variant="light"
                  onClick={clearFilters}
                  leftSection={<IconX size={16} />}
                  radius="xl"
                  color="gray"
                >
                  Clear
                </Button>
                <Button
                  onClick={applyFilters}
                  leftSection={<IconFilter size={16} />}
                  radius="xl"
                  color="blue"
                >
                  Apply Filters
                </Button>
              </Group>
            </Group>
          </Grid.Col>
        </Grid>
      </div>
    </Paper>
  );
}
