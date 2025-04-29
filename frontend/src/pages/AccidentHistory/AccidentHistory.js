import React, { useState, useEffect } from 'react';
import { useAuth } from "../../authentication/AuthProvider";
import PageTemplate from '../../components/PageTemplate/PageTemplate';
import { 
  Text, 
  Table, 
  Badge, 
  Loader, 
  Center, 
  Alert,
  Paper,
  ScrollArea,
  useMantineTheme
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

const AccidentHistory = () => {
  const { user } = useAuth();
  const [handledAccidents, setHandledAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useMantineTheme();

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

  // Custom styles for table headers
  const tableHeaderStyle = {
    textAlign: 'center',
    fontWeight: 600,
    color: theme.colors.gray[8],
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Center p="xl">
          <Loader size="md" />
        </Center>
      );
    }

    if (error) {
      return (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
      );
    }

    if (handledAccidents.length === 0) {
      return (
        <Center p="xl">
          <Text c="dimmed">No handled accidents found.</Text>
        </Center>
      );
    }

    return (
      <Paper shadow="xs" radius="md" withBorder>
        <ScrollArea>
          <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={tableHeaderStyle}>Camera ID</Table.Th>
                <Table.Th style={tableHeaderStyle}>Location</Table.Th>
                <Table.Th style={tableHeaderStyle}>Date</Table.Th>
                <Table.Th style={tableHeaderStyle}>Description</Table.Th>
                <Table.Th style={tableHeaderStyle}>Severity</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {handledAccidents.map((accident, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Text fw={500}>{accident.cameraId || 'N/A'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500}>{accident.location || 'N/A'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text>{accident.displayDate || 'N/A'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text lineClamp={1}>{accident.description || 'No Description'}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Badge color={getSeverityColor(accident.severity)}>
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
    <PageTemplate title="Accident History">
      {renderContent()}
    </PageTemplate>
  );
};

export default AccidentHistory;
