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
import { IconEdit, IconCheck, IconX, IconCamera, IconMapPin, IconCalendar, IconClock, IconAlertTriangle, IconCheckbox, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import './Alert.css';

// Helper function to convert a standard Google Drive URL to an embeddable URL
const getEmbedUrl = (url) => {
  if (!url) return "";
  const match = url.match(/\/d\/([^/]+)\//);
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [localDescription, setLocalDescription] = useState("");
  const theme = useMantineTheme();
  const maxDescriptionLength = 60;

  useEffect(() => {
    if (selectedAlert) {
      setNewDescription(selectedAlert.description || "");
      setLocalDescription(selectedAlert.description || "");
      setSelectedSeverity(selectedAlert.severity || "low");
      setIsDescriptionExpanded(false);
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
  const isLongDescription = localDescription && localDescription.length > maxDescriptionLength;

  const handleSeverityChange = async (newVal) => {
    if (newVal === selectedSeverity) return;
    if (window.confirm(`Change severity from ${selectedSeverity} to ${newVal}?`)) {
      await updateAccidentDetails({ accident_id: selectedAlert._id, severity: newVal });
      setSelectedSeverity(newVal);
    }
  };

  const handleDescriptionSave = async () => {
    try {
      await updateAccidentDetails({ accident_id: selectedAlert._id, description: newDescription });
      // Update local state to match what was saved
      setLocalDescription(newDescription);
      setDescEditMode(false);
    } catch (error) {
      console.error("Error saving description:", error);
      alert("Failed to save description. Please try again.");
    }
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

  // Function to truncate text
  const truncateText = (text, maxLength = maxDescriptionLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
              
              {/* Action buttons moved below video */}
              {isEditable ? (
                <Group mt="lg" className="video-action-buttons">
                  <Button
                    size="sm"
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
                      size="sm"
                      radius="xl"
                      color="green"
                      onClick={handleMarkAsHandled}
                      fw={500}
                    >
                      Handled
                    </Button>
                  )}
                </Group>
              ):
                <Group mt="lg" className="video-action-buttons">
                    <Button
                        size="sm"
                        color="blue"
                        disabled
                        radius="xl"
                        fw={500}
                        onClick={(e) => {
                            updateAccidentStatus(
                                selectedAlert._id,
                                "assigned",
                            );
                        }}
                    >
                        Assign
                    </Button>
                </Group>
              }
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
                
                {/* Third row - Severity & Accident Status Side by Side */}
                <Grid align="center" gutter="lg">
                  <Grid.Col span={6}>
                    <Box>
                      <Group spacing="xs" mb={6}>
                        <Box className="detail-item-icon">
                          <IconAlertTriangle size={20} />
                        </Box>
                        <Text className="detail-item-label">
                          Severity
                        </Text>
                      </Group>
                      
                      {isEditable ? (
                        // Editable version - actual dropdown
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
                          styles={(theme) => ({
                            root: {
                              width: '100%'
                            },
                            input: {
                              border: '1px solid',
                              borderColor: theme.colors.gray[3],
                              '&:focus': {
                                borderColor: theme.colors.brand[5],
                                boxShadow: `0 0 0 2px ${(theme.colors.brand[5], 0.2)}`
                              }
                            }
                          })}
                          rightSectionWidth={40}
                        />
                      ) : (
                        // Read-only version - styled badge instead of disabled dropdown
                        <Box style={{ display: 'flex', width: '100%', marginTop: '8px', marginLeft: '27px' }}>
                          <Badge
                            color={
                              selectedSeverity === 'high' ? 'red' :
                              selectedSeverity === 'medium' ? 'orange' : 'blue'
                            }
                            variant="light"
                            size="lg"
                            radius="xl"
                            px="lg"
                            py={6}
                            style={{
                              textTransform: 'capitalize',
                              fontWeight: 500,
                              fontSize: '14px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              cursor: 'default'
                            }}
                          >
                            {selectedSeverity}
                          </Badge>
                        </Box>
                      )}
                      
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
                  </Grid.Col>
                  
                  {/* Accident Status on right side - now just the icon and badge */}
                  <Grid.Col span={6}>
                    <Box>
                      <Group spacing="md" align="center" mt={6}>
                        <Box className="detail-item-icon">
                          <IconCheckbox size={20} />
                        </Box>
                        <Badge 
                          color={selectedAlert.falsePositive ? "red" : "success"} 
                          variant={selectedAlert.falsePositive ? "light" : "filled"}
                          size="lg"
                          radius="xl"
                          px="lg"
                          py={6}
                          className="accident-mark-badge"
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          {selectedAlert.falsePositive ? "Not an Accident" : "Accident"}
                        </Badge>
                      </Group>
                    </Box>
                  </Grid.Col>
                </Grid>
                
                {/* Description with buttons */}
                <Box mt={12}>
                  <Group spacing="xs" mb={6} position="apart">
                    <Group spacing="xs">
                      <Box className="detail-item-icon">
                        <IconEdit size={20} />
                      </Box>
                      <Text className="detail-item-label">
                        Description
                      </Text>
                    </Group>
                    
                    {isEditable && !descEditMode && (
                      <ActionIcon 
                        onClick={() => setDescEditMode(true)}
                        color="blue"
                        variant="light"
                        radius="xl"
                        size="sm"
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                  
                  {!descEditMode ? (
                    <Box className="description-content">
                      {isLongDescription ? (
                        <Box ml={28} className="description-text-container">
                          <Text>
                            {isDescriptionExpanded 
                              ? localDescription 
                              : truncateText(localDescription, maxDescriptionLength)
                            }
                          </Text>
                          <Button 
                            variant="subtle" 
                            compact 
                            mt={4} 
                            px={0}
                            rightIcon={isDescriptionExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            size="xs"
                            className="description-toggle-button"
                          >
                            {isDescriptionExpanded ? "Show less" : "Read more"}
                          </Button>
                        </Box>
                      ) : (
                        <Text ml={28}>{localDescription || "No Description"}</Text>
                      )}
                    </Box>
                  ) : (
                    <Stack spacing="xs">
                      <Textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        minRows={2}
                        autosize
                        radius="md"
                        ml={28}
                        styles={(theme) => ({
                          root: { width: '100%' }
                        })}
                      />
                      <Group position="right">
                        <Button 
                          size="sm" 
                          variant="subtle" 
                          radius="xl"
                          leftIcon={<IconX size={16} />}
                          onClick={() => {
                            setNewDescription(localDescription);
                            setDescEditMode(false);
                          }}
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
                  )}
                </Box>
                {/* No extra space at the bottom */}
              </Stack>
            </Grid.Col>
          </Grid>
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
