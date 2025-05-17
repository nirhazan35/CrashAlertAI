import { format } from 'date-fns';

const fetchHandledAccidents = async (token) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/handled-accidents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch handled accidents");
    }
    return data.data;
  } catch (error) {
    console.error("Error fetching handled accidents:", error);
    throw error;
  }
};

const fetchUsers = async (token) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/users/get-all-users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

const fetchCamerasLocations = async (token) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/cameras/get-id_location`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch cameras locations: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching cameras locations:", error);
        throw error;
    }
};

const calculateCoreStatistics = (accidents) => {
  const totalHandled = accidents.length;
  
  // Severity Distribution
  const severityDistribution = accidents.reduce((acc, accident) => {
    acc[accident.severity] = (acc[accident.severity] || 0) + 1;
    return acc;
  }, { low: 0, medium: 0, high: 0 });

  // Calculate percentages
  const severityPercentages = Object.entries(severityDistribution).reduce((acc, [key, value]) => {
    acc[key] = {
      count: value,
      percentage: ((value / totalHandled) * 100).toFixed(1)
    };
    return acc;
  }, {});

  // False Positive Rate
  const falsePositives = accidents.filter(a => a.falsePositive).length;
  const falsePositiveRate = ((falsePositives / totalHandled) * 100).toFixed(1);

  // Top 5 Locations
  const locationCounts = accidents.reduce((acc, accident) => {
    acc[accident.location] = (acc[accident.location] || 0) + 1;
    return acc;
  }, {});

  const top5Locations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  // Most Active Responders
  const responderCounts = accidents.reduce((acc, accident) => {
    if (accident.assignedTo) {
      acc[accident.assignedTo] = (acc[accident.assignedTo] || 0) + 1;
    }
    return acc;
  }, {});

  const mostActiveResponders = Object.entries(responderCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([responder, count]) => ({ responder, count }));

  return {
    totalHandled,
    severityDistribution: severityPercentages,
    falsePositiveRate,
    top5Locations,
    mostActiveResponders
  };
};

const calculateTimeBasedTrends = (accidents) => {
  // Monthly Trends
  const monthlyTrends = accidents.reduce((acc, accident) => {
    const month = format(new Date(accident.date), 'yyyy-MM');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  // Weekly Trends
  const weeklyTrends = accidents.reduce((acc, accident) => {
    const week = format(new Date(accident.date), 'yyyy-ww');
    acc[week] = (acc[week] || 0) + 1;
    return acc;
  }, {});

  // Time of Day Analysis
  const hourlyTrends = accidents.reduce((acc, accident) => {
    const hour = format(new Date(accident.date), 'HH');
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  return {
    monthlyTrends: Object.entries(monthlyTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
    weeklyTrends: Object.entries(weeklyTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({ week, count })),
    hourlyTrends: Object.entries(hourlyTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
  };
};

const calculateFalsePositiveTrends = (accidents) => {
  const falsePositivesByLocation = accidents.reduce((acc, accident) => {
    if (accident.falsePositive) {
      acc[accident.location] = (acc[accident.location] || 0) + 1;
    }
    return acc;
  }, {});

  const falsePositivesByCameraId = accidents.reduce((acc, accident) => {
    if (accident.falsePositive) {
      acc[accident.cameraId] = (acc[accident.cameraId] || 0) + 1;
    }
    return acc;
  }, {});

  return {
    byLocation: Object.entries(falsePositivesByLocation)
      .sort(([, a], [, b]) => b - a)
      .map(([location, count]) => ({ location, count })),
    byCameraId: Object.entries(falsePositivesByCameraId)
      .sort(([, a], [, b]) => b - a)
      .map(([cameraId, count]) => ({ cameraId, count }))
  };
};

/**
 * Convert statistics data to CSV format and trigger download
 * @param {Object} statistics - Calculated statistics
 */
const exportStatisticsToCSV = (statistics) => {
  if (!statistics) return;
  
  const csvRows = [];
  
  // Core statistics
  csvRows.push({ 'Statistic': 'Total Handled Accidents', 'Value': statistics.core.totalHandled });
  csvRows.push({ 'Statistic': 'False Positive Rate', 'Value': `${statistics.core.falsePositiveRate}%` });
  
  // Severity distribution
  csvRows.push({ 'Statistic': '---', 'Value': '---' });
  csvRows.push({ 'Statistic': 'Severity Distribution', 'Value': '' });
  Object.entries(statistics.core.severityDistribution).forEach(([severity, data]) => {
    csvRows.push({ 'Statistic': `${severity} Severity Count`, 'Value': data.count });
    csvRows.push({ 'Statistic': `${severity} Severity Percentage`, 'Value': `${data.percentage}%` });
  });
  
  // Top locations
  csvRows.push({ 'Statistic': '---', 'Value': '---' });
  csvRows.push({ 'Statistic': 'Top Locations', 'Value': '' });
  statistics.core.top5Locations.forEach((location, index) => {
    csvRows.push({ 'Statistic': `Location ${index + 1}`, 'Value': `${location.location} (${location.count})` });
  });
  
  // Most active responders
  csvRows.push({ 'Statistic': '---', 'Value': '---' });
  csvRows.push({ 'Statistic': 'Most Active Responders', 'Value': '' });
  statistics.core.mostActiveResponders.slice(0, 5).forEach((responder, index) => {
    csvRows.push({ 'Statistic': `Responder ${index + 1}`, 'Value': `${responder.responder} (${responder.count})` });
  });
  
  // Time-based trends
  csvRows.push({ 'Statistic': '---', 'Value': '---' });
  csvRows.push({ 'Statistic': 'Monthly Trends', 'Value': '' });
  statistics.trends.monthlyTrends.forEach(trend => {
    csvRows.push({ 'Statistic': trend.date, 'Value': trend.count });
  });
  
  // Weekly trends
  csvRows.push({ 'Statistic': '---', 'Value': '---' });
  csvRows.push({ 'Statistic': 'Weekly Trends', 'Value': '' });
  statistics.trends.weeklyTrends.forEach(trend => {
    csvRows.push({ 'Statistic': trend.week, 'Value': trend.count });
  });
  
  // False positive trends
  csvRows.push({ 'Statistic': '---', 'Value': '---' });
  csvRows.push({ 'Statistic': 'False Positive by Location', 'Value': '' });
  statistics.falsePositives.locationTrends.forEach(trend => {
    csvRows.push({ 'Statistic': trend.location, 'Value': trend.count });
  });
  
  // Convert to CSV string
  const csvContent = convertToCSV(csvRows);
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `statistics_summary_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Convert accident data to CSV format and trigger download
 * @param {Array} accidents - Filtered accident data
 */
const exportAccidentsToCSV = (accidents) => {
  if (!accidents || !accidents.length) return;
  
  // Format accidents data for CSV
  const accidentsCSV = accidents.map(accident => ({
    'Date': accident.displayDate || format(new Date(accident.date), 'yyyy-MM-dd'),
    'Time': accident.displayTime || format(new Date(accident.date), 'HH:mm:ss'),
    'Location': accident.location,
    'Camera ID': accident.cameraId,
    'Severity': accident.severity,
    'Status': accident.status,
    'Assigned To': accident.assignedTo || 'Not assigned',
    'False Positive': accident.falsePositive ? 'Yes' : 'No',
    'Description': accident.description || ''
  }));
  
  // Convert to CSV string
  const csvContent = convertToCSV(accidentsCSV);
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `accident_records_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Helper function to convert array of objects to CSV string
 * @param {Array} objArray - Array of objects to convert
 * @returns {string} CSV formatted string
 */
const convertToCSV = (objArray) => {
  if (objArray.length === 0) return '';
  
  const header = Object.keys(objArray[0]);
  const headerString = header.join(',');
  
  const rows = objArray.map(obj => {
    return header.map(field => {
      const value = obj[field] === null || obj[field] === undefined ? '' : obj[field];
      // Escape quotes and wrap in quotes if contains commas or quotes
      const escaped = String(value).replace(/"/g, '""');
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(',');
  });
  
  return [headerString, ...rows].join('\n');
};

export {
  fetchHandledAccidents,
  fetchUsers,
  fetchCamerasLocations,
  calculateCoreStatistics,
  calculateTimeBasedTrends,
  calculateFalsePositiveTrends,
  exportStatisticsToCSV,
  exportAccidentsToCSV
}; 