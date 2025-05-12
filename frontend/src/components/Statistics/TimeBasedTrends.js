import React from 'react';
import {
  Paper,
  Text,
  Stack,
} from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { format, parse } from 'date-fns';

const TimeBasedTrends = ({ trends }) => {
  const { monthlyTrends, weeklyTrends, hourlyTrends } = trends;

  // Format monthly data for chart
  const monthlyData = monthlyTrends.map(item => ({
    month: format(parse(item.date, 'yyyy-MM', new Date()), 'MMM yyyy'),
    accidents: item.count
  }));

  // Format weekly data for chart
  const weeklyData = weeklyTrends.map(item => ({
    week: `Week ${item.week.split('-')[1]}`,
    accidents: item.count
  }));

  // Format hourly data for chart
  const hourlyData = hourlyTrends.map(item => ({
    hour: `${item.hour}:00`,
    accidents: item.count
  }));

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
      {/* Monthly Trends */}
      <Paper shadow="sm" p="md" radius="md">
        <Stack>
          <Text size="lg" weight={500}>Monthly Accident Trends</Text>
          <LineChart
            {...chartProps}
            data={monthlyData}
            dataKey="month"
            series={[{ name: 'accidents', color: 'blue.6' }]}
          />
        </Stack>
      </Paper>

      {/* Weekly Trends */}
      <Paper shadow="sm" p="md" radius="md">
        <Stack>
          <Text size="lg" weight={500}>Weekly Accident Trends</Text>
          <LineChart
            {...chartProps}
            data={weeklyData}
            dataKey="week"
            series={[{ name: 'accidents', color: 'violet.6' }]}
          />
        </Stack>
      </Paper>

      {/* Hourly Trends */}
      <Paper shadow="sm" p="md" radius="md">
        <Stack>
          <Text size="lg" weight={500}>Time of Day Analysis</Text>
          <LineChart
            {...chartProps}
            data={hourlyData}
            dataKey="hour"
            series={[{ name: 'accidents', color: 'teal.6' }]}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

export default TimeBasedTrends; 