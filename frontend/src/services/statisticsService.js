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

export {
  fetchHandledAccidents,
  fetchUsers,
  fetchCamerasLocations,
  calculateCoreStatistics,
  calculateTimeBasedTrends,
  calculateFalsePositiveTrends
}; 