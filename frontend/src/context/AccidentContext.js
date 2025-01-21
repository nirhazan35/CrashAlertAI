import React, { createContext, useState, useEffect, useContext } from 'react';
import { subscribeToAccidents } from '../services/websocket'; // WebSocket service
import { useAuth } from "../authentication/AuthProvider";

// Create context
const AccidentLogsContext = createContext();
// Init accidents
const FetchAccidents = async (user) => {
      try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/active-accidents`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`,
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

const HandleSubmit = async (user, accident_id) => {
  try {
    // Prepare the request body and headers
    const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/mark-as-handled`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        id: accident_id,
        status: "handled", // Set the new status to "handled"
      }),
    });
    const data = await response.json();
    console.log(data.message);
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

// Context provider
export const AccidentLogsProvider = ({ children }) => {
  const [accidentLogs, setAccidentLogs] = useState([]); // State for accident logs
  const [selectedAlert, setSelectedAlert] = useState(null); // State for selected alert
  const { user } = useAuth();
  // Fetch accidents on component mount and update state
    useEffect(() => {
      const loadAccidents = async () => {
        const initialAccidents = await FetchAccidents(user);
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
  }, [user]);

  // Mark an accident as handled
  const handleMarkAsHandled = (index) => {
    const { _id } = accidentLogs[index];
    if (HandleSubmit(user,  _id)){
        setAccidentLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
    }
    else console.log("Failed to delete the alert");
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