import React, { useState, useEffect } from 'react';
import { useAuth } from "../../authentication/AuthProvider";
import { 
  Box,
  Button,
  Stack, 
  Container,
  Text,
  Loader,
  Alert as MantineAlert,
  Paper,
  Group,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { IconAlertCircle, IconFileExport } from '@tabler/icons-react';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import AccidentLog from '../../components/AccidentLogs/AccidentLog';
import { exportAccidentsToCSV } from '../../services/statisticsService';
import './AccidentHistory.css';

const AccidentHistory = () => {
  const { user } = useAuth();
  const [handledAccidents, setHandledAccidents] = useState([]);
  const [filteredAccidents, setFilteredAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch handled accidents
  useEffect(() => {
    const fetchHandledAccidents = async () => {
      try {
        setLoading(true);
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
          setFilteredAccidents(data.data);
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
      fetchHandledAccidents();
    }
  }, [user?.token]);

  // Handle unhandling an accident
  const handleUnhandleAccident = async (accident_id) => {
    if (window.confirm("Mark this accident as unhandled? It will be moved back to active accidents.")) {
      try {
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/accident-status-update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ accident_id, status: "active" }),
        });

        if (response.ok) {
          // Remove the accident from the list after it's unhandled
          setHandledAccidents(prevAccidents => 
            prevAccidents.filter(accident => accident._id !== accident_id)
          );
          setFilteredAccidents(prevAccidents => 
            prevAccidents.filter(accident => accident._id !== accident_id)
          );
        } else {
          console.error("Failed to update accident status");
        }
      } catch (error) {
        console.error("Error updating accident status:", error.message);
      }
    }
  };
  
  // Custom action renderer for AccidentLog component
 const renderCustomActions = (log) => {
   if (log.assignedTo !== user?.username && user?.role !== "admin") return null;

   return (
     <Button
       size="xs"
       variant="outline"
       color="blue"
       radius="xl"
       onClick={(e) => {
         e.stopPropagation();
         handleUnhandleAccident(log._id);
       }}
     >
       Unhandle
     </Button>
   );
 };

  // Handle filtered logs from FilterPanel
  const handleFilteredLogsChange = (logs) => {
    setFilteredAccidents(logs);
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    exportAccidentsToCSV(filteredAccidents);
  };

  if (loading) {
    return (
      <Container fluid p={0} className="history-container">
        <Paper p="xl" radius="lg" shadow="md" className="history-paper">
          <Box className="history-content center-content">
            <Loader size="md" color="blue" />
            <Text c="dimmed" size="md" mt="md">Loading accident history...</Text>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid p={0} className="history-container">
        <Paper p="xl" radius="lg" shadow="md" className="history-paper">
          <Box className="history-content">
            <MantineAlert 
              icon={<IconAlertCircle size={16} />} 
              title="Error Loading Accident History" 
              color="red"
              variant="filled"
              radius="md"
              className="fade-in"
            >
              {error}
            </MantineAlert>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Stack spacing="md" className="history-container">
      <Group position="apart" mb="sm">
        <Text size="xl" weight={700}>Accident History</Text>
        <Tooltip label="Export to CSV">
          <ActionIcon
            data-testid="export-button"
            variant="light"
            color="teal"
            size="lg"
            onClick={handleExportCSV}
            disabled={loading || filteredAccidents.length === 0}
          >
            <IconFileExport size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
      
      <FilterPanel 
        onFilteredLogsChange={handleFilteredLogsChange}
        colSpan={{ base: 12, sm: 6, md: 4, lg: 1.7 }}
        initialLogs={handledAccidents}
        isHistory={true}
      />
      
      <AccidentLog 
        filteredLogs={filteredAccidents} 
        renderActions={renderCustomActions}
        isHistoryView={true}
      />
    </Stack>
  );
};

export default AccidentHistory;
