import React from 'react';
import { Container, Text, Paper, Stack } from '@mantine/core';

const Health = () => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  return (
    <Container size="sm" style={{ paddingTop: '2rem' }}>
      <Paper shadow="xs" padding="md">
        <Stack spacing="md">
          <Text size="xl" weight={500}>
            Frontend Health Check
          </Text>
          <div>
            <Text size="sm" color="dimmed">Status:</Text>
            <Text size="md" color="green" weight={500}>
              {healthData.status}
            </Text>
          </div>
          <div>
            <Text size="sm" color="dimmed">Timestamp:</Text>
            <Text size="md">{healthData.timestamp}</Text>
          </div>
          <div>
            <Text size="sm" color="dimmed">Version:</Text>
            <Text size="md">{healthData.version}</Text>
          </div>
          <div>
            <Text size="sm" color="dimmed">Environment:</Text>
            <Text size="md">{healthData.environment}</Text>
          </div>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Health; 