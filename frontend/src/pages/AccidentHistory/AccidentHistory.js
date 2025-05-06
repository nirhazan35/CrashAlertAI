import React, { useState, useEffect } from 'react';
import { useAuth } from "../../authentication/AuthProvider";
import { 
  Text, 
  Table, 
  Badge, 
  Loader, 
  Alert,
  Paper,
  ScrollArea,
  Group,
  Title,
  Box,
  Container
} from '@mantine/core';
import { IconAlertCircle, IconHistory, IconCalendarStats } from '@tabler/icons-react';
import './AccidentHistory.css';

const AccidentHistory = () => {
  const { user } = useAuth();
  const [handledAccidents, setHandledAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getHandledAccidents = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/handled-accidents`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setHandledAccidents(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch handled accidents");
        }
      } catch (error) {
        console.error("Error fetching handled accidents:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      getHandledAccidents();
    }
  }, [user?.token]);

  // Helper to get severity badge color
  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Paper p="xl" radius="md" className="empty-state">
          <Loader size="md" color="blue" />
          <Text c="dimmed" size="md" mt="md">Loading accident history...</Text>
        </Paper>
      );
    }

    if (error) {
      return (
        <Paper p="xl" radius="md" className="fade-in">
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error Loading Accident History" 
            color="red"
            variant="filled"
            radius="md"
            className="fade-in"
          >
            {error}
          </Alert>
        </Paper>
      );
    }

    if (handledAccidents.length === 0) {
      return (
        <Paper p="xl" radius="md" className="empty-state">
          <IconHistory size={48} className="history-icon" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <Text c="dimmed" size="lg" fw={500}>No handled accidents found.</Text>
          <Text c="dimmed" size="sm" mt="xs">All handled accidents will appear here.</Text>
        </Paper>
      );
    }

    return (
      <Paper shadow="md" radius="md" style={{ overflow: 'hidden' }}>
        <ScrollArea>
          <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
            <Table.Thead className="history-table-header">
              <Table.Tr>
                <Table.Th className="history-table-heading">Camera ID</Table.Th>
                <Table.Th className="history-table-heading">Location</Table.Th>
                <Table.Th className="history-table-heading">Date</Table.Th>
                <Table.Th className="history-table-heading">Description</Table.Th>
                <Table.Th className="history-table-heading">Severity</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {handledAccidents.map((accident, index) => (
                <Table.Tr 
                  key={index}
                  className="table-hover-effect fade-in-delayed"
                  style={{ '--index': index }}
                >
                  <Table.Td className="history-table-cell history-table-cell-bold">
                    {accident.cameraId || 'N/A'}
                  </Table.Td>
                  <Table.Td className="history-table-cell history-table-cell-bold">
                    {accident.location || 'N/A'}
                  </Table.Td>
                  <Table.Td className="history-table-cell">
                    {accident.displayDate || 'N/A'}
                  </Table.Td>
                  <Table.Td className="history-table-cell">
                    <Text lineClamp={1}>{accident.description || 'No Description'}</Text>
                  </Table.Td>
                  <Table.Td className="history-table-cell">
                    <Badge 
                      color={getSeverityColor(accident.severity)}
                      radius="xl"
                      size="sm"
                      px="xs"
                      className="severity-badge"
                    >
                      {accident.severity || 'N/A'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    );
  };

  return (
    <Container fluid p={0} className="history-container">
      <Paper radius="lg" p="xl" shadow="md" className="history-paper">
        {/* Visual design elements */}
        <Box className="history-bg-bubble-1" />
        <Box className="history-bg-bubble-2" />
        
        <Box className="history-content">
          {/* Title with icon */}
          <Group mb="lg" spacing="xs">
            <IconHistory size={24} className="history-icon" />
            <Title order={2} className="history-title">
              Accident History
            </Title>
          </Group>

          {/* Statistics summary */}
          <Group mb="xl" spacing="lg">
            <Paper 
              shadow="sm" 
              p="md" 
              radius="md" 
              className="summary-card"
            >
              <Group spacing="xs">
                <IconCalendarStats size={20} className="history-icon" />
                <Text fw={600} size="sm" className="summary-card-title">
                  Total Handled Accidents
                </Text>
              </Group>
              <Text size="xl" className="summary-card-value">
                {handledAccidents.length}
              </Text>
            </Paper>
          </Group>

          {/* Main content */}
          {renderContent()}
        </Box>
      </Paper>
    </Container>
  );
};

export default AccidentHistory;
