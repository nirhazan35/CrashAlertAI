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
} from '@mantine/core';
import { IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import CoreStatistics from '../../components/Statistics/CoreStatistics';
import TimeBasedTrends from '../../components/Statistics/TimeBasedTrends';
import FalsePositiveTrends from '../../components/Statistics/FalsePositiveTrends';
import { useAuth } from '../../authentication/AuthProvider';
import { 
  fetchHandledAccidents,
  calculateCoreStatistics,
  calculateTimeBasedTrends,
  calculateFalsePositiveTrends
} from '../../services/statisticsService';
import { 
  subDays, 
  subMonths, 
  subYears, 
  isAfter, 
  isWithinInterval,
} from 'date-fns';

export default function StatisticsPage() {
  const { user } = useAuth();
  const userToken = user.token;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('All');
  const [allAccidents, setAllAccidents] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableCameras, setAvailableCameras] = useState([]);
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

  const filterAccidentsByAdvancedFilters = useCallback((accidents, filters) => {
    return accidents.filter(accident => {
      const accidentDate = new Date(accident.date);
      const accidentTime = accidentDate.toTimeString().slice(0, 5); // HH:mm format

      // Date range filter
      if (filters.startDate && filters.endDate) {
        if (!isWithinInterval(accidentDate, { 
          start: filters.startDate, 
          end: filters.endDate 
        })) {
          return false;
        }
      }

      // Time range filter
      if (filters.startTime && filters.endTime) {
        if (accidentTime < filters.startTime || accidentTime > filters.endTime) {
          return false;
        }
      }

      // Location filter
      if (filters.locations.length > 0) {
        if (!filters.locations.includes(accident.location)) {
          return false;
        }
      }

      // Camera filter
      if (filters.cameras.length > 0) {
        if (!filters.cameras.includes(accident.cameraId)) {
          return false;
        }
      }

      // Severity filter
      if (filters.severityLevels.length > 0) {
        if (!filters.severityLevels.includes(accident.severity)) {
          return false;
        }
      }

      return true;
    });
  }, []);

  const updateStatistics = useCallback((accidents, advancedFilters = null) => {
    let filteredAccidents = filterAccidentsByTime(accidents, timeFilter);
    
    if (advancedFilters) {
      filteredAccidents = filterAccidentsByAdvancedFilters(filteredAccidents, advancedFilters);
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
  }, [timeFilter, filterAccidentsByTime, filterAccidentsByAdvancedFilters]);

  const extractAvailableFilters = useCallback((accidents) => {
    const locations = [...new Set(accidents.map(a => a.location))].map(loc => ({
      value: loc,
      label: loc
    }));

    const cameras = [...new Set(accidents.map(a => a.cameraId))].map(cam => ({
      value: cam,
      label: `Camera ${cam}`
    }));

    setAvailableLocations(locations);
    setAvailableCameras(cameras);
  }, []);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const handledAccidents = await fetchHandledAccidents(userToken);
      setAllAccidents(handledAccidents);
      extractAvailableFilters(handledAccidents);
      updateStatistics(handledAccidents);
    } catch (err) {
      setError('Failed to load statistics. Please try again.');
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [userToken, updateStatistics, extractAvailableFilters]);

  useEffect(() => {
    if (userToken) {
      loadStatistics();
    }
  }, [userToken, loadStatistics]);

  const handleRefresh = () => {
    loadStatistics();
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    updateStatistics(allAccidents);
  };

  const handleAdvancedFiltersChange = (filters) => {
    setTimeFilter('All');
    updateStatistics(allAccidents, filters);
  };

  if (!userToken) {
    return null;
  }

  return (
    <Container fluid px="md" py="xl">
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      {/* Header */}
      <Group position="apart" mb="xl">
        <Text size="xl" weight={700}>Accident Statistics Dashboard</Text>
        <ActionIcon
          variant="light"
          color="blue"
          size="lg"
          onClick={handleRefresh}
          loading={loading}
        >
          <IconRefresh size={20} />
        </ActionIcon>
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
