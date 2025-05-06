import React, { useState } from 'react';
import Alert from '../../components/AccidentView/Alert';
import { useAccidentLogs } from '../../context/AccidentContext';
import AccidentLog from '../../components/AccidentLogs/AccidentLog';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { Stack } from '@mantine/core';
import './Dashboard.css';

const Dashboard = () => {
  const { selectedAlert } = useAccidentLogs();
  const [filteredLogs, setFilteredLogs] = useState([]);
  const handleFilteredLogsChange = (logs) => { setFilteredLogs(logs) };
  
  return (
    <Stack spacing="md" className="dashboard-container">
      <Alert alert={selectedAlert} />
      <FilterPanel onFilteredLogsChange={handleFilteredLogsChange} />
      <AccidentLog filteredLogs={filteredLogs} />
    </Stack>
  );
};

export default Dashboard;