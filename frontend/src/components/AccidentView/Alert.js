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
  Title,
  ActionIcon, 
  Divider, 
  Paper
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
            <Title order={3} fw={600} className="accident-details-title">Accident Details</Title>
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
                    <Box style={{ color: "#3b82f6" }}>
                      <IconAlertTriangle size={20} />
                    </Box>
                    <Text 
                      fw={600} 
                      size="sm" 
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
                    rightSection={<IconChevronDown size={16} style={{ color: '#64748b' }} />}
                    styles={{
                      root: {
                        width: '100%'
                      },
                      input: {
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        padding: '12px 16px',
                        fontSize: '15px',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#cbd5e1'
                        },
                        '&:focus': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)'
                        }
                      },
                      dropdown: {
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'white'
                      },
                      item: {
                        fontFamily: "'Inter', sans-serif",
                        borderRadius: '8px',
                        margin: '4px 6px',
                        padding: '8px 12px',
                        '&:hover': {
                          backgroundColor: 'rgba(59, 130, 246, 0.05)'
                        },
                        '&[data-selected]': {
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'rgba(59, 130, 246, 0.15)'
                          }
                        }
                      }
                    }}
                    rightSectionWidth={40}
                  />
                  
                  {/* Visual color indicator based on selected severity */}
                  <Box mt={8} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Box 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: selectedSeverity === 'high' ? '#ef4444' : 
                                          selectedSeverity === 'medium' ? '#f59e0b' : '#3b82f6'
                      }} 
                    />
                    <Text 
                      style={{ 
                        fontFamily: "'Inter', sans-serif", 
                        fontSize: '12px',
                        color: '#64748b'
                      }}
                    >
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
                      style={{ 
                        fontFamily: "'Inter', sans-serif", 
                        textTransform: 'uppercase',
                        fontSize: '12px',
                        letterSpacing: '0.5px'
                      }}
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
                          <Text style={{ fontFamily: "'Inter', sans-serif" }}>
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
                          styles={{
                            input: {
                              fontFamily: "'Inter', sans-serif",
                            }
                          }}
                        />
                        <Group position="right">
                          <Button 
                            size="sm" 
                            variant="subtle" 
                            radius="xl"
                            leftIcon={<IconX size={16} />}
                            onClick={() => setDescEditMode(false)}
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            radius="xl"
                            leftIcon={<IconCheck size={16} />}
                            onClick={handleDescriptionSave}
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
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
          
          {/* Fixed toggle button */}
          <Group position="right" mt="md">
            <Button
              size="md"
              variant="outline"
              radius="xl"
              color={selectedAlert.falsePositive ? "green" : "red"}
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
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
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
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
      <Box mb="xs">
        <Group spacing="xs" mb={6}>
          {icon && (
            <Box style={{ color: "#3b82f6" }}>
              {icon}
            </Box>
          )}
          <Text 
            fw={600} 
            size="sm" 
            style={{ 
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              fontSize: '11px',
              color: '#64748b'
            }}
          >
            {label}
          </Text>
        </Group>
        <Box ml={icon ? 28 : 0}>
          {typeof value === 'string' ? (
            <Text style={{ 
              fontFamily: "'Inter', sans-serif", 
              fontWeight: 500,
              fontSize: '16px'
            }}>
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
