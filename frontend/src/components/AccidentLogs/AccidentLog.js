import React, { useState } from 'react';
import './AccidentLog.css';
import { useAccidentLogs } from '../../context/AccidentContext'; // Import the custom hook

const AccidentLog = () => {
  const { accidentLogs, handleMarkAsHandled, handleRowDoubleClick } = useAccidentLogs(); // Use context
  const [selectedRowIndex, setSelectedRowIndex] = useState(null); // Track the clicked row index

  // Handle row click: highlight the clicked row
  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  return (
    <div className="accident-log-container">
      <table className="accident-log-table">
        <thead>
          <tr>
            <th>Video</th>
            <th>Location</th>
            <th>Date</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Description</th>
            <th>Assigned To</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {accidentLogs.map((log, index) => (
            <tr
              key={index}
              className={selectedRowIndex === index ? 'highlighted' : ''}
              onClick={() => handleRowClick(index)} // Highlight row on click
              onDoubleClick={() => handleRowDoubleClick(log)} // Trigger action on double click
            >
              <td>
                <a href={log.video} target="_blank" rel="noopener noreferrer">
                  View Video
                </a>
              </td>
              <td>{log.location}</td>
              <td>{log.displayDate}</td>
              <td>{log.severity}</td>
              <td>{log.status}</td>
              <td>{log.description}</td>
              <td>{log.assignedTo}</td>
              <td>
                <button
                  className="mark-as-handled"
                  onClick={() => handleMarkAsHandled(index)} // Call context function
                >
                  Mark as Handled
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccidentLog;
