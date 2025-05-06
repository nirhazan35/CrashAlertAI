import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../authentication/AuthProvider";
import { onNewAccident, onAccidentUpdate } from "../services/socket";
import { onNotification } from "../services/socket";
import playBeep from "../util/generateSound";

const AccidentLogsContext = createContext();

export const AccidentLogsProvider = ({ children }) => {
  const [accidentLogs, setAccidentLogs] = useState([]);
  const [cameraLocations, setCameraLocations] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

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

  const clearSelectedAlert = () => {
    setSelectedAlert(null);
  };

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

  useEffect(() => {
    if(user?.role === 'admin'){
        onNotification((notification) => {
            console.log("New notification received:", notification);
            setNotifications((prev) => [{ ...notification, read: false }, ...prev]);
        });
    }
  }, [user]);

  const handleRowDoubleClick = (log) => {
    setSelectedAlert(log);
  };

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
        notifications,
        setNotifications,
      }}
    >
      {children}
    </AccidentLogsContext.Provider>
  );
};

export const useAccidentLogs = () => useContext(AccidentLogsContext);
