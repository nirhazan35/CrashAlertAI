import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Text,
  Grid,
  Group,
  Badge,
  ActionIcon,
  Stack,
  Divider,
  Select,
  Button,
  Loader,
  Modal,
  Tooltip
} from '@mantine/core';
import {
  IconCamera,
  IconMapPin,
  IconFilter,
  IconMaximize,
  IconAlertTriangle,
  IconDeviceCctv,
  IconLayoutGrid,
  IconList,
  IconRefresh,
  IconPlayerPause,
  IconClock,
  IconCheck
} from '@tabler/icons-react';
import { useAuth } from "../../authentication/AuthProvider";
import './LiveCameraPage.css';

const LiveCameraFeed = () => {
  // State for cameras and UI
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCamera, setExpandedCamera] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeFilters, setActiveFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch cameras from the backend API
  const fetchCameras = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch cameras from backend
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/cameras/get-cameras`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cameras: ${response.status}`);
      }

      const cameraData = await response.json();
      // Transform the data to match our component's expected format
      const formattedCameras = cameraData.map(camera => {
        // Determine camera status based on data (online/offline/maintenance)
        const status = determineStatus(camera);

        // Calculate risk level based on active accidents
        const riskLevel = calculateRiskLevel(camera.activeAccidents);

        // Determine last incident time from accident history
        const lastIncident = determineLastIncident(camera.accidentHistory);

        return {
          id: camera.cameraId,
          name: `Camera ${camera.cameraId}`, // Using cameraId as name, adjust as needed
          location: camera.location,
          status: status,
          lastUpdated: new Date(camera.date),
          feed: status === 'online' ? `https://www.example.com/stream/${camera.cameraId}` : null, // Placeholder URL
          riskLevel: riskLevel,
          lastIncident: lastIncident,
          // Keep raw data for any additional processing
          rawData: camera
        };
      });

      setCameras(formattedCameras);

      // Extract unique locations for filter
      const uniqueLocations = [...new Set(formattedCameras.map(camera => camera.location))];
      setLocations(uniqueLocations);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      setError('Failed to load camera data. Please try again.');
      setLoading(false);
    }
  }, [user]);

  // Helper function to determine camera status
  const determineStatus = (camera) => {
    // This is a placeholder logic - replace with your actual status determination
    // For example, you might have a status field in your camera model
    // or determine it based on last update time or active accidents

    // For now, we'll simulate a status based on camera ID
    const cameraIdNum = parseInt(camera.cameraId.replace(/\D/g, ''), 10);

    if (isNaN(cameraIdNum)) return 'online'; // Default to online if parsing fails

    if (cameraIdNum % 5 === 0) return 'maintenance';
    if (cameraIdNum % 7 === 0) return 'offline';
    return 'online';
  };

  // Helper function to calculate risk level based on active accidents
  const calculateRiskLevel = (activeAccidents) => {
    if (!activeAccidents || !Array.isArray(activeAccidents)) return 'low';

    const accidentCount = activeAccidents.length;

    if (accidentCount >= 3) return 'high';
    if (accidentCount >= 1) return 'medium';
    return 'low';
  };

  // Helper function to determine the time of the last incident
  const determineLastIncident = (accidentHistory) => {
    if (!accidentHistory || !Array.isArray(accidentHistory) || accidentHistory.length === 0) {
      return 'No recent incidents';
    }

    // This is a placeholder - normally you would sort accident history and get the most recent
    // For demonstration purposes, we'll return a relative time

    const randomHours = Math.floor(Math.random() * 72); // Random time within last 3 days

    if (randomHours < 1) return 'Less than an hour ago';
    if (randomHours < 24) return `${randomHours} hours ago`;
    return `${Math.floor(randomHours / 24)} days ago`;
  };

  // Fetch cameras on component mount
  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  // Helper to format date and time
  const formatDateTime = (date) => {
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Filter cameras based on selection
  const filteredCameras = cameras.filter(camera => {
    const locationMatch = filterLocation === 'all' || camera.location === filterLocation;
    const statusMatch = filterStatus === 'all' || camera.status === filterStatus;
    return locationMatch && statusMatch;
  });

  // Toggle expanded view for a camera
  const handleExpandCamera = (camera) => {
    setExpandedCamera(camera);
  };

  // Helper to get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'success';
      case 'offline': return 'danger';
      case 'maintenance': return 'warning';
      default: return 'gray';
    }
  };

  // Helper to get risk level color
  const getRiskLevelColor = (level) => {
    switch(level) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterLocation('all');
    setFilterStatus('all');
    setActiveFilters(false);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setActiveFilters(filterLocation !== 'all' || filterStatus !== 'all');
    setShowFilters(false);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchCameras();
  };

  // Render camera grid view
  const renderCameraGrid = () => {
    return (
      <Grid gutter="lg">
        {filteredCameras.map(camera => (
          <Grid.Col key={camera.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Paper p="md" radius="lg" shadow="sm" className="camera-feed-paper">
              {/* Camera Feed */}
              <Box className="camera-feed-container">
                {camera.status === 'online' ? (
                  <Box className="camera-video-container">
                    {/* Replace with actual video feed component */}
                    <Box className="camera-placeholder">
                      <IconDeviceCctv size={40} opacity={0.3} />
                      <Text size="sm" mt="xs" c="dimmed" align="center">Live Feed</Text>
                    </Box>

                    {/* Controls overlay */}
                    <Group className="camera-controls-overlay" position="apart">
                      <Badge
                        color={getStatusColor(camera.status)}
                        variant="filled"
                        radius="xl"
                        px="md"
                        className="camera-status-badge"
                      >
                        {camera.status.toUpperCase()}
                      </Badge>

                      <Group spacing={4}>
                        <ActionIcon
                          variant="transparent"
                          color="white"
                          onClick={() => handleExpandCamera(camera)}
                        >
                          <IconMaximize size={18} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Box>
                ) : (
                  <Box className="camera-offline-container">
                    <IconDeviceCctv size={40} opacity={0.5} />
                    <Text size="sm" mt="xs" fw={500}>
                      {camera.status === 'offline' ? 'Camera Offline' : 'Under Maintenance'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Last online: {formatDateTime(camera.lastUpdated).date} at {formatDateTime(camera.lastUpdated).time}
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Camera Info */}
              <Box mt="md">
                <Group position="apart" mb="xs">
                  <Text fw={700}>{camera.name}</Text>
                  <Badge
                    color={getRiskLevelColor(camera.riskLevel)}
                    variant="light"
                    radius="xl"
                    size="sm"
                  >
                    {camera.riskLevel.toUpperCase()} RISK
                  </Badge>
                </Group>

                <Group position="apart" spacing="sm">
                  <Group spacing="xs">
                    <IconMapPin size={14} />
                    <Text size="sm">{camera.location}</Text>
                  </Group>

                  <Group spacing="xs">
                    <IconAlertTriangle size={14} />
                    <Text size="sm">Last incident: {camera.lastIncident}</Text>
                  </Group>
                </Group>
              </Box>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    );
  };

  // Render camera list view
  const renderCameraList = () => {
    return (
      <Stack spacing="md">
        {filteredCameras.map(camera => (
          <Paper key={camera.id} p="md" radius="lg" shadow="sm" className="camera-list-item">
            <Grid gutter="lg">
              {/* Camera Feed Preview */}
              <Grid.Col span={{ base: 12, sm: 4, md: 3 }}>
                <Box className="camera-list-preview">
                  {camera.status === 'online' ? (
                    <Box className="camera-video-container">
                      {/* Replace with actual video feed component */}
                      <Box className="camera-placeholder">
                        <IconDeviceCctv size={30} opacity={0.3} />
                      </Box>

                      {/* Status badge */}
                      <Badge
                        color={getStatusColor(camera.status)}
                        variant="filled"
                        radius="xl"
                        size="sm"
                        px="md"
                        className="camera-status-badge-list"
                      >
                        {camera.status.toUpperCase()}
                      </Badge>
                    </Box>
                  ) : (
                    <Box className="camera-offline-container">
                      <IconDeviceCctv size={30} opacity={0.5} />
                      <Text size="xs" mt="xs" fw={500}>
                        {camera.status === 'offline' ? 'Offline' : 'Maintenance'}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Grid.Col>

              {/* Camera Details */}
              <Grid.Col span={{ base: 12, sm: 8, md: 9 }}>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 7 }}>
                    <Group position="apart">
                      <Text fw={700}>{camera.name}</Text>
                      <Badge
                        color={getRiskLevelColor(camera.riskLevel)}
                        variant="light"
                        radius="xl"
                        size="sm"
                      >
                        {camera.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </Group>

                    <Group spacing="lg" mt="xs">
                      <Group spacing="xs">
                        <IconMapPin size={14} />
                        <Text size="sm">{camera.location}</Text>
                      </Group>

                      <Group spacing="xs">
                        <IconClock size={14} />
                        <Text size="sm">
                          {formatDateTime(camera.lastUpdated).time}
                        </Text>
                      </Group>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 5 }}>
                    <Group position="apart" style={{ height: '100%' }}>
                      <Group spacing="xs">
                        <IconAlertTriangle size={14} />
                        <Text size="sm">Last incident: {camera.lastIncident}</Text>
                      </Group>

                      <Button
                        variant="light"
                        radius="xl"
                        size="xs"
                        rightIcon={<IconMaximize size={14} />}
                        onClick={() => handleExpandCamera(camera)}
                      >
                        Expand
                      </Button>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Grid.Col>
            </Grid>
          </Paper>
        ))}
      </Stack>
    );
  };

  return (
    <Box className="live-camera-feed">
      {/* Header with title and controls */}
      <Paper p="lg" radius="lg" shadow="sm" className="camera-header-paper">
        <Group position="apart" mb="md">
          <Group>
            <IconDeviceCctv size={24} />
            <Text size="xl" fw={700}>Live Camera Feeds</Text>
          </Group>

          <Group spacing="xs">
            <Button
              variant="outline"
              radius="xl"
              size="sm"
              leftIcon={<IconFilter size={16} />}
              onClick={() => setShowFilters(true)}
              color={activeFilters ? "brand" : "gray"}
              className={activeFilters ? "active-filter-button" : ""}
            >
              Filter
            </Button>

            <Button
              variant="outline"
              radius="xl"
              size="sm"
              leftIcon={<IconRefresh size={16} />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>

            <Group spacing={8} className="view-toggle-group">
              <Tooltip label="Grid View">
                <ActionIcon
                  variant={viewMode === 'grid' ? "filled" : "outline"}
                  color="brand"
                  onClick={() => setViewMode('grid')}
                >
                  <IconLayoutGrid size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="List View">
                <ActionIcon
                  variant={viewMode === 'list' ? "filled" : "outline"}
                  color="brand"
                  onClick={() => setViewMode('list')}
                >
                  <IconList size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Group>

        {/* Status summary */}
        <Group spacing="md">
          <Badge variant="dot" color="success" size="lg">
            {cameras.filter(c => c.status === 'online').length} Online
          </Badge>

          <Badge variant="dot" color="danger" size="lg">
            {cameras.filter(c => c.status === 'offline').length} Offline
          </Badge>

          <Badge variant="dot" color="warning" size="lg">
            {cameras.filter(c => c.status === 'maintenance').length} Maintenance
          </Badge>
        </Group>
      </Paper>

      {/* Main content */}
      <Box mt="md">
        {loading ? (
          <Paper p="xl" radius="lg" shadow="sm" className="loading-container">
            <Stack align="center" spacing="md">
              <Loader size="lg" />
              <Text>Loading camera feeds...</Text>
            </Stack>
          </Paper>
        ) : error ? (
          <Paper p="xl" radius="lg" shadow="sm" className="error-container">
            <Stack align="center" spacing="md">
              <IconAlertTriangle size={48} color="red" />
              <Text size="lg" color="red">{error}</Text>
              <Button
                variant="outline"
                radius="xl"
                leftIcon={<IconRefresh size={16} />}
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </Stack>
          </Paper>
        ) : filteredCameras.length > 0 ? (
          viewMode === 'grid' ? renderCameraGrid() : renderCameraList()
        ) : (
          <Paper p="xl" radius="lg" shadow="sm" className="no-results-container">
            <Stack align="center" spacing="md">
              <IconCamera size={48} opacity={0.5} />
              <Text size="lg">No cameras found</Text>
              <Text size="sm" c="dimmed" align="center">
                No cameras match your current filters. Try adjusting your filters or adding new cameras.
              </Text>
              <Button
                variant="outline"
                radius="xl"
                leftIcon={<IconRefresh size={16} />}
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </Stack>
          </Paper>
        )}
      </Box>

      {/* Expanded Camera Modal */}
      <Modal
        opened={expandedCamera !== null}
        onClose={() => setExpandedCamera(null)}
        title={expandedCamera?.name || 'Camera Feed'}
        size="xl"
        radius="lg"
        padding="lg"
        className="camera-modal"
      >
        {expandedCamera && (
          <Stack spacing="md">
            {/* Video Feed */}
            <Box className="expanded-camera-container">
              {expandedCamera.status === 'online' ? (
                <Box className="expanded-video-container">
                  {/* Replace with actual video feed component */}
                  <Box className="camera-placeholder expanded">
                    <IconDeviceCctv size={64} opacity={0.3} />
                    <Text size="md" mt="md" c="dimmed" align="center">Live Feed</Text>
                  </Box>

                  {/* Video controls */}
                  <Group position="center" spacing="lg" className="expanded-video-controls">
                    <ActionIcon variant="filled" color="white" radius="xl" size="lg">
                      <IconPlayerPause size={20} />
                    </ActionIcon>
                  </Group>
                </Box>
              ) : (
                <Box className="camera-offline-container expanded">
                  <IconDeviceCctv size={64} opacity={0.5} />
                  <Text size="lg" mt="md" fw={500}>
                    {expandedCamera.status === 'offline' ? 'Camera Offline' : 'Under Maintenance'}
                  </Text>
                  <Text c="dimmed">
                    Last online: {formatDateTime(expandedCamera.lastUpdated).date} at {formatDateTime(expandedCamera.lastUpdated).time}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Camera Details */}
            <Grid gutter="md">
              {/* Left Column */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack spacing="sm">
                  <Group spacing="xs">
                    <IconCamera size={18} />
                    <Text fw={500}>Camera ID</Text>
                  </Group>
                  <Text ml={26}>{expandedCamera.id}</Text>

                  <Divider my="xs" />

                  <Group spacing="xs">
                    <IconMapPin size={18} />
                    <Text fw={500}>Location</Text>
                  </Group>
                  <Text ml={26}>{expandedCamera.location}</Text>
                </Stack>
              </Grid.Col>

              {/* Right Column */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack spacing="sm">
                  <Group spacing="xs">
                    <IconAlertTriangle size={18} />
                    <Text fw={500}>Risk Level</Text>
                  </Group>
                  <Badge
                    ml={26}
                    color={getRiskLevelColor(expandedCamera.riskLevel)}
                    variant="light"
                    radius="xl"
                    size="lg"
                    px="lg"
                  >
                    {expandedCamera.riskLevel.toUpperCase()}
                  </Badge>

                  <Divider my="xs" />

                  <Group spacing="xs">
                    <IconClock size={18} />
                    <Text fw={500}>Last Incident</Text>
                  </Group>
                  <Text ml={26}>{expandedCamera.lastIncident}</Text>
                </Stack>
              </Grid.Col>
            </Grid>

            {/* Action buttons */}
            <Group position="right" mt="md">
              <Button
                variant="light"
                radius="xl"
                leftIcon={<IconCheck size={16} />}
                onClick={() => setExpandedCamera(null)}
              >
                Done
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Filters Modal */}
      <Modal
        opened={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Cameras"
        size="md"
        radius="lg"
        padding="lg"
      >
        <Stack spacing="md">
          <Select
            label="Location"
            placeholder="Select location"
            data={[
              { value: 'all', label: 'All Locations' },
              ...locations.map(loc => ({ value: loc, label: loc }))
            ]}
            value={filterLocation}
            onChange={setFilterLocation}
            radius="md"
          />

          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: 'all', label: 'All Statuses' },
              { value: 'online', label: 'Online' },
              { value: 'offline', label: 'Offline' },
              { value: 'maintenance', label: 'Maintenance' }
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            radius="md"
          />

          <Group position="right" mt="md">
            <Button
              variant="subtle"
              radius="xl"
              onClick={handleResetFilters}
            >
              Reset
            </Button>

            <Button
              radius="xl"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default LiveCameraFeed;