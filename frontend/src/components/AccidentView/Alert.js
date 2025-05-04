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
  useMantineTheme,
  rgba,
  Paper,
  Avatar
} from '@mantine/core';
import { IconEdit, IconCheck, IconX, IconCamera, IconMapPin, IconCalendar, IconClock, IconAlertTriangle, IconCheckbox } from '@tabler/icons-react';

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
      <Box py={50} ta="center">
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

  // Helper to get badge color based on severity
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'blue';
      default: return 'gray';
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
    <Stack spacing="md">
      {/* Title and Status Badge */}
      <Group position="apart" mb="xs">
        <Title order={3} fw={600} style={{ fontFamily: "'DM Sans', sans-serif" }}>Accident Details</Title>
        <Badge 
          size="lg" 
          color={getStatusColor(selectedAlert.status)}
          variant="filled"
          radius="xl"
          px="md"
          style={{ fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}
        >
          {selectedAlert.status}
        </Badge>
      </Group>
      
      {/* Main Content - Video and Details Side by Side */}
      <Grid>
        {/* Video Column */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          {selectedAlert.video ? (
            <Box
              style={{
                position: 'relative',
                paddingBottom: '56.25%', // 16:9 aspect ratio
                height: 0,
                overflow: 'hidden',
                borderRadius: theme.radius.md,
              }}
              mb={{ base: "md", md: 0 }}
            >
              <iframe
                src={getEmbedUrl(selectedAlert.video)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: '1px solid ' + theme.colors.gray[3],
                  borderRadius: theme.radius.md,
                }}
                allowFullScreen
                title="Accident Video"
              ></iframe>
            </Box>
          ) : (
            <Box py={50} ta="center">
              <Text size="md" c="dimmed">No video available</Text>
            </Box>
          )}
        </Grid.Col>
        
        {/* Details Column - REDESIGNED */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="lg" shadow="sm" style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.9) 100%)',
            borderLeft: '4px solid #3b82f6',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Visual design element */}
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
            
            <Stack spacing="lg" style={{ position: 'relative', zIndex: 1 }}>
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
              <DetailItem 
                icon={<IconAlertTriangle size={20} />}
                label="Severity" 
                value={
                  isEditable ? (
                    <Select
                      value={selectedSeverity}
                      onChange={handleSeverityChange}
                      radius="xl"
                      data={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' }
                      ]}
                      styles={{
                        input: {
                          border: `1px solid ${theme.colors[getSeverityColor(selectedSeverity)][5]}`,
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500
                        }
                      }}
                    />
                  ) : (
                    <Badge 
                      color={getSeverityColor(selectedAlert.severity)} 
                      size="lg"
                      radius="xl"
                      variant="filled"
                      px="md"
                      style={{ 
                        fontFamily: "'Inter', sans-serif", 
                        textTransform: 'uppercase',
                        fontSize: '12px',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {selectedAlert.severity}
                    </Badge>
                  )
                }
                variant="modern" 
              />
              
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
                      
                      {/* Action Buttons */}
                      {isEditable && (
                        <Group position="right" mt="md">
                          <Button
                            size="sm"
                            variant="outline"
                            radius="xl"
                            color={selectedAlert.falsePositive ? "green" : "red"}
                            onClick={handleToggleAccidentMark}
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                          >
                            {selectedAlert.falsePositive ? "An Accident" : "Not an Accident"}
                          </Button>
                          
                          {selectedAlert.status !== "handled" && (
                            <Button
                              size="sm"
                              radius="xl"
                              color="green"
                              onClick={handleMarkAsHandled}
                              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                            >
                              Handled
                            </Button>
                          )}
                        </Group>
                      )}
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
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
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
