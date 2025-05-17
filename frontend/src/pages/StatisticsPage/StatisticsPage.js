import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Text,
  LoadingOverlay,
  Alert,
  Group,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconRefresh, IconAlertCircle, IconFileExport } from '@tabler/icons-react';
import CoreStatistics from '../../components/Statistics/CoreStatistics';
import TimeBasedTrends from '../../components/Statistics/TimeBasedTrends';
import FalsePositiveTrends from '../../components/Statistics/FalsePositiveTrends';
import { useAuth } from '../../authentication/AuthProvider';
import { 
  fetchHandledAccidents,
  fetchCamerasLocations,
  fetchUsers,
  calculateCoreStatistics,
  calculateTimeBasedTrends,
  calculateFalsePositiveTrends,
  exportStatisticsToCSV
} from '../../services/statisticsService';
import { 
  subDays, 
  subMonths, 
  subYears, 
  isAfter, 
  isWithinInterval,
} from 'date-fns';

/**
 * StatisticsPage - Main dashboard for accident statistics
 * Provides visualizations of accident data with filtering options
 */
export default function StatisticsPage() {
  const { user } = useAuth();
  const userToken = user.token;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [allAccidents, setAllAccidents] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [availableUserNames, setAvailableUserNames] = useState([]);
  const [advancedFiltersState, setAdvancedFiltersState] = useState(null);
  const [statistics, setStatistics] = useState({
    core: {
      totalHandled: 0,
      falsePositiveRate: 0,
      severityDistribution: {},
      top5Locations: [],
      mostActiveResponders: []
    },
    trends: {
      monthlyTrends: [],
      weeklyTrends: [],
      hourlyTrends: []
    },
    falsePositives: {
      locationTrends: [],
      cameraTrends: []
    }
  });

  /**
   * Filter accidents by time period (day, month, year, all)
   */
  const filterAccidentsByTime = useCallback((accidents, filter) => {
    if (filter === 'all') return accidents;

    const now = new Date();
    let cutoffDate;

    switch (filter) {
      case 'day':
        cutoffDate = subDays(now, 1);
        break;
      case 'month':
        cutoffDate = subMonths(now, 1);
        break;
      case 'year':
        cutoffDate = subYears(now, 1);
        break;
      default:
        return accidents;
    }

    return accidents.filter(accident => 
      isAfter(new Date(accident.date), cutoffDate)
    );
  }, []);

  /**
   * Apply advanced filters to accidents dataset
   */
  const filterAccidentsByAdvancedFilters = useCallback((accidents, filters) => {
    if (!filters) return accidents;
    
    return accidents.filter(accident => {
      const accidentDate = new Date(accident.date);
      const accidentTime = accidentDate.toTimeString().slice(0, 5); // HH:mm format

      // Date range filter
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        if (!isWithinInterval(accidentDate, { start: startDate, end: endDate })) {
          return false;
        }
      }

      // Time range filter
      if (filters.startTime && filters.endTime) {
        if (accidentTime < filters.startTime || accidentTime > filters.endTime) {
          return false;
        }
      }

      // User filter
      if (filters.userIds && filters.userIds.length > 0) {
        if (!filters.userIds.includes(accident.assignedTo)) {
          return false;
        }
      }

      // Location filter
      if (filters.locations && filters.locations.length > 0) {
        if (!filters.locations.includes(accident.location)) {
          return false;
        }
      }

      // Camera filter
      if (filters.cameras && filters.cameras.length > 0) {
        if (!filters.cameras.includes(accident.cameraId)) {
          return false;
        }
      }

      // Severity filter
      if (filters.severityLevels && filters.severityLevels.length > 0) {
        if (!filters.severityLevels.includes(accident.severity)) {
          return false;
        }
      }

      return true;
    });
  }, []);

  /**
   * Update statistics based on filtered accident data
   */
  const updateStatistics = useCallback(() => {
    if (!allAccidents.length) return;
    
    let filteredAccidents = filterAccidentsByTime(allAccidents, timeFilter);
    
    if (advancedFiltersState) {
      filteredAccidents = filterAccidentsByAdvancedFilters(filteredAccidents, advancedFiltersState);
    }

    const coreStats = calculateCoreStatistics(filteredAccidents);
    const timeBasedStats = calculateTimeBasedTrends(filteredAccidents);
    const falsePositiveStats = calculateFalsePositiveTrends(filteredAccidents);

    setStatistics({
      core: coreStats,
      trends: {
        monthlyTrends: timeBasedStats.monthlyTrends || [],
        weeklyTrends: timeBasedStats.weeklyTrends || [],
        hourlyTrends: timeBasedStats.hourlyTrends || []
      },
      falsePositives: {
        locationTrends: falsePositiveStats.byLocation || [],
        cameraTrends: falsePositiveStats.byCameraId || []
      }
    });
  }, [allAccidents, timeFilter, advancedFiltersState, filterAccidentsByTime, filterAccidentsByAdvancedFilters]);

  /**
   * Extract unique locations and cameras from accident data for filters
   */
  const extractAvailableFilters = useCallback((allUsers, allCamerasLocations) => {
    const locations = [...new Set(allCamerasLocations.map(a => a.location))].map(loc => ({
      value: loc,
      label: loc
    }));

    const cameras = [...new Set(allCamerasLocations.map(a => a.cameraId))].map(cam => ({
      value: cam,
      label: `Camera ${cam}`
    }));

    const usernames = [...new Set(allUsers.map(a => a.username))].map(username => ({
      value: username,
      label: username,
    }));

    setAvailableLocations(locations);
    setAvailableCameras(cameras);
    setAvailableUserNames(usernames);
  }, []);

  /**
   * Load accident data and calculate initial statistics
   */
  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const handledAccidents = await fetchHandledAccidents(userToken);
      const allUsers = await fetchUsers(userToken);
      const allCamerasLocations = await fetchCamerasLocations(userToken);
      setAllAccidents(handledAccidents);
      extractAvailableFilters(allUsers, allCamerasLocations);
    } catch (err) {
      setError('Failed to load statistics. Please try again.');
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [userToken, extractAvailableFilters]);

  // Load initial data
  useEffect(() => {
    if (userToken) {
      loadStatistics();
    }
  }, [userToken, loadStatistics]);

  // Update statistics when filters change
  useEffect(() => {
    updateStatistics();
  }, [updateStatistics]);

  const handleRefresh = () => {
    loadStatistics();
  };

  const handleExportCSV = () => {
    // Call the export function with just the statistics
    exportStatisticsToCSV(statistics);
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
  };

  const handleAdvancedFiltersChange = (filters) => {
    setAdvancedFiltersState(filters);
  };

  if (!userToken) {
    return null;
  }

  return (
    <Container fluid px="md" py="xl">
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      {/* Header */}
      <Group position="apart" mb="xl">
        <Text size="xl" weight={700}>Statistics Dashboard</Text>
        <Group spacing="xs">
          <Tooltip label="Export to CSV">
            <ActionIcon
              variant="light"
              color="teal"
              size="lg"
              onClick={handleExportCSV}
              disabled={loading || !allAccidents.length}
            >
              <IconFileExport size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Refresh data">
            <ActionIcon
              variant="light"
              color="blue"
              size="lg"
              onClick={handleRefresh}
              loading={loading}
            >
              <IconRefresh size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="lg">
          {error}
        </Alert>
      )}

      {statistics && (
        <Grid gutter="md">
          {/* Core Statistics */}
          <Grid.Col span={12}>
            <Paper shadow="sm" p="md" radius="md">            
              <CoreStatistics 
                statistics={statistics.core} 
                onTimeFilterChange={handleTimeFilterChange}
                onAdvancedFiltersChange={handleAdvancedFiltersChange}
                availableLocations={availableLocations}
                availableCameras={availableCameras}
                availableUserNames={availableUserNames}
                timeFilter={timeFilter}
              />
            </Paper>
          </Grid.Col>

          {/* Time-based Trends */}
          <Grid.Col span={12}>
            <TimeBasedTrends trends={statistics.trends} />
          </Grid.Col>

          {/* False Positive Analysis */}
          <Grid.Col span={12}>
            <FalsePositiveTrends trends={statistics.falsePositives} />
          </Grid.Col>
        </Grid>
      )}
    </Container>
  );
}
