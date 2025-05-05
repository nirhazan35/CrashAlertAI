import Alert from '../../components/AccidentView/Alert';
import { useAccidentLogs } from '../../context/AccidentContext';
import AccidentLog from '../../components/AccidentLogs/AccidentLog';
import { Stack } from '@mantine/core';
import './Dashboard.css';

const Dashboard = () => {
  const { selectedAlert } = useAccidentLogs();
  
  return (
    <Stack spacing="md" className="dashboard-container">
      <Alert alert={selectedAlert} />
      <AccidentLog />
    </Stack>
  );
};

export default Dashboard;