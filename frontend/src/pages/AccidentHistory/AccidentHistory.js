import React, { useState, useEffect } from 'react';
import { useAuth } from "../../authentication/AuthProvider";
import { 
  Text, 
  Table, 
  Badge, 
  Loader, 
  Center, 
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
        <Paper p="xl" radius="md" className="empty-state" style={{ animation: 'fadeIn 0.5s ease' }}>
          <Loader size="md" color="blue" />
          <Text c="dimmed" size="md" mt="md">Loading accident history...</Text>
        </Paper>
      );
    }

    if (error) {
      return (
        <Paper p="xl" radius="md" style={{ animation: 'fadeIn 0.5s ease' }}>
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error Loading Accident History" 
            color="red"
            variant="filled"
            radius="md"
            style={{ animation: 'slideUp 0.3s ease' }}
          >
            {error}
          </Alert>
        </Paper>
      );
    }

    if (handledAccidents.length === 0) {
      return (
        <Paper p="xl" radius="md" className="empty-state" style={{ animation: 'fadeIn 0.5s ease' }}>
          <IconHistory size={48} style={{ color: "#3b82f6", opacity: 0.5, marginBottom: '1rem' }} />
          <Text c="dimmed" size="lg" fw={500}>No handled accidents found.</Text>
          <Text c="dimmed" size="sm" mt="xs">All handled accidents will appear here.</Text>
        </Paper>
      );
    }

    return (
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
                }}>Camera ID</Table.Th>
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
                }}>Severity</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {handledAccidents.map((accident, index) => (
                <Table.Tr 
                  key={index}
                  className="table-hover-effect"
                  style={{
                    animation: 'fadeIn 0.3s ease forwards',
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Text fw={500} style={{ fontFamily: "'Inter', sans-serif" }}>{accident.cameraId || 'N/A'}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Text fw={500} style={{ fontFamily: "'Inter', sans-serif" }}>{accident.location || 'N/A'}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Text style={{ fontFamily: "'Inter', sans-serif" }}>{accident.displayDate || 'N/A'}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Text lineClamp={1} style={{ fontFamily: "'Inter', sans-serif" }}>{accident.description || 'No Description'}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Badge 
                      color={getSeverityColor(accident.severity)}
                      radius="xl"
                      size="sm"
                      px="xs"
                      className="severity-badge"
                      style={{ 
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '10px'
                      }}
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
          {/* Title with icon */}
          <Group mb="lg" spacing="xs">
            <IconHistory size={24} style={{ color: "#3b82f6" }} />
            <Title order={2} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
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
              style={{ 
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(4px)',
                flex: '1',
                animation: 'slideUp 0.5s ease forwards'
              }}
            >
              <Group spacing="xs">
                <IconCalendarStats size={20} style={{ color: "#3b82f6" }} />
                <Text fw={600} size="sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Total Handled Accidents
                </Text>
              </Group>
              <Text size="xl" fw={700} style={{ 
                fontFamily: "'Inter', sans-serif", 
                color: "#3b82f6", 
                marginTop: '5px' 
              }}>
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
