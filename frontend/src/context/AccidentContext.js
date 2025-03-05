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

  // Update accident details via backend.
  const updateAccidentDetails = async (updateData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/update-accident-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify(updateData),
      });
      if (response.ok) {
        const updatedAccident = await response.json();
        setAccidentLogs((prevLogs) =>
          updatedAccident.status === "handled"
            ? prevLogs.filter((log) => log._id !== updatedAccident._id)
            : prevLogs.map((log) => (log._id === updatedAccident._id ? updatedAccident : log))
        );
        if (selectedAlert && selectedAlert._id === updatedAccident._id) {
          setSelectedAlert(updatedAccident.status === "handled" ? null : updatedAccident);
        }
        return updatedAccident;
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData.message);
      }
    } catch (error) {
      console.error("Error updating accident details", error);
    }
  };

  // Clear the selected alert.
  const clearSelectedAlert = () => {
    setSelectedAlert(null);
  };

  // Subscribe to new accidents and accident updates.
  useEffect(() => {
    if (user?.isLoggedIn) {
      fetchAccidents();

      onNewAccident((accident) => {
        console.log("New accident received:", accident);
        setAccidentLogs((prevLogs) => [accident, ...prevLogs]);
      });

      onAccidentUpdate((update) => {
        if (update.status === "handled") {
          setAccidentLogs((prevLogs) =>
            prevLogs.filter((log) => log._id !== update._id)
          );
          if (selectedAlert && selectedAlert._id === update._id) {
            setSelectedAlert(null);
          }
        } else {
          setAccidentLogs((prevLogs) =>
            prevLogs.map((log) => (log._id === update._id ? { ...log, ...update } : log))
          );
          if (selectedAlert && selectedAlert._id === update._id) {
            setSelectedAlert({ ...selectedAlert, ...update });
          }
        }
      });
    }
  }, [user, selectedAlert]);

  // Handle double-click on a log: set it as the selected alert.
  const handleRowDoubleClick = (log) => {
    setSelectedAlert(log);
  };

  // Update the status of an accident.
  const updateAccidentStatus = async (accident_id, status) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/accident-status-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ accident_id, status }),
      });
  
      if (response.ok) {
        const updatedAccident = await response.json();
        setAccidentLogs((prevLogs) =>
          updatedAccident.status === "handled"
            ? prevLogs.filter((log) => log._id !== updatedAccident._id)
            : prevLogs.map((log) => (log._id === updatedAccident._id ? updatedAccident : log))
        );
        if (selectedAlert && selectedAlert._id === updatedAccident._id) {
          setSelectedAlert(updatedAccident.status === "handled" ? null : updatedAccident);
        }
      } else {
        console.error("Failed to update accident status");
      }
    } catch (error) {
      console.error("Error updating accident status:", error.message);
    }
  };

  return (
    <AccidentLogsContext.Provider
      value={{
        accidentLogs,
        selectedAlert,
        setSelectedAlert,
        updateAccidentDetails,
        clearSelectedAlert,   
        updateAccidentStatus,
        handleRowDoubleClick,
      }}
    >
      {children}
    </AccidentLogsContext.Provider>
  );
};

export const useAccidentLogs = () => useContext(AccidentLogsContext);
