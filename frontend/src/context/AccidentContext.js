import React, { createContext, useState, useEffect, useContext } from 'react';
import { subscribeToAccidents } from '../services/websocket'; // WebSocket service



// Create context
const AccidentLogsContext = createContext();
// Init accidents
const fetchAccidents = async () => {
      try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/active-accidents`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
            const data = await response.json();
        if (data.success) {
          return data.data;
        } else {
          console.error("Error fetching accidents:", data.message);
          return [];
        }
      } catch (error) {
        console.error("Error fetching accidents:", error);
      }
    };

// Context provider
export const AccidentLogsProvider = ({ children }) => {
  const [accidentLogs, setAccidentLogs] = useState([]); // State for accident logs
  const [selectedAlert, setSelectedAlert] = useState(null); // State for selected alert

  // Fetch accidents on component mount and update state
    useEffect(() => {
      const loadAccidents = async () => {
        const initialAccidents = await fetchAccidents();
        if (initialAccidents)
            setAccidentLogs(initialAccidents); // Set initial accidents into state
      };

      loadAccidents();

      // Handle new accidents from WebSocket
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

  // Mark an accident as handled
  const handleMarkAsHandled = (index) => {
    setAccidentLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
  };

  // Handle double-click on a log
  const handleRowDoubleClick = (log) => {
    setSelectedAlert(log);
  };

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

// Custom hook for using the context
export const useAccidentLogs = () => useContext(AccidentLogsContext);