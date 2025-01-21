import React, { useState } from 'react';
import { useAuth } from "../../authentication/AuthProvider";
import './AccidentHistory.css'; 

const AccidentHistory = () => {
  const { user } = useAuth();
  const [handledAccidents, setHandledAccidents] = useState([]);

  const getHandledAccidents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/handled-accidents`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setHandledAccidents(data.data);
      } else {
        console.error("Error fetching handled accidents:", data.message);
      }
    } catch (error) {
      console.error("Error fetching handled accidents:", error);
    }
  };

  getHandledAccidents();

  

  return (
    <div className="accident-history">
      <h1>Accident History</h1>
      {handledAccidents.length > 0 ? (
        <table className="accident-table">
          <thead>
            <tr>
              <th>Camera ID</th>
              <th>Location</th>
              <th>Date</th>
              <th>Description</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {handledAccidents.map((accident, index) => (
              <tr key={index}>
                <td>{accident.cameraId || 'N/A'}</td>
                <td>{accident.location || 'N/A'}</td>
                <td>{accident.displayDate || 'N/A'}</td>
                <td>{accident.description || 'No Description'}</td>
                <td>{accident.severity || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No handled accidents found.</p>
      )}
    </div>
  );
};

export default AccidentHistory;
