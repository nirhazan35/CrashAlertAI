import React from 'react';
import {
  Paper,
  Text,
  Stack,
} from '@mantine/core';
import { LineChart } from '@mantine/charts';

const FalsePositiveTrends = ({ trends }) => {
  const { locationTrends, cameraTrends } = trends;

  const chartProps = {
    h: 250,
    tickLine: "y",
    gridAxis: "xy",
    curveType: "linear",
    dotProps: { r: 4 },
    withTooltip: false,
    strokeWidth: 2,
    yAxisProps: { tickCount: 5 },
    withLegend: false,
  };

  return (
    <Stack spacing="lg">
      {/* Location Trends */}
      <Paper shadow="sm" p="md" radius="md">
        <Stack>
          <Text size="lg" weight={500}>False Positives by Location</Text>
          <LineChart
            {...chartProps}
            data={locationTrends}
            dataKey="location"
            series={[{ name: 'falsePositives', color: 'red.6' }]}
          />
        </Stack>
      </Paper>

      {/* Camera Trends */}
      <Paper shadow="sm" p="md" radius="md">
        <Stack>
          <Text size="lg" weight={500}>False Positives by Camera</Text>
          <LineChart
            {...chartProps}
            data={cameraTrends}
            dataKey="camera"
            series={[{ name: 'falsePositives', color: 'orange.6' }]}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

export default FalsePositiveTrends; 