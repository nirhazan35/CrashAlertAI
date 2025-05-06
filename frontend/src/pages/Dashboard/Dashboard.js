import React, { useState } from 'react';
import Alert from '../../components/AccidentView/Alert';
import { useAccidentLogs } from '../../context/AccidentContext';
import AccidentLog from '../../components/AccidentLogs/AccidentLog';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { Stack, Paper, Box, Container } from '@mantine/core';
import './Dashboard.css';

const Dashboard = () => {
  const { selectedAlert } = useAccidentLogs();
  const [filteredLogs, setFilteredLogs] = useState([]);
  
  // Handle filtered logs from FilterPanel
  const handleFilteredLogsChange = (logs) => {
    setFilteredLogs(logs);
  };
  
  return (
    <Stack spacing="md" className="dashboard-container">
      <Alert alert={selectedAlert} />
      
      <Container fluid p={0}>
        <Paper radius="lg" p="xl" shadow="md" className="dashboard-filter-paper" style={{ width: '100%' }}>
          {/* Visual design elements */}
          <Box className="bg-bubble-1" />
          <Box className="bg-bubble-2" />
          
          <Box style={{ position: 'relative', zIndex: 1, width: '100%' }}>
            <FilterPanel 
              onFilteredLogsChange={handleFilteredLogsChange}
              colSpan={{ base: 12, sm: 6, md: 4, lg: 1.7 }}
            />
          </Box>
        </Paper>
      </Container>
      
      <AccidentLog filteredLogs={filteredLogs} />
    </Stack>
  );
};

export default Dashboard;