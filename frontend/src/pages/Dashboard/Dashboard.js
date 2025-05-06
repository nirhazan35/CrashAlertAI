import React, { useState } from 'react';
import Alert from '../../components/AccidentView/Alert';
import { useAccidentLogs } from '../../context/AccidentContext';
import AccidentLog from '../../components/AccidentLogs/AccidentLog';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { Stack, Container, Paper, Box, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import './Dashboard.css';

const Dashboard = () => {
  const { selectedAlert, accidentLogs } = useAccidentLogs();
  const [filteredLogs, setFilteredLogs] = useState([]);
  const handleFilteredLogsChange = (logs) => { setFilteredLogs(logs) };
  
  // Initialize filtered logs with all logs when component mounts
  React.useEffect(() => {
    if (accidentLogs && accidentLogs.length > 0) {
      setFilteredLogs(accidentLogs);
    }
  }, [accidentLogs]);
  
  return (
    <Stack spacing="md" className="dashboard-container">
      <Alert alert={selectedAlert} />
      <FilterPanel 
        onFilteredLogsChange={handleFilteredLogsChange} 
        initialLogs={accidentLogs}
      />
      <AccidentLog 
        filteredLogs={filteredLogs} 
        isHistoryView={false} 
      />
    </Stack>
  );
};

export default Dashboard;