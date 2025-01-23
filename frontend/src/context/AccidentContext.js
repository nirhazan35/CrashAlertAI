import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../authentication/AuthProvider";
import { onNewAccident, onAccidentUpdate } from "../services/socket";
import playBeep from "../util/generateSound";

const AccidentLogsContext = createContext();

export const AccidentLogsProvider = ({ children }) => {
  const [accidentLogs, setAccidentLogs] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const { user } = useAuth();

  // Fetch active accidents from the server
  const fetchAccidents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/active-accidents`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAccidentLogs(data.data);
      } else {
        console.error("Error fetching accidents:", data.message);
      }
    } catch (error) {
      console.error("Error fetching accidents:", error.message);
    }
  };

  const handleAccidentStatusChange = async (id, status) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/mark-as-handled`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ id, status }),
      });
  
      if (response.ok) {
        const updatedAccident = await response.json();
        setAccidentLogs((prevLogs) =>
          prevLogs.map((log) => (log._id === updatedAccident._id ? updatedAccident : log))
        );
      } else {
        console.error("Failed to update accident status");
      }
    } catch (error) {
      console.error("Error updating accident status:", error.message);
    }
  };
  

  useEffect(() => {
    if (user?.isLoggedIn) {
      fetchAccidents();

      // Subscribe to new accidents
      onNewAccident((accident) => {
        playBeep();
        setAccidentLogs((prevLogs) => [accident, ...prevLogs]);
      });

      // Subscribe to accident updates
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
        handleAccidentStatusChange,
      }}
    >
      {children}
    </AccidentLogsContext.Provider>
  );
};

export const useAccidentLogs = () => useContext(AccidentLogsContext);
