import React, { useEffect, useState } from 'react';
import { useAccidentLogs } from '../../context/AccidentContext';
import './AccidentHistory.css'; 

const AccidentHistory = () => {
  const { accidentLogs } = useAccidentLogs(); // Use the context to get accident logs
  const [handledAccidents, setHandledAccidents] = useState([]);

  // Filter handled accidents whenever accidentLogs change
  useEffect(() => {
    const filteredAccidents = accidentLogs.filter(accident => accident.status === 'handled');
    setHandledAccidents(filteredAccidents);
  }, [accidentLogs]);

  return (
    <div className="accident-history">
      <h1>Accident History</h1>
      {handledAccidents.length > 0 ? (
        <table className="accident-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Date</th>
              <th>Description</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {handledAccidents.map((accident, index) => (
              <tr key={index}>
                <td>{accident.id || 'N/A'}</td>
                <td>{accident.location || 'N/A'}</td>
                <td>{accident.date || 'N/A'}</td>
                <td>{accident.description || 'N/A'}</td>
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
