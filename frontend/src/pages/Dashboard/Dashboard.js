import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout.js';
import AccidentLog from '../../components/AccidentLogs/AccidentLog.js';
import Alert from '../../components/AccidentView/Alert';

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

  const [selectedAlert, setSelectedAlert] = useState(null); // State to track the selected alert

  const handleMarkAsHandled = (index) => {
    const updatedLogs = accidentLogs.filter((_, i) => i !== index);
    setAccidentLogs(updatedLogs);
  };

  const handleRowDoubleClick = (log) => {
    setSelectedAlert(log); // Update the selected alert when an accident log is double-clicked
  };

  return (
    <DashboardLayout>
      {/* The Alert component */}
       <div className="alert-container">
        <Alert alert={selectedAlert} />
       </div>
      {/* The Alert component will be displayed alongside the logs */}
      <div className="dashboard-content-container">
        {/* Accident Logs */}
        <div className="dashboard-logs">
          <h3>Accident Logs</h3>
          <AccidentLog
            logs={accidentLogs}
            handleMarkAsHandled={handleMarkAsHandled}
            handleDoubleClick={handleRowDoubleClick}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
