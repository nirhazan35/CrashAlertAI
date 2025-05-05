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
  Grid,
  ActionIcon,
  Title,
  Tooltip,
  Container
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconEye, 
  IconCalendar, 
  IconClock, 
  IconMapPin, 
  IconCamera, 
  IconAlertTriangle,
  IconX
} from '@tabler/icons-react';

// Generate time options for each hour of the day
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

const AccidentLog = () => {
  const { accidentLogs, updateAccidentStatus, handleRowDoubleClick: originalHandleRowDoubleClick } = useAccidentLogs();
  const { user } = useAuth();
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [cameraData, setCameraData] = useState({ cameras: [], locations: [] });

  // Filter state including new time filters
  const [filters, setFilters] = useState({
    cameraId: "",
    location: "",
    dateRange: [null, null],
    severity: "",
    startTime: "",
    endTime: "",
  });

  // Custom double click handler that also scrolls to details
  const handleRowDoubleClick = (log) => {
    // Call the original handler
    originalHandleRowDoubleClick(log);
    
    // Find the accident details component and scroll to it
    setTimeout(() => {
      const detailsElement = document.getElementById('accident-details');
      if (detailsElement) {
        detailsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }
    }, 100); // Small delay to ensure the details are loaded
  };

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
      dateRange: [null, null],
      severity: "",
      startTime: "",
      endTime: "",
    });
  };

  // Fixed filter function to handle null/undefined values safely
  const filteredLogs = accidentLogs.filter((log) => {
    // Safely handle cameraId comparison
    const matchesCameraId = !filters.cameraId || 
      (log.cameraId && log.cameraId.toLowerCase && 
      log.cameraId.toLowerCase() === filters.cameraId.toLowerCase());
    
    // Safely handle location comparison
    const matchesLocation = !filters.location || 
      (log.location && log.location.toLowerCase && 
      log.location.toLowerCase() === filters.location.toLowerCase());
    
    // Safely handle date range comparison
    let matchesDate = true;
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const logDate = new Date(log.date);
      const startDate = new Date(filters.dateRange[0]);
      const endDate = new Date(filters.dateRange[1]);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = logDate >= startDate && logDate <= endDate;
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

  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  // Helper to get severity badge color
  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  // Process camera and location data for Select components
  const cameraOptions = cameraData.cameras.map(camera => ({ value: camera, label: camera }));
  const locationOptions = cameraData.locations.map(location => ({ value: location, label: location }));

  // This is the component we'll render - without any outer title
  return (
    <Container fluid p={0} style={{ marginTop: 0 }}>
      <Paper radius="lg" p="xl" shadow="md" style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.9) 100%)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '4px solid #3b82f6',
      }}>
        {/* Visual design elements */}
        <Box style={{ 
          position: 'absolute', 
          top: -60, 
          right: -60, 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          background: 'rgba(59, 130, 246, 0.1)',
          zIndex: 0
        }} />
        
        <Box style={{ 
          position: 'absolute', 
          bottom: -80, 
          left: 100, 
          width: 160, 
          height: 160, 
          borderRadius: '50%', 
          background: 'rgba(59, 130, 246, 0.05)',
          zIndex: 0
        }} />
        
        <Box style={{ position: 'relative', zIndex: 1 }}>
          {/* Title - Only keep this one */}
          <Title order={2} mb="lg" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            Accident Logs
          </Title>

          {/* Filter Options */}
          <Paper shadow="sm" p="lg" radius="md" mb="xl" style={{ 
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(4px)',
            borderRadius: '16px'
          }}>
            <Grid align="flex-end" gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
                <Group spacing="xs" mb={6}>
                  <Box style={{ color: "#3b82f6" }}>
                    <IconCamera size={16} />
                  </Box>
                  <Text 
                    fw={600} 
                    size="xs"
                    style={{ 
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      color: '#64748b'
                    }}
                  >
                    Camera ID
                  </Text>
                </Group>
                <Select
                  placeholder="Camera ID"
                  data={[{ value: '', label: 'Camera ID' }, ...cameraOptions]}
                  value={filters.cameraId}
                  onChange={(value) => handleFilterChange('cameraId', value)}
                  searchable
                  clearable
                  radius="xl"
                  size="md"
                  styles={{
                    input: {
                      fontFamily: "'Inter', sans-serif",
                      border: '1px solid #e2e8f0',
                      '&:focus': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)'
                      }
                    },
                    item: {
                      fontFamily: "'Inter', sans-serif",
                      borderRadius: '6px',
                      '&[data-selected]': {
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        fontWeight: 500,
                      }
                    }
                  }}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
                <Group spacing="xs" mb={6}>
                  <Box style={{ color: "#3b82f6" }}>
                    <IconMapPin size={16} />
                  </Box>
                  <Text 
                    fw={600} 
                    size="xs"
                    style={{ 
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      color: '#64748b'
                    }}
                  >
                    Location
                  </Text>
                </Group>
                <Select
                  placeholder="Locations"
                  data={[{ value: '', label: 'Locations' }, ...locationOptions]}
                  value={filters.location}
                  onChange={(value) => handleFilterChange('location', value)}
                  searchable
                  clearable
                  radius="xl"
                  size="md"
                  styles={{
                    input: {
                      fontFamily: "'Inter', sans-serif",
                      border: '1px solid #e2e8f0',
                      '&:focus': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)'
                      }
                    },
                    item: {
                      fontFamily: "'Inter', sans-serif",
                      borderRadius: '6px',
                      '&[data-selected]': {
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        fontWeight: 500,
                      }
                    }
                  }}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
                <Group spacing="xs" mb={6}>
                  <Box style={{ color: "#3b82f6" }}>
                    <IconCalendar size={16} />
                  </Box>
                  <Text 
                    fw={600} 
                    size="xs"
                    style={{ 
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      color: '#64748b'
                    }}
                  >
                    Date Range
                  </Text>
                </Group>
                {/* Date Range Picker */}
                <DatePickerInput
                  type="range"
                  placeholder="Select date range"
                  value={filters.dateRange}
                  onChange={(value) => handleFilterChange('dateRange', value)}
                  clearable
                  radius="xl"
                  size="md"
                  hideOutsideDates
                  popoverProps={{
                    withinPortal: true,
                    zIndex: 9999,
                    position: "bottom",
                    shadow: "xl",
                    transitionProps: { transition: "fade", duration: 150 },
                    middlewares: { flip: false, shift: true },
                    offset: 5,
                    styles: {
                      dropdown: {
                        background: 'white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '10px',
                        marginTop: '5px'
                      }
                    }
                  }}
                  styles={{
                    input: {
                      fontFamily: "'Inter', sans-serif",
                      border: '1px solid #e2e8f0',
                      '&:focus': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)'
                      }
                    },
                    calendarHeader: {
                      fontFamily: "'DM Sans', sans-serif"
                    },
                    monthsList: {
                      fontFamily: "'Inter', sans-serif"
                    },
                    yearsList: {
                      fontFamily: "'Inter', sans-serif"
                    },
                    day: {
                      fontFamily: "'Inter', sans-serif",
                      borderRadius: '6px',
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.15)'
                      }
                    },
                    // Hide the previous/next buttons
                    calendarHeaderControl: {
                      display: 'none'
                    },
                    // Style for the selected date range
                    inRange: {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)'
                    },
                    firstInRange: {
                      backgroundColor: '#3b82f6 !important',
                      color: 'white !important'
                    },
                    lastInRange: {
                      backgroundColor: '#3b82f6 !important',
                      color: 'white !important'
                    }
                  }}
                  dropdownType="popover"
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
                <Group spacing="xs" mb={6}>
                  <Box style={{ color: "#3b82f6" }}>
                    <IconAlertTriangle size={16} />
                  </Box>
                  <Text 
                    fw={600} 
                    size="xs"
                    style={{ 
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      color: '#64748b'
                    }}
                  >
                    Severity
                  </Text>
                </Group>
                <Select
                  placeholder="Severities"
                  data={[
                    { value: '', label: 'Severities' },
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' }
                  ]}
                  value={filters.severity}
                  onChange={(value) => handleFilterChange('severity', value)}
                  clearable
                  radius="xl"
                  size="md"
                  styles={{
                    input: {
                      fontFamily: "'Inter', sans-serif",
                      border: '1px solid #e2e8f0',
                      '&:focus': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)'
                      }
                    },
                    item: {
                      fontFamily: "'Inter', sans-serif",
                      borderRadius: '6px',
                      '&[data-selected]': {
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        fontWeight: 500,
                      }
                    }
                  }}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
                <Group spacing="xs" mb={6}>
                  <Box style={{ color: "#3b82f6" }}>
                    <IconClock size={16} />
                  </Box>
                  <Text 
                    fw={600} 
                    size="xs"
                    style={{ 
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      color: '#64748b'
                    }}
                  >
                    From Time
                  </Text>
                </Group>
                <Select
                  placeholder="Start Time"
                  data={[{ value: '', label: 'Start Time' }, ...timeOptions]}
                  value={filters.startTime}
                  onChange={(value) => handleFilterChange('startTime', value)}
                  clearable
                  radius="xl"
                  size="md"
                  styles={{
                    input: {
                      fontFamily: "'Inter', sans-serif",
                      border: '1px solid #e2e8f0',
                      '&:focus': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)'
                      }
                    },
                    item: {
                      fontFamily: "'Inter', sans-serif",
                      borderRadius: '6px',
                      '&[data-selected]': {
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        fontWeight: 500,
                      }
                    }
                  }}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
                <Group spacing="xs" mb={6}>
                  <Box style={{ color: "#3b82f6" }}>
                    <IconClock size={16} />
                  </Box>
                  <Text 
                    fw={600} 
                    size="xs"
                    style={{ 
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      color: '#64748b'
                    }}
                  >
                    To Time
                  </Text>
                </Group>
                <Select
                  placeholder="End Time"
                  data={[{ value: '', label: 'End Time' }, ...timeOptions]}
                  value={filters.endTime}
                  onChange={(value) => handleFilterChange('endTime', value)}
                  clearable
                  radius="xl"
                  size="md"
                  styles={{
                    input: {
                      fontFamily: "'Inter', sans-serif",
                      border: '1px solid #e2e8f0',
                      '&:focus': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)'
                      }
                    },
                    item: {
                      fontFamily: "'Inter', sans-serif",
                      borderRadius: '6px',
                      '&[data-selected]': {
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        fontWeight: 500,
                      }
                    }
                  }}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12 }} mt={5}>
                <Group position="right">
                  <Button 
                    variant="light" 
                    onClick={handleClearFilters}
                    leftIcon={<IconX size={16} />}
                    radius="xl"
                    color="gray"
                    style={{
                      fontFamily: "'Inter', sans-serif", 
                      fontWeight: 500
                    }}
                  >
                    Clear Filters
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Accident Logs Table */}
          <Paper shadow="md" radius="md" style={{ overflow: 'hidden' }}>
            <ScrollArea>
              <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
                <Table.Thead style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                  <Table.Tr>
                    <Table.Th style={{ 
                      textAlign: 'center',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#64748b',
                      fontWeight: 600,
                      padding: '16px 12px'
                    }}>Video</Table.Th>
                    <Table.Th style={{ 
                      textAlign: 'center',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#64748b',
                      fontWeight: 600,
                      padding: '16px 12px'
                    }}>Location</Table.Th>
                    <Table.Th style={{ 
                      textAlign: 'center',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#64748b',
                      fontWeight: 600,
                      padding: '16px 12px'
                    }}>Date</Table.Th>
                    <Table.Th style={{ 
                      textAlign: 'center',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#64748b',
                      fontWeight: 600,
                      padding: '16px 12px'
                    }}>Time</Table.Th>
                    <Table.Th style={{ 
                      textAlign: 'center',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#64748b',
                      fontWeight: 600,
                      padding: '16px 12px'
                    }}>Severity</Table.Th>
                    <Table.Th style={{ 
                      textAlign: 'center',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#64748b',
                      fontWeight: 600,
                      padding: '16px 12px'
                    }}>Description</Table.Th>
                    <Table.Th style={{ 
                      textAlign: 'center',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#64748b',
                      fontWeight: 600,
                      padding: '16px 12px'
                    }}>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredLogs
                    .slice()
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((log, index) => (
                      <Table.Tr
                        key={index}
                        style={{
                          backgroundColor: selectedRowIndex === index ? 'rgba(59, 130, 246, 0.05)' : 
                            log.status === "assigned" ? 'rgba(241, 245, 249, 0.8)' : 
                            'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          animation: log.status !== "assigned" ? 'pulse 2s infinite' : 'none'
                        }}
                        onClick={() => handleRowClick(index)}
                        onDoubleClick={() => handleRowDoubleClick(log)}
                      >
                        <Table.Td style={{ textAlign: 'center', padding: '12px' }}>
                          <Tooltip label="View video" position="top">
                            <ActionIcon 
                              component="a" 
                              href={log.video} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              variant="light" 
                              color="blue"
                              radius="xl"
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Text fw={500} style={{ fontFamily: "'Inter', sans-serif" }}>{log.location}</Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Text style={{ fontFamily: "'Inter', sans-serif" }}>{log.displayDate}</Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Text style={{ fontFamily: "'Inter', sans-serif" }}>{log.displayTime}</Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Badge 
                            color={getSeverityColor(log.severity)}
                            radius="xl"
                            size="sm"
                            px="xs"
                            style={{ 
                              fontFamily: "'Inter', sans-serif",
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              fontSize: '10px'
                            }}
                          >
                            {log.severity}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Text lineClamp={1} style={{ fontFamily: "'Inter', sans-serif" }}>
                            {log.description || "No description"}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          {log.status === "assigned" && log.assignedTo !== user?.username ? (
                            <Button 
                              size="xs" 
                              variant="subtle" 
                              color="gray" 
                              disabled
                              radius="xl"
                              style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px' }}
                            >
                              Assigned to {log.assignedTo}
                            </Button>
                          ) : (
                            <Button
                              size="xs"
                              variant={log.status === "assigned" ? "outline" : "filled"}
                              color={log.status === "assigned" ? "red" : "blue"}
                              radius="xl"
                              style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px' }}
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
        </Box>
      </Paper>
    </Container>
  );
};

export default AccidentLog;
