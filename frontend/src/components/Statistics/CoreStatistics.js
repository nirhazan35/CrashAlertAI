import React, { useState } from 'react';
import {
  Paper,
  Text,
  Group,
  Stack,
  Progress,
  List,
  ThemeIcon,
  Grid,
  SegmentedControl,
  Popover,
  Button,
  MultiSelect,
  ActionIcon,
  Divider,
  Box,
  Select,
} from '@mantine/core';
import { IconMapPin, IconUser, IconAlertTriangle, IconPercentage, IconFilter, IconX } from '@tabler/icons-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Paper shadow="sm" p="md" radius="md">
    <Group position="apart" align="flex-start">
      <div>
        <Text size="xs" color="dimmed" transform="uppercase">{title}</Text>
        <Text size="xl" weight={700}>{value}</Text>
      </div>
      <Icon size={24} color={color} />
    </Group>
  </Paper>
);

const AdvancedFilters = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange,
  availableLocations = [],
  availableCameras = []
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
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
    </Stack>
  );
};

const CoreStatistics = ({ 
  statistics = {}, 
  onTimeFilterChange,
  onAdvancedFiltersChange,
  availableLocations = [],
  availableCameras = []
}) => {
  const {
    totalHandled = 0,
    falsePositiveRate = 0,
    severityDistribution = {},
    top5Locations = [],
    mostActiveResponders = []
  } = statistics;

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    startDate: null,
    endDate: null,
    startTime: '',
    endTime: '',
    locations: [],
    cameras: [],
    severityLevels: []
  });

  const severityColors = {
    low: 'green',
    medium: 'yellow',
    high: 'red'
  };

  const handleAdvancedFiltersChange = (newFilters) => {
    setAdvancedFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onAdvancedFiltersChange?.(advancedFilters);
    setIsAdvancedFiltersOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: null,
      endDate: null,
      startTime: '',
      endTime: '',
      locations: [],
      cameras: [],
      severityLevels: []
    };
    setAdvancedFilters(clearedFilters);
    onAdvancedFiltersChange?.(clearedFilters);
  };

  return (
    <Stack spacing="md">
      {/* Filters */}
      <Group position="right" spacing="sm">
        <SegmentedControl
          size="sm"
          data={[
            { label: 'Day', value: 'day' },
            { label: 'Month', value: 'month' },
            { label: 'Year', value: 'year' },
            { label: 'All', value: 'all' },
          ]}
          defaultValue="all"
          onChange={onTimeFilterChange}
        />
        <Popover
          opened={isAdvancedFiltersOpen}
          onChange={setIsAdvancedFiltersOpen}
          position="bottom-end"
          shadow="md"
        >
          <Popover.Target>
            <Button 
              variant="light" 
              size="sm"
              leftIcon={<IconFilter size={16} />}
              onClick={() => setIsAdvancedFiltersOpen((o) => !o)}
            >
              Advanced Filters
            </Button>
          </Popover.Target>
          <Popover.Dropdown p={0}>
            <AdvancedFilters
              isOpen={isAdvancedFiltersOpen}
              onClose={() => setIsAdvancedFiltersOpen(false)}
              filters={advancedFilters}
              onFiltersChange={handleAdvancedFiltersChange}
              availableLocations={availableLocations}
              availableCameras={availableCameras}
            />
          </Popover.Dropdown>
        </Popover>
        <Button 
          size="sm"
          leftIcon={<IconFilter size={16} />}
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
        <Button 
          variant="light" 
          color="gray"
          size="sm"
          leftIcon={<IconX size={16} />}
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={4}>
          <StatCard
            title="Total Handled Accidents"
            value={totalHandled}
            icon={IconAlertTriangle}
            color="blue"
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <StatCard
            title="False Positive Rate"
            value={`${falsePositiveRate}%`}
            icon={IconPercentage}
            color="red"
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <StatCard
            title="Active Responders"
            value={mostActiveResponders.length}
            icon={IconUser}
            color="green"
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper shadow="sm" p="md" radius="md">
            <Text size="sm" weight={500} mb="md">Severity Distribution</Text>
            <Grid>
              {Object.entries(severityDistribution).map(([severity, data]) => (
                <Grid.Col span={4} key={severity}>
                  <Stack spacing="xs">
                    <Text size="xs" color="dimmed" transform="capitalize">{severity}</Text>
                    <Group position="apart">
                      <Text size="lg" weight={500}>{data.count}</Text>
                      <Text size="sm" color="dimmed">{data.percentage}%</Text>
                    </Group>
                    <Progress 
                      value={parseFloat(data.percentage)} 
                      color={severityColors[severity.toLowerCase()]} 
                      size="sm" 
                    />
                  </Stack>
                </Grid.Col>
              ))}
            </Grid>
          </Paper>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper shadow="sm" p="md" radius="md">
            <Text size="sm" weight={500} mb="md">Top Responders</Text>
            <List spacing="xs">
              {mostActiveResponders.map((responder, index) => (
                <List.Item
                  key={index}
                  icon={
                    <ThemeIcon color="green" size={24} radius="xl">
                      <IconUser size={16} />
                    </ThemeIcon>
                  }
                >
                  <Group position="apart">
                    <Text size="sm">{responder.responder}</Text>
                    <Text size="sm" color="dimmed">{responder.count} accidents</Text>
                  </Group>
                </List.Item>
              ))}
            </List>
          </Paper>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper shadow="sm" p="md" radius="md">
            <Text size="sm" weight={500} mb="md">Top Locations</Text>
            <List spacing="xs">
              {top5Locations.map((loc, index) => (
                <List.Item
                  key={index}
                  icon={
                    <ThemeIcon color="blue" size={24} radius="xl">
                      <IconMapPin size={16} />
                    </ThemeIcon>
                  }
                >
                  <Group position="apart">
                    <Text size="sm">{loc.location}</Text>
                    <Text size="sm" color="dimmed">{loc.count} accidents</Text>
                  </Group>
                </List.Item>
              ))}
            </List>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default CoreStatistics; 