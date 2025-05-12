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
} from '@mantine/core';
import { IconMapPin, IconUser, IconAlertTriangle, IconPercentage, IconFilter } from '@tabler/icons-react';
import AdvancedFilters from './AdvancedFilters';

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

const CoreStatistics = ({ 
  statistics = {}, 
  onTimeFilterChange,
  onAdvancedFiltersChange,
  availableLocations = [],
  availableCameras = [],
  timeFilter = 'all'
}) => {
  const {
    totalHandled = 0,
    falsePositiveRate = 0,
    severityDistribution = {},
    top5Locations = [],
    mostActiveResponders = []
  } = statistics;

  const [popoverOpened, setPopoverOpened] = useState(false);
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
          value={timeFilter}
          onChange={onTimeFilterChange}
        />
        
        <Popover
          opened={popoverOpened}
          onChange={setPopoverOpened}
          position="bottom-end"
          shadow="md"
          closeOnClickOutside={false}
        >
          <Popover.Target>
            <Button 
              variant="light" 
              size="sm"
              leftIcon={<IconFilter size={16} />}
              onClick={() => setPopoverOpened((o) => !o)}
            >
              Advanced Filters
            </Button>
          </Popover.Target>
          <Popover.Dropdown p={0}>
            <AdvancedFilters
              isOpen={popoverOpened}
              onClose={() => setPopoverOpened(false)}
              filters={advancedFilters}
              onFiltersChange={handleAdvancedFiltersChange}
              onAdvancedFiltersChange={onAdvancedFiltersChange}
              availableLocations={availableLocations}
              availableCameras={availableCameras}
            />
          </Popover.Dropdown>
        </Popover>
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