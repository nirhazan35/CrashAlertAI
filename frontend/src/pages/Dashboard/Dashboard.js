import React, { useState, useEffect } from 'react';
import DashboardLayout from './SidebarLayout.js';
import AccidentLog from '../../components/AccidentLogs/AccidentLog.js';
import Alert from '../../components/AccidentView/Alert.js';
import { subscribeToAccidents } from '../../services/websocket'; // WebSocket service


const Dashboard = () => {
  const [accidentLogs, setAccidentLogs] = useState(() => []); // State for accident logs
  const [selectedAlert, setSelectedAlert] = useState(null); // State to track the selected alert
  console.log("test", accidentLogs);

  useEffect(() => {
    const handleNewAccident = (accident) => {
      setAccidentLogs((prevAccidentLogs) => {
        const updatedLogs = [accident, ...prevAccidentLogs];
        return updatedLogs;
      });
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
