import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout.js';
import AccidentLog from '../../components/AccidentLogs/AccidentLog.js';


const Dashboard = () => {
  const [accidentLogs, setAccidentLogs] = useState([
    {
      videoReference: "https://example.com/video1.mp4",
      Location: "Highway 101",
      Date: "2025-01-15",
      Severity: "High",
      VehiclesInvolved: "3",
      Description: "A multi-vehicle collision with significant damage.",
    },
    {
      videoReference: "https://example.com/video2.mp4",
      Location: "Downtown",
      Date: "2025-01-14",
      Severity: "Medium",
      VehiclesInvolved: "2",
      Description: "Fender bender with minor injuries.",
    },
  ]);

  const handleMarkAsHandled = (index) => {
    // Remove the log from the list
    const updatedLogs = accidentLogs.filter((_, i) => i !== index);
    setAccidentLogs(updatedLogs);
  };

  return (
    <DashboardLayout>
      <div className="dashboard-main-content">
        <h2>Welcome to the Dashboard!</h2>
        <p>This is the dashboard content area.</p>
      </div>
      <div className="dashboard-logs">
        <h3>Accident Logs</h3>
        <AccidentLog logs={accidentLogs} handleMarkAsHandled={handleMarkAsHandled} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
