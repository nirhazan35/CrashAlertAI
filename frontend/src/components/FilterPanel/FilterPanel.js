import React, { useState, useEffect } from "react";
import { useAuth } from "../../authentication/AuthProvider";
import { useAccidentLogs } from "../../context/AccidentContext";
import {
  Button,
  Group,
  Select,
  Text,
  Paper,
  Box,
  Grid,
  useMantineTheme
} from '@mantine/core';
import { 
  IconCalendar, 
  IconClock, 
  IconMapPin, 
  IconCamera, 
  IconAlertTriangle,
  IconX
} from '@tabler/icons-react';
import './FilterPanel.css';

// Generate time options for each hour of the day
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

const FilterPanel = ({ 
  colSpan = { base: 12, sm: 6, md: 4, lg: 1.7 },
  onFilteredLogsChange, // This will be called whenever filtered logs change
}) => {
  const { user } = useAuth();
  const theme = useMantineTheme();
  const { accidentLogs } = useAccidentLogs();
  
  // Internal state management
  const [cameraData, setCameraData] = useState({ cameras: [], locations: [] });
  const [filters, setFilters] = useState({
    cameraId: "",
    location: "",
    startDate: null,
    endDate: null,
    severity: "",
    startTime: "",
    endTime: "",
  });

  // Process camera and location data for Select components
  const cameraOptions = cameraData.cameras.map(camera => ({ value: camera, label: camera }));
  const locationOptions = cameraData.locations.map(location => ({ value: location, label: location }));

  // Fetch camera data on component mount
  useEffect(() => {
    const fetchCameraData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/cameras/get-id_location`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setCameraData({
            cameras: data.map((item) => item.cameraId) || [],
            locations: data.map((item) => item.location) || [],
          });
        } else {
          console.error("Error fetching camera data:", data);
          // Use mock data if API fails
          setCameraData({
            cameras: ["Camera 1", "Camera 2", "Camera 3", "Camera 4"],
            locations: ["Parking Lot A", "Main Road", "Highway Junction", "Campus Entrance"]
          });
        }
      } catch (error) {
        console.error("Error fetching camera data:", error);
        // Use mock data if API fails
        setCameraData({
          cameras: ["Camera 1", "Camera 2", "Camera 3", "Camera 4"],
          locations: ["Parking Lot A", "Main Road", "Highway Junction", "Campus Entrance"]
        });
      }
    };

    fetchCameraData();
  }, []);

  // Filter logs whenever filters or accident logs change
  useEffect(() => {
    // Apply filters to accident logs
    const filteredLogs = accidentLogs.filter((log) => {
      // Safely handle cameraId comparison
      const matchesCameraId = !filters.cameraId || 
        (log.cameraId && log.cameraId.toLowerCase && 
        log.cameraId.toLowerCase() === filters.cameraId.toLowerCase());
      
      // Safely handle location comparison
      const matchesLocation = !filters.location || 
        (log.location && log.location.toLowerCase && 
        log.location.toLowerCase() === filters.location.toLowerCase());
      
      // Safely handle date comparison
      let matchesDate = true;
      if (filters.startDate && log.date) {
        const logDate = new Date(log.date);
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        matchesDate = logDate >= startDate;
      }
      if (filters.endDate && log.date && matchesDate) {
        const logDate = new Date(log.date);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = logDate <= endDate;
      }
      
      // Safely handle severity comparison
      const matchesSeverity = !filters.severity || 
        (log.severity && log.severity.toLowerCase && 
        log.severity.toLowerCase() === filters.severity.toLowerCase());
      
      // Safely handle time filters
      let matchesTime = true;
      if (filters.startTime && log.displayTime) {
        matchesTime = matchesTime && (log.displayTime >= filters.startTime);
      }
      if (filters.endTime && log.displayTime) {
        matchesTime = matchesTime && (log.displayTime <= filters.endTime);
      }
      
      return matchesCameraId && matchesLocation && matchesDate && matchesSeverity && matchesTime;
    });
    
    // Pass filtered logs back to parent component
    if (onFilteredLogsChange) {
      onFilteredLogsChange(filteredLogs);
    }
  }, [filters, accidentLogs, onFilteredLogsChange]);

  // Handler for individual filter changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      cameraId: "",
      location: "",
      startDate: null,
      endDate: null,
      severity: "",
      startTime: "",
      endTime: "",
    });
    // Force clear input values
    document.querySelectorAll('input[type="date"]').forEach(input => input.value = '');
  };
  
  // Calculate filtered logs count for display
  const filteredLogs = accidentLogs.filter((log) => {
    const matchesCameraId = !filters.cameraId || 
      (log.cameraId && log.cameraId.toLowerCase && 
      log.cameraId.toLowerCase() === filters.cameraId.toLowerCase());
    
    const matchesLocation = !filters.location || 
      (log.location && log.location.toLowerCase && 
      log.location.toLowerCase() === filters.location.toLowerCase());
    
    let matchesDate = true;
    if (filters.startDate && log.date) {
      const logDate = new Date(log.date);
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      matchesDate = logDate >= startDate;
    }
    if (filters.endDate && log.date && matchesDate) {
      const logDate = new Date(log.date);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = logDate <= endDate;
    }
    
    const matchesSeverity = !filters.severity || 
      (log.severity && log.severity.toLowerCase && 
      log.severity.toLowerCase() === filters.severity.toLowerCase());
    
    let matchesTime = true;
    if (filters.startTime && log.displayTime) {
      matchesTime = matchesTime && (log.displayTime >= filters.startTime);
    }
    if (filters.endTime && log.displayTime) {
      matchesTime = matchesTime && (log.displayTime <= filters.endTime);
    }
    
    return matchesCameraId && matchesLocation && matchesDate && matchesSeverity && matchesTime;
  });

  return (
    <Paper shadow="sm" p="lg" radius="md" mb="xl" className="filter-section">
      <Grid align="flex-end" gutter="md">
        <Grid.Col span={colSpan}>
          <Group spacing="xs" mb={6}>
            <Box style={{ color: theme.colors.brand[5] }}>
              <IconCamera size={16} />
            </Box>
            <Text className="filter-label">
              Camera ID
            </Text>
          </Group>
          <Select
            placeholder="Camera ID"
            data={[{value: "", label: "All"}, ...cameraOptions]}
            value={filters.cameraId}
            onChange={(value) => handleFilterChange('cameraId', value)}
            searchable
            clearable
            radius="xl"
            size="md"
            styles={(theme) => ({
              input: {
                border: `1px solid ${theme.colors.gray[3]}`,
                '&:focus': {
                  borderColor: theme.colors.brand[5],
                  boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.15)`
                }
              },
              item: {
                borderRadius: '6px',
                '&[data-selected]': {
                  backgroundColor: `rgba(59, 130, 246, 0.1)`,
                  color: theme.colors.brand[5],
                  fontWeight: 500,
                }
              }
            })}
          />
        </Grid.Col>
        
        <Grid.Col span={colSpan}>
          <Group spacing="xs" mb={6}>
            <Box style={{ color: theme.colors.brand[5] }}>
              <IconMapPin size={16} />
            </Box>
            <Text className="filter-label">
              Location
            </Text>
          </Group>
          <Select
            placeholder="Locations"
            data={[{value: "", label: "All"}, ...locationOptions]}
            value={filters.location}
            onChange={(value) => handleFilterChange('location', value)}
            searchable
            clearable
            radius="xl"
            size="md"
            styles={(theme) => ({
              input: {
                border: `1px solid ${theme.colors.gray[3]}`,
                '&:focus': {
                  borderColor: theme.colors.brand[5],
                  boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.15)`
                }
              },
              item: {
                borderRadius: '6px',
                '&[data-selected]': {
                  backgroundColor: `rgba(59, 130, 246, 0.1)`,
                  color: theme.colors.brand[5],
                  fontWeight: 500,
                }
              }
            })}
          />
        </Grid.Col>
        
        <Grid.Col span={colSpan}>
          <Group spacing="xs" mb={6}>
            <Box style={{ color: theme.colors.brand[5] }}>
              <IconCalendar size={16} />
            </Box>
            <Text className="filter-label">
              Start Date
            </Text>
          </Group>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => {
              // Validate date range
              if (filters.endDate && new Date(e.target.value) > new Date(filters.endDate)) {
                // Reset end date if start date is later
                setFilters(prev => ({ ...prev, startDate: e.target.value, endDate: null }));
                document.querySelector('input[name="endDate"]').value = '';
              } else {
                handleFilterChange('startDate', e.target.value);
              }
            }}
            name="startDate"
            className="native-date-input"
          />
        </Grid.Col>
        
        <Grid.Col span={colSpan}>
          <Group spacing="xs" mb={6}>
            <Box style={{ color: theme.colors.brand[5] }}>
              <IconCalendar size={16} />
            </Box>
            <Text className="filter-label">
              End Date
            </Text>
          </Group>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => {
              // Validate date range
              if (filters.startDate && new Date(e.target.value) < new Date(filters.startDate)) {
                // Reset both dates if invalid range
                setFilters(prev => ({ 
                  ...prev, 
                  startDate: null,
                  endDate: null
                }));
                document.querySelectorAll('input[type="date"]').forEach(input => input.value = '');
              } else {
                handleFilterChange('endDate', e.target.value);
              }
            }}
            name="endDate"
            className="native-date-input"
          />
        </Grid.Col>
        
        <Grid.Col span={colSpan}>
          <Group spacing="xs" mb={6}>
            <Box style={{ color: theme.colors.brand[5] }}>
              <IconAlertTriangle size={16} />
            </Box>
            <Text className="filter-label">
              Severity
            </Text>
          </Group>
          <Select
            placeholder="Severities"
            data={[
              { value: "", label: "All" },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]}
            value={filters.severity}
            onChange={(value) => handleFilterChange('severity', value)}
            clearable
            radius="xl"
            size="md"
            styles={(theme) => ({
              input: {
                border: `1px solid ${theme.colors.gray[3]}`,
                '&:focus': {
                  borderColor: theme.colors.brand[5],
                  boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.15)`
                }
              },
              item: {
                borderRadius: '6px',
                '&[data-selected]': {
                  backgroundColor: `rgba(59, 130, 246, 0.1)`,
                  color: theme.colors.brand[5],
                  fontWeight: 500,
                }
              }
            })}
          />
        </Grid.Col>
        
        <Grid.Col span={colSpan}>
          <Group spacing="xs" mb={6}>
            <Box style={{ color: theme.colors.brand[5] }}>
              <IconClock size={16} />
            </Box>
            <Text className="filter-label">
              From Time
            </Text>
          </Group>
          <Select
            placeholder="Start Time"
            data={[{value: "", label: "All"}, ...timeOptions]}
            value={filters.startTime}
            onChange={(value) => handleFilterChange('startTime', value)}
            clearable
            radius="xl"
            size="md"
            styles={(theme) => ({
              input: {
                border: `1px solid ${theme.colors.gray[3]}`,
                '&:focus': {
                  borderColor: theme.colors.brand[5],
                  boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.15)`
                }
              },
              item: {
                borderRadius: '6px',
                '&[data-selected]': {
                  backgroundColor: `rgba(59, 130, 246, 0.1)`,
                  color: theme.colors.brand[5],
                  fontWeight: 500,
                }
              }
            })}
          />
        </Grid.Col>
        
        <Grid.Col span={colSpan}>
          <Group spacing="xs" mb={6}>
            <Box style={{ color: theme.colors.brand[5] }}>
              <IconClock size={16} />
            </Box>
            <Text className="filter-label">
              To Time
            </Text>
          </Group>
          <Select
            placeholder="End Time"
            data={[{value: "", label: "All"}, ...timeOptions]}
            value={filters.endTime}
            onChange={(value) => handleFilterChange('endTime', value)}
            clearable
            radius="xl"
            size="md"
            styles={(theme) => ({
              input: {
                border: `1px solid ${theme.colors.gray[3]}`,
                '&:focus': {
                  borderColor: theme.colors.brand[5],
                  boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.15)`
                }
              },
              item: {
                borderRadius: '6px',
                '&[data-selected]': {
                  backgroundColor: `rgba(59, 130, 246, 0.1)`,
                  color: theme.colors.brand[5],
                  fontWeight: 500,
                }
              }
            })}
          />
        </Grid.Col>
        
        <Grid.Col span={{ base: 12 }} mt={5}>
          <Group position="right">
            {filteredLogs.length > 0 && (
              <Text c="dimmed" fz="sm" mr="auto">
                {filteredLogs.length} accident log{filteredLogs.length !== 1 ? 's' : ''} found
              </Text>
            )}
            <Button 
              variant="light" 
              onClick={handleClearFilters}
              leftIcon={<IconX size={16} />}
              radius="xl"
              color="black"
              fw={500}
            >
              Clear Filters
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

export default FilterPanel; 