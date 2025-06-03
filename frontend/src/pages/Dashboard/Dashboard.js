import React, { useState, useEffect } from 'react';
import Alert from '../../components/AccidentView/Alert';
import { useAccidentLogs } from '../../context/AccidentContext';
import AccidentLog from '../../components/AccidentLogs/AccidentLog';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { Stack } from '@mantine/core';
import './Dashboard.css';

const Dashboard = () => {
  const { selectedAlert, accidentLogs, setSelectedAlert } = useAccidentLogs();
  const [filteredLogs, setFilteredLogs] = useState([]);
  
  // Handle filtered logs changes from FilterPanel
  const handleFilteredLogsChange = (logs) => { 
    setFilteredLogs(logs);
  };
  
  // Initialize filtered logs with all logs when component mounts or accidentLogs changes
  useEffect(() => {
    if (accidentLogs && accidentLogs.length > 0) {
      setFilteredLogs(accidentLogs);
    }
  }, [accidentLogs]);
  
  // Custom handler for row double-click that preserves filtered view
  const customHandleRowDoubleClick = (log) => {
    setSelectedAlert(log);
    // Do not reset filteredLogs here
  };
  
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
        handleRowDoubleClick={customHandleRowDoubleClick} 
      />
    </Stack>
  );
};

export default Dashboard;