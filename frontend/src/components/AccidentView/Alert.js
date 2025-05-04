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
  rgba
} from '@mantine/core';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react';

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
        <Title order={3} fw={600}>Accident Details</Title>
        <Badge 
          size="lg" 
          color={getStatusColor(selectedAlert.status)}
          variant="filled"
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
        
        {/* Details Column */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Grid>
            <Grid.Col span={6}>
              <Stack spacing="xs">
                <DetailItem 
                  label="Camera ID" 
                  value={selectedAlert.cameraId} 
                />
                
                <DetailItem 
                  label="Location" 
                  value={selectedAlert.location} 
                />
                
                <DetailItem 
                  label="Date" 
                  value={selectedAlert.displayDate} 
                />
                
                <DetailItem 
                  label="Time" 
                  value={selectedAlert.displayTime} 
                />
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <Stack spacing="xs">
                <DetailItem 
                  label="Severity" 
                  value={
                    isEditable ? (
                      <Select
                        value={selectedSeverity}
                        onChange={handleSeverityChange}
                        data={[
                          { value: 'low', label: 'Low' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'high', label: 'High' }
                        ]}
                        styles={{
                          input: {
                            border: `1px solid ${theme.colors[getSeverityColor(selectedSeverity)][5]}`,
                          }
                        }}
                      />
                    ) : (
                      <Badge color={getSeverityColor(selectedAlert.severity)} size="md">
                        {selectedAlert.severity}
                      </Badge>
                    )
                  } 
                />
                
                <DetailItem 
                  label="Accident Mark" 
                  value={
                    <Badge 
                      color={selectedAlert.falsePositive ? "red" : "success"} 
                      variant={selectedAlert.falsePositive ? "light" : "filled"}
                      size="md"
                    >
                      {selectedAlert.falsePositive ? "Not an Accident" : "Accident"}
                    </Badge>
                  } 
                />
                
                <DetailItem 
                  label="Description" 
                  value={
                    !descEditMode ? (
                      <Stack spacing="xs">
                        <Group position="apart" noWrap>
                          <Text>{selectedAlert.description || "No Description"}</Text>
                          {isEditable && (
                            <ActionIcon 
                              onClick={() => setDescEditMode(true)}
                              color="blue"
                              variant="subtle"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                        
                        {/* Action Buttons */}
                        {isEditable && (
                          <Group position="right" mt="xs">
                            <Button
                              size="xs"
                              variant="outline"
                              color={selectedAlert.falsePositive ? "green" : "red"}
                              onClick={handleToggleAccidentMark}
                            >
                              {selectedAlert.falsePositive ? "An Accident" : "Not an Accident"}
                            </Button>
                            
                            {selectedAlert.status !== "handled" && (
                              <Button
                                size="xs"
                                color="green"
                                onClick={handleMarkAsHandled}
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
                        />
                        <Group position="right">
                          <Button 
                            size="xs" 
                            variant="subtle" 
                            leftIcon={<IconX size={16} />}
                            onClick={() => setDescEditMode(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="xs" 
                            leftIcon={<IconCheck size={16} />}
                            onClick={handleDescriptionSave}
                          >
                            Save
                          </Button>
                        </Group>
                      </Stack>
                    )
                  } 
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

// Helper component for detail items
const DetailItem = ({ label, value }) => (
  <Box mb="xs">
    <Text fw={500} size="sm" c="dimmed">{label}</Text>
    <Box mt={4}>
      {typeof value === 'string' ? <Text>{value}</Text> : value}
    </Box>
  </Box>
);

export default Alert;
