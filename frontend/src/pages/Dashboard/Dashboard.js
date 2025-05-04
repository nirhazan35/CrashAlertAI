import Alert from '../../components/AccidentView/Alert';
import { useAccidentLogs } from '../../context/AccidentContext';
import AccidentLog from '../../components/AccidentLogs/AccidentLog';
import { Stack } from '@mantine/core';
import PageTemplate from '../../components/PageTemplate/PageTemplate';
import './Dashboard.css';

const Dashboard = () => {
  const { selectedAlert } = useAccidentLogs();
  
  return (
    <Stack spacing="md" className="dashboard-container">
      {/* Alert container */}
      <PageTemplate title="" paperProps={{ className: 'alert-container' }}>
        <Alert alert={selectedAlert} />
      </PageTemplate>

      {/* Accident Logs */}
      <PageTemplate title="" className="accident-logs-section">
        <AccidentLog />
      </PageTemplate>
    </Stack>
  );
};

export default Dashboard;