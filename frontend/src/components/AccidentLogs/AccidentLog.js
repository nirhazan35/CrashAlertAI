import React, { useState, useEffect } from "react";
import { useAccidentLogs } from "../../context/AccidentContext";
import { useAuth } from "../../authentication/AuthProvider";
import {
  Table,
  Button,
  Group,
  Select,
  Badge,
  Text,
  Paper,
  Box,
  ScrollArea,
  useMantineTheme,
  Grid,
  ActionIcon,
  rgba,
  Title
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconEye, IconCheck, IconX } from '@tabler/icons-react';

// Generate time options for each hour of the day
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

const AccidentLog = () => {
  const { accidentLogs, updateAccidentStatus, handleRowDoubleClick } = useAccidentLogs();
  const { user } = useAuth();
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [cameraData, setCameraData] = useState({ cameras: [], locations: [] });
  const theme = useMantineTheme();

  // Filter state including new time filters
  const [filters, setFilters] = useState({
    cameraId: "",
    location: "",
    date: null,
    severity: "",
    startTime: "",
    endTime: "",
  });

  // Fetch all cameras id and location from backend
  useEffect(() => {
    const fetchCameraData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/cameras/get-id_location`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
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
        }
      } catch (error) {
        console.error("Error fetching camera data:", error);
      }
    };

    fetchCameraData();
  }, [user?.token]);

  // Handler for filter changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      cameraId: "",
      location: "",
      date: null,
      severity: "",
      startTime: "",
      endTime: "",
    });
  };

  // Format date for comparison
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  };

  // Filter accident logs based on the filter criteria
  const filteredLogs = accidentLogs.filter((log) => {
    const matchesCameraId =
      filters.cameraId === "" || log.cameraId.toLowerCase() === filters.cameraId.toLowerCase();
    const matchesLocation =
      filters.location === "" || log.location.toLowerCase() === filters.location.toLowerCase();
    const matchesDate =
      !filters.date || log.displayDate === formatDate(filters.date);
    const matchesSeverity =
      filters.severity === "" || log.severity.toLowerCase() === filters.severity.toLowerCase();
    // Time filter: check if log.displayTime is within the selected range
    let matchesTime = true;
    if (filters.startTime) {
      matchesTime = matchesTime && (log.displayTime >= filters.startTime);
    }
    if (filters.endTime) {
      matchesTime = matchesTime && (log.displayTime <= filters.endTime);
    }
    return matchesCameraId && matchesLocation && matchesDate && matchesSeverity && matchesTime;
  });

  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  // Helper to get severity badge color
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  // Process camera and location data for Select components
  const cameraOptions = cameraData.cameras.map(camera => ({ value: camera, label: camera }));
  const locationOptions = cameraData.locations.map(location => ({ value: location, label: location }));

  // Custom styles for table headers
  const tableHeaderStyle = {
    textAlign: 'center',
    fontWeight: 600,
    color: theme.colors.gray[8],
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <Box>
      {/* Filter Options */}
      <Paper shadow="xs" p="md" mb="md" radius="md">
        <Grid align="flex-end" gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
            <Select
              label="Camera ID"
              placeholder="All Camera IDs"
              data={[{ value: '', label: 'All Camera IDs' }, ...cameraOptions]}
              value={filters.cameraId}
              onChange={(value) => handleFilterChange('cameraId', value)}
              searchable
              clearable
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
            <Select
              label="Location"
              placeholder="All Locations"
              data={[{ value: '', label: 'All Locations' }, ...locationOptions]}
              value={filters.location}
              onChange={(value) => handleFilterChange('location', value)}
              searchable
              clearable
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
            <DateInput
              label="Date"
              placeholder="Select date"
              value={filters.date}
              onChange={(value) => handleFilterChange('date', value)}
              clearable
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
            <Select
              label="Severity"
              placeholder="All Severities"
              data={[
                { value: '', label: 'All Severities' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
              value={filters.severity}
              onChange={(value) => handleFilterChange('severity', value)}
              clearable
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
            <Select
              label="From Time"
              placeholder="Start Time"
              data={[{ value: '', label: 'Any Time' }, ...timeOptions]}
              value={filters.startTime}
              onChange={(value) => handleFilterChange('startTime', value)}
              clearable
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
            <Select
              label="To Time"
              placeholder="End Time"
              data={[{ value: '', label: 'Any Time' }, ...timeOptions]}
              value={filters.endTime}
              onChange={(value) => handleFilterChange('endTime', value)}
              clearable
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12 }} mt={-5}>
            <Group position="right">
              <Button variant="light" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Accident Logs Table */}
      <Paper shadow="sm" radius="md" withBorder>
        <ScrollArea>
          <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={tableHeaderStyle}>Video</Table.Th>
                <Table.Th style={tableHeaderStyle}>Location</Table.Th>
                <Table.Th style={tableHeaderStyle}>Date</Table.Th>
                <Table.Th style={tableHeaderStyle}>Time</Table.Th>
                <Table.Th style={tableHeaderStyle}>Severity</Table.Th>
                <Table.Th style={tableHeaderStyle}>Description</Table.Th>
                <Table.Th style={tableHeaderStyle}>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredLogs
                .slice()
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((log, index) => (
                  <Table.Tr
                    key={index}
                    bg={selectedRowIndex === index ? rgba(theme.colors.brand[0], 0.7) : 
                        log.status === "assigned" ? rgba(theme.colors.gray[2], 0.5) : 
                        undefined}
                    style={{
                      cursor: 'pointer',
                      animation: log.status !== "assigned" ? 'pulse 2s infinite' : 'none'
                    }}
                    onClick={() => handleRowClick(index)}
                    onDoubleClick={() => handleRowDoubleClick(log)}
                  >
                    <Table.Td style={{ textAlign: 'center' }}>
                      <ActionIcon component="a" href={log.video} target="_blank" rel="noopener noreferrer" variant="light" color="blue">
                        <IconEye size={16} />
                      </ActionIcon>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{log.location}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>{log.displayDate}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>{log.displayTime}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Badge color={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text lineClamp={1}>{log.description || "No description"}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      {log.status === "assigned" && log.assignedTo !== user?.username ? (
                        <Button size="xs" variant="subtle" color="gray" disabled>
                          Assigned to {log.assignedTo}
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant={log.status === "assigned" ? "outline" : "filled"}
                          color={log.status === "assigned" ? "red" : "blue"}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateAccidentStatus(
                              log._id,
                              log.status === "assigned" ? "active" : "assigned"
                            );
                          }}
                        >
                          {log.status === "assigned" && log.assignedTo === user?.username
                            ? "Unassign"
                            : "Assign"}
                        </Button>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
      
      <style jsx global>{`
        @keyframes pulse {
          0% { background-color: transparent; }
          50% { background-color: ${rgba(theme.colors.danger[0], 0.3)}; }
          100% { background-color: transparent; }
        }
      `}</style>
    </Box>
  );
};

export default AccidentLog;
