import React from 'react';
import {
  Paper,
  Text,
  Stack,
  Center,
} from '@mantine/core';
import { BarChart } from '@mantine/charts';

/**
 * FalsePositiveTrends - Displays charts for false positive statistics
 * Shows trends by location and camera to help identify problematic areas
 */
const FalsePositiveTrends = ({ trends }) => {
  const { locationTrends = [], cameraTrends = [] } = trends;

  // Common chart configuration properties
  const chartProps = {
    h: 300,
    withLegend: false,
    withTooltip: false,
    barProps: { 
      radius: 4,
      width: 0.6 
    },
    orientation: 'horizontal',
    yAxisProps: { 
      width: 120,
    },
  };

  return (
    <Stack spacing="lg">
      {/* Location Trends */}
      <Paper shadow="sm" p="md" radius="md">
        <Stack>
          <Text size="lg" weight={500}>False Positives by Location</Text>
          {locationTrends.length > 0 ? (
            <BarChart
              {...chartProps}
              data={locationTrends}
              dataKey="location"
              series={[
                { name: 'count', color: 'red.6', label: 'False Positives' }
              ]}
            />
          ) : (
            <Center py="xl">
              <Text color="dimmed">No location data available</Text>
            </Center>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default FalsePositiveTrends; 