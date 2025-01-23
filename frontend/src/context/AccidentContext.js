import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../authentication/AuthProvider";
import { onNewAccident, onAccidentUpdate } from "../services/socket"; // Import Socket.IO listeners
import playBeep from "../util/generateSound";

const AccidentLogsContext = createContext();

export const AccidentLogsProvider = ({ children }) => {
  const [accidentLogs, setAccidentLogs] = useState([]); // State for accident logs
  const [selectedAlert, setSelectedAlert] = useState(null); // State for selected alert
  const { user } = useAuth();

  // Fetch active accidents from the server
  const fetchAccidents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/active-accidents`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAccidentLogs(data.data);
      } else {
        console.error("Error fetching accidents:", data.message);
      }
    } catch (error) {
      console.error("Error fetching accidents:", error);
    }
  };

  // Mark an accident as handled
  const handleMarkAsHandled = async (index) => {
    const { _id } = accidentLogs[index];
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/mark-as-handled`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ id: _id, status: "handled" }),
      });

      if (response.ok) {
        const updatedAccident = await response.json();
        setAccidentLogs((prevLogs) =>
          prevLogs.map((log) => (log._id === updatedAccident._id ? updatedAccident : log))
        );
      } else {
        console.error("Failed to mark accident as handled");
      }
    } catch (error) {
      console.error("Error handling accident:", error);
    }
  };

  // Handle row double-click
  const handleRowDoubleClick = (log) => {
    setSelectedAlert(log);
  };

  useEffect(() => {
    if (user?.isLoggedIn) {
      // Fetch active accidents on login
      fetchAccidents();

      // Handle new accidents from Socket.IO
      onNewAccident((accident) => {
        playBeep();
        setAccidentLogs((prevLogs) => [accident, ...prevLogs]);
      });

      // Handle updates to existing accidents from Socket.IO
      onAccidentUpdate((update) => {
        setAccidentLogs((prevLogs) =>
          prevLogs.map((log) => (log._id === update._id ? { ...log, ...update } : log))
        );
      });
    }
  }, [user]);

  return (
    <AccidentLogsContext.Provider
      value={{
        accidentLogs,
        selectedAlert,
        setSelectedAlert,
        handleMarkAsHandled,
        handleRowDoubleClick,
      }}
    >
      {children}
    </AccidentLogsContext.Provider>
  );
};

export const useAccidentLogs = () => useContext(AccidentLogsContext);
