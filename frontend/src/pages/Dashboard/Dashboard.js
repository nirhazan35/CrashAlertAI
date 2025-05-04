import Alert from '../../components/AccidentView/Alert';
import { useAccidentLogs } from '../../context/AccidentContext';
import AccidentLog from '../../components/AccidentLogs/AccidentLog';
import { Paper, Title, useMantineTheme, Stack } from '@mantine/core';
import PageTemplate from '../../components/PageTemplate/PageTemplate';

const Dashboard = () => {
  const { selectedAlert } = useAccidentLogs();
  const theme = useMantineTheme();
  
  return (
    <Stack spacing="md">
      {/* Alert container */}
      <PageTemplate title="" paperProps={{ style: { height: '100%' } }}>
        <Alert alert={selectedAlert} />
      </PageTemplate>

      {/* Accident Logs */}
      <PageTemplate title="Accident Logs">
        <AccidentLog />
      </PageTemplate>
    </Stack>
  );
};

export default Dashboard;