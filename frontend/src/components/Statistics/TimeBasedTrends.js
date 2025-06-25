import React from 'react';
import {
  Paper,
  Text,
  Stack,
} from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { format, parseISO, isValid } from 'date-fns';

const TimeBasedTrends = ({ trends, rangeDays }) => {
  const { monthlyTrends, weeklyTrends, dailyTrends, hourlyTrends } = trends;

  const monthlyData = (monthlyTrends ?? [])
    .map(item => {
      const parsed = parseISO(item?.date ?? '');
      return isValid(parsed) ? { ...item, __parsed: parsed } : null;
    })
    .filter(Boolean)
    .map(item => ({
      month: format(item.__parsed, 'MMM yyyy'),
      accidents: item.count,
    }));

  const weeklyData = (weeklyTrends ?? [])
    .filter(item => item && item.week)
    .map(item => ({
      week: item.week.includes('-')
        ? `Week ${item.week.split('-')[1]}`
        : item.week,
      accidents: item.count,
    }));

  const dailyData = (dailyTrends ?? [])
    .map(item => {
      const parsed = parseISO(item?.date ?? '');
      return isValid(parsed) ? { ...item, __parsed: parsed } : null;
    })
    .filter(Boolean)
    .map(({ __parsed, count }) => ({
      day: format(__parsed, 'dd MMM'),
      accidents: count,
    }));

  const hourlyData = (hourlyTrends ?? [])
    .filter(item => item && item.hour !== undefined && item.hour !== null)
    .map(item => ({
      hour: `${item.hour}:00`,
      accidents: item.count,
    }));

  // Show charts based on the number of days in the range
  const showMonthly = rangeDays >= 60;
  const showWeekly  = rangeDays > 7;  
  const showDaily   = rangeDays > 1 && rangeDays <= 31;
  const showHourly  = true;

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
      {showMonthly && (
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
      )}

      {showWeekly && (
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
      )}

      {showDaily && (
        <Paper shadow="sm" p="md" radius="md">
          <Stack>
            <Text size="lg" weight={500}>Daily Accident Trends</Text>
            <LineChart
              {...chartProps}
              data={dailyData}
              dataKey="day"
              series={[{ name: 'accidents', color: 'orange.6' }]}
            />
          </Stack>
        </Paper>
      )}

      {showHourly && (
        <Paper shadow="sm" p="md" radius="md">
          <Stack>
            <Text size="lg" weight={500}>Time-of-Day Analysis</Text>
            <LineChart
              {...chartProps}
              data={hourlyData}
              dataKey="hour"
              series={[{ name: 'accidents', color: 'teal.6' }]}
            />
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};

export default TimeBasedTrends; 