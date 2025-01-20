import React, { useState, useEffect } from 'react';
import DashboardLayout from './SidebarLayout.js';
import AccidentLog from '../../components/AccidentLogs/AccidentLog.js';
import Alert from '../../components/AccidentView/Alert.js';
import { subscribeToAccidents } from '../../services/websocket'; // WebSocket service

const Dashboard = () => {

  const [accidentLogs, setAccidentLogs] = useState([]); // State for accident logs
  const [selectedAlert, setSelectedAlert] = useState(null); // State to track the selected alert

  // Subscribe to real-time alerts when the component mounts
  useEffect(() => {
    const handleNewAccident = (accident) => {
      console.log("New accident:", accident);
      // setAccidentLogs((prevLogs) => [accident, ...prevLogs]); // Add new accident to the top of the list
      const prev = accidentLogs;
      console.log("Previous logs:", prev);
      const logs = [ ...prev, accident];
      console.log("Updated logs:", logs);
      setAccidentLogs(logs);
    };

    subscribeToAccidents(handleNewAccident);

    return () => {
      console.log("Unsubscribed from accident updates");
    };
  }, []);

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
