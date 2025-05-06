import React, { useState, useEffect } from "react";
import { useAuth } from "../../authentication/AuthProvider";
import { useAccidentLogs } from "../../context/AccidentContext";
import { 
  Box, 
  Text, 
  Group, 
  Select, 
  Textarea, 
  Button, 
  Badge, 
  Stack, 
  Grid, 
  ActionIcon, 
  Divider, 
  Paper,
  useMantineTheme
} from '@mantine/core';
import { IconEdit, IconCheck, IconX, IconCamera, IconMapPin, IconCalendar, IconClock, IconAlertTriangle, IconCheckbox, IconChevronDown } from '@tabler/icons-react';
import './Alert.css';

// Helper function to convert a standard Google Drive URL to an embeddable URL
const getEmbedUrl = (url) => {
  if (!url) return "";
  // Extract the file ID from a URL of the form:
  // https://drive.google.com/file/d/FILE_ID/view
  const match = url.match(/\/d\/([^\/]+)\//);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
};

const Alert = () => {
  const { user } = useAuth();
  const {
    selectedAlert,
    updateAccidentDetails,
    updateAccidentStatus,
    clearSelectedAlert,
  } = useAccidentLogs();
  const [descEditMode, setDescEditMode] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("low");
  const theme = useMantineTheme();

  useEffect(() => {
    if (selectedAlert) {
      setNewDescription(selectedAlert.description || "");
      setSelectedSeverity(selectedAlert.severity || "low");
    }
  }, [selectedAlert]);

  if (!selectedAlert) {
    return (
      <Box py={50} ta="center" className="no-accident-selected">
        <Text size="lg" c="dimmed">No accident selected</Text>
        <Text size="sm" c="dimmed" mt="xs">Select an accident from the logs to view details</Text>
      </Box>
    );
  }

  const isEditable = selectedAlert.assignedTo === user.username;

  const handleSeverityChange = async (newVal) => {
    if (newVal === selectedSeverity) return;
    if (window.confirm(`Change severity from ${selectedSeverity} to ${newVal}?`)) {
      await updateAccidentDetails({ accident_id: selectedAlert._id, severity: newVal });
      setSelectedSeverity(newVal);
    }
  };

  const handleDescriptionSave = async () => {
    await updateAccidentDetails({ accident_id: selectedAlert._id, description: newDescription });
    setDescEditMode(false);
  };

  const handleToggleAccidentMark = async () => {
    if (window.confirm(
      selectedAlert.falsePositive
        ? "Mark as an accident?"
        : "Mark as not an accident?"
    )) {
      await updateAccidentDetails({
        accident_id: selectedAlert._id,
        falsePositive: !selectedAlert.falsePositive,
      });
    }
  };

  const handleMarkAsHandled = async () => {
    if (window.confirm("Mark this accident as handled?")) {
      await updateAccidentStatus(selectedAlert._id, "handled");
      clearSelectedAlert();
    }
  };

  // Helper to get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'handled': return 'success';
      case 'pending': return 'warning';
      case 'new': return 'danger';
      default: return 'gray';
    }
  };

  return (
    <Box id="accident-details" className="accident-details-box">
      <Paper p="lg" radius="lg" shadow="sm" className="accident-details-paper">
        {/* Visual design elements */}
        <Box className="design-circle design-circle-top-right" />
        <Box className="design-circle design-circle-bottom-left" />
        
        <Stack spacing="md" className="content-stack">
          {/* Title and Status Badge */}
          <Group position="apart" mb="md">
            <Badge 
              size="lg" 
              color={getStatusColor(selectedAlert.status)}
              variant="filled"
              radius="xl"
              px="md"
              className="status-badge"
            >
              {selectedAlert.status === "assigned" 
                ? `ASSIGNED TO ${selectedAlert.assignedTo?.toUpperCase() || ""}` 
                : selectedAlert.status?.toUpperCase()}
            </Badge>
          </Group>
          
          {/* Main Content - Video and Details Side by Side */}
          <Grid>
            {/* Video Column */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              {selectedAlert.video ? (
                <Box
                  className="video-container"
                  mb={{ base: "md", md: 0 }}
                >
                  <iframe
                    src={getEmbedUrl(selectedAlert.video)}
                    className="video-iframe"
                    title="Accident Video"
                    allowFullScreen
                  />
                </Box>
              ) : (
                <Box className="no-video-container">
                  <Group position="center" spacing="xs">
                    <IconCamera size={24} />
                    <Text>No video available</Text>
                  </Group>
                </Box>
              )}
            </Grid.Col>
            
            {/* Details Column */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack spacing="xs" className="accident-info-stack">
                {/* First row - Camera & Location */}
                <Grid gutter="lg">
                  <Grid.Col span={6}>
                    <DetailItem 
                      icon={<IconCamera size={20} />}
                      label="Camera ID" 
                      value={selectedAlert.cameraId}
                      variant="modern"
                    />
                  </Grid.Col>
                  
                  <Grid.Col span={6}>
                    <DetailItem 
                      icon={<IconMapPin size={20} />}
                      label="Location" 
                      value={selectedAlert.location}
                      variant="modern" 
                    />
                  </Grid.Col>
                </Grid>
                
                {/* Second row - Date & Time */}
                <Grid gutter="lg">
                  <Grid.Col span={6}>
                    <DetailItem 
                      icon={<IconCalendar size={20} />}
                      label="Date" 
                      value={selectedAlert.displayDate}
                      variant="modern" 
                    />
                  </Grid.Col>
                  
                  <Grid.Col span={6}>
                    <DetailItem 
                      icon={<IconClock size={20} />}
                      label="Time" 
                      value={selectedAlert.displayTime}
                      variant="modern" 
                    />
                  </Grid.Col>
                </Grid>
                
                <Divider my="xs" style={{ opacity: 0.5 }} />
                
                {/* Third row - Severity */}
                <Box>
                  <Group spacing="xs" mb={6}>
                    <Box className="detail-item-icon">
                      <IconAlertTriangle size={20} />
                    </Box>
                    <Text className="detail-item-label">
                      Severity
                    </Text>
                  </Group>
                  
                  <Select
                    value={selectedSeverity}
                    onChange={handleSeverityChange}
                    placeholder="Select severity"
                    data={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' }
                    ]}
                    radius="xl"
                    size="md"
                    rightSection={<IconChevronDown size={16} style={{ color: theme.colors.gray[6] }} />}
                    className="severity-select"
                    styles={{
                      root: {
                        width: '25%'
                      },
                      dropdown: {
                        className: 'severity-dropdown'
                      },
                      item: {
                        className: 'severity-item'
                      }
                    }}
                    rightSectionWidth={40}
                  />
                  
                  {/* Visual color indicator based on selected severity */}
                  <Box className="severity-indicator">
                    <Box 
                      className="severity-indicator-dot"
                      style={{ 
                        backgroundColor: selectedSeverity === 'high' ? theme.colors.danger[5] : 
                                          selectedSeverity === 'medium' ? theme.colors.warning[5] : 
                                          theme.colors.brand[5]
                      }} 
                    />
                    <Text className="severity-indicator-text">
                      {selectedSeverity === 'high' ? 'High priority response needed' : 
                       selectedSeverity === 'medium' ? 'Moderate attention required' : 'Routine review'}
                    </Text>
                  </Box>
                </Box>
                
                {/* Fourth row - Accident Mark */}
                <DetailItem 
                  icon={<IconCheckbox size={20} />}
                  label="Accident Mark" 
                  value={
                    <Badge 
                      color={selectedAlert.falsePositive ? "red" : "success"} 
                      variant={selectedAlert.falsePositive ? "light" : "filled"}
                      size="lg"
                      radius="xl"
                      px="md"
                      className="accident-mark-badge"
                    >
                      {selectedAlert.falsePositive ? "Not an Accident" : "Accident"}
                    </Badge>
                  }
                  variant="modern" 
                />
                
                {/* Fifth row - Description */}
                <DetailItem 
                  icon={<IconEdit size={20} />}
                  label="Description" 
                  value={
                    !descEditMode ? (
                      <Stack spacing="xs">
                        <Group position="apart" noWrap>
                          <Text>
                            {selectedAlert.description || "No Description"}
                          </Text>
                          {isEditable && (
                            <ActionIcon 
                              onClick={() => setDescEditMode(true)}
                              color="blue"
                              variant="light"
                              radius="xl"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                      </Stack>
                    ) : (
                      <Stack spacing="xs">
                        <Textarea
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          minRows={2}
                          autosize
                          radius="md"
                          styles={{}}
                        />
                        <Group position="right">
                          <Button 
                            size="sm" 
                            variant="subtle" 
                            radius="xl"
                            leftIcon={<IconX size={16} />}
                            onClick={() => setDescEditMode(false)}
                            fw={500}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            radius="xl"
                            leftIcon={<IconCheck size={16} />}
                            onClick={handleDescriptionSave}
                            fw={500}
                          >
                            Save
                          </Button>
                        </Group>
                      </Stack>
                    )
                  }
                  variant="modern" 
                />
              </Stack>
            </Grid.Col>
          </Grid>
          
          {/* toggle button */}
          <Group position="right" mt="md">
            <Button
              size="md"
              variant="outline"
              radius="xl"
              color={selectedAlert.falsePositive ? "green" : "red"}
              fw={500}
              onClick={handleToggleAccidentMark}
            >
              {selectedAlert.falsePositive ? "Mark as Accident" : "Not an Accident"}
            </Button>
            
            {selectedAlert.status !== "handled" && (
              <Button
                size="md"
                radius="xl"
                color="green"
                onClick={handleMarkAsHandled}
                fw={500}
              >
                Handled
              </Button>
            )}
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
};

// Redesigned helper component for detail items
const DetailItem = ({ label, value, icon, variant = "default" }) => {
  if (variant === "modern") {
    return (
      <Box className="detail-item-container">
        <Group spacing="xs" mb={6}>
          {icon && (
            <Box className="detail-item-icon">
              {icon}
            </Box>
          )}
          <Text className="detail-item-label">
            {label}
          </Text>
        </Group>
        <Box ml={icon ? 28 : 0}>
          {typeof value === 'string' ? (
            <Text className="detail-item-value">
              {value}
            </Text>
          ) : value}
        </Box>
      </Box>
    );
  }
  
  // Default/original version
  return (
    <Box mb="xs">
      <Text fw={500} size="sm" c="dimmed">{label}</Text>
      <Box mt={4}>
        {typeof value === 'string' ? <Text>{value}</Text> : value}
      </Box>
    </Box>
  );
};

export default Alert;
