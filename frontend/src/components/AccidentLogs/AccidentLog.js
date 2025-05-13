import React, { useState } from "react";
import { useAccidentLogs } from "../../context/AccidentContext";
import { useAuth } from "../../authentication/AuthProvider";
import {
  Table,
  Button,
  Badge,
  Text,
  Paper,
  Box,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Container,
  Center
} from '@mantine/core';
import { 
  IconEye,
  IconAlertCircle,
  IconHistory
} from '@tabler/icons-react';
import './AccidentLog.css';

const AccidentLog = ({ 
  filteredLogs,
  renderActions,
  isHistoryView = false,
  handleRowDoubleClick: customHandleRowDoubleClick
}) => {
  const { accidentLogs, updateAccidentStatus, handleRowDoubleClick: originalHandleRowDoubleClick } = useAccidentLogs();
  const { user } = useAuth();
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // If filteredLogs not provided, use all logs from context
  const logsToDisplay = filteredLogs || accidentLogs;

  // Use custom handler if provided, otherwise use default with scroll behavior
  const handleRowDoubleClick = (log) => {
    if (customHandleRowDoubleClick) {
      // Use the custom handler from props
      customHandleRowDoubleClick(log);
    } else {
      // Use the original handler from context
      originalHandleRowDoubleClick(log);
    }
    
    // Scroll to accident details regardless of which handler was used
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

  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  // Function to truncate text to a specific length with ellipsis
  const truncateText = (text, maxLength = 20) => {
    if (!text) return "No description";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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

  // This is the component we'll render - without any outer title
  return (
    <Container fluid p={0} className="accident-log-container">
      <Paper radius="lg" p="xl" shadow="md" className="accident-log-paper">
        {/* Visual design elements */}
        <Box className="bg-bubble-1" />
        <Box className="bg-bubble-2" />
        
        <Box style={{ position: 'relative', zIndex: 1, width: '100%' }}>

          {/* Accident Logs Table */}
          <Paper shadow="md" radius="md" style={{ overflow: 'hidden', width: '100%' }}>
            <ScrollArea style={{ width: '100%' }}>
              <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm" className="accident-log-table">
                <Table.Thead style={{ backgroundColor: `rgba(59, 130, 246, 0.05)` }}>
                  <Table.Tr>
                    <Table.Th>Video</Table.Th>
                    <Table.Th>Location</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Time</Table.Th>
                    <Table.Th>Severity</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {logsToDisplay.length > 0 ? (
                    logsToDisplay
                    .slice()
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((log, index) => (
                      <Table.Tr
                        key={index}
                          className={`accident-row ${selectedRowIndex === index ? 'accident-row-selected' : ''} ${
                            isHistoryView 
                              ? 'accident-row-handled' 
                              : log.status === "assigned" 
                                ? 'accident-row-assigned' 
                                : 'accident-row-active'
                          }`}
                        onClick={() => handleRowClick(index)}
                        onDoubleClick={() => handleRowDoubleClick(log)}
                      >
                        <Table.Td>
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
                        <Table.Td>
                          <Text fw={500}>{log.location}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text>{log.displayDate}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text>{log.displayTime}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={getSeverityColor(log.severity)}
                            radius="xl"
                            size="sm"
                            px="xs"
                            tt="uppercase"
                            fz="10px"
                            lts="0.5px"
                          >
                            {log.severity}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Tooltip label={log.description || "No description"} position="top">
                            <Text>
                              {truncateText(log.description)}
                            </Text>
                          </Tooltip>
                        </Table.Td>
                        <Table.Td>
                          {renderActions ? (
                            renderActions(log, index)
                          ) : (
                            // Default action column
                            <>
                              {log.status === "assigned" && log.assignedTo !== user?.username ? (
                                <Button 
                                  size="xs" 
                                  variant="subtle" 
                                  color="gray" 
                                  disabled
                                  radius="xl"
                                  fz="11px"
                                >
                                  Assigned to {log.assignedTo}
                                </Button>
                              ) : (
                                <Button
                                  size="xs"
                                  variant={log.status === "assigned" ? "outline" : "filled"}
                                  color={log.status === "assigned" ? "red" : "blue"}
                                  radius="xl"
                                  fz="11px"
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
                            </>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Center py="xl">
                          <Box style={{ textAlign: 'center' }}>
                            {isHistoryView ? (
                              <>
                                <IconHistory size={32} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                                <Text size="lg" fw={500}>No handled accidents found</Text>
                                <Text size="sm" c="dimmed" mt="xs">Accidents marked as handled will appear here</Text>
                              </>
                            ) : (
                              <>
                                <IconAlertCircle size={32} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                                <Text size="lg" fw={500}>No accident logs found</Text>
                                <Text size="sm" c="dimmed" mt="xs">There are no accidents matching your criteria</Text>
                              </>
                            )}
                          </Box>
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  )}
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
