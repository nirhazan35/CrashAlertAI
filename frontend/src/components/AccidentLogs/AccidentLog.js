import React, { useState } from 'react';
import './AccidentLog.css';

const AccidentLog = ({ logs, handleMarkAsHandled, handleDoubleClick }) => {
  // Track the clicked row index
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Handle row click: highlight the clicked row
  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  // Handle double-click: execute the function
  const handleRowDoubleClick = (index, log, e) => {
    console.log("Row double click", index);
    handleDoubleClick(log);
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
            <th>Vehicles Involved</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr
              key={index}
              className={selectedRowIndex === index ? 'highlighted' : ''}
              onClick={() => handleRowClick(index)}  // Highlight row on click
              onDoubleClick={() => handleRowDoubleClick(index, log)}  // Trigger action on double click
            >
              <td>
                <a href={log.videoReference} target="_blank" rel="noopener noreferrer">
                  View Video
                </a>
              </td>
              <td>{log.Location}</td>
              <td>{log.Date}</td>
              <td>{log.Severity}</td>
              <td>{log.VehiclesInvolved}</td>
              <td>{log.Description}</td>
              <td>
                <button
                  className="mark-as-handled"
                  onClick={() => handleMarkAsHandled(index)}
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
