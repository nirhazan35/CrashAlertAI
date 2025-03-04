import React, { useState } from "react";
import "./AccidentLog.css";
import { useAccidentLogs } from "../../context/AccidentContext"; // Import the custom hook
import { useAuth } from "../../authentication/AuthProvider"; // Import auth context

const AccidentLog = () => {
  const { accidentLogs, handleAccidentStatusChange, handleRowDoubleClick } = useAccidentLogs(); // Use context
  const { user } = useAuth(); // Get the logged-in user info
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
          {accidentLogs
           .slice() // Avoid mutating the original array
           .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate)) // sorting from new to old
           .map((log, index) => (
            <tr
              key={index}
              className={`${selectedRowIndex === index ? "highlighted" : ""} ${log.status}`}
              onClick={() => handleRowClick(index)} // Highlight row on click
              onDoubleClick={() => handleRowDoubleClick(log)} // Double click to view details
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
              <td>{log.assignedTo || "N/A"}</td>
              <td>
                {log.status === "assigned" && log.assignedTo !== user?.username ? (
                  <button className="assigned" disabled>
                    Assigned to {log.assignedTo}
                  </button>
                ) :  log.status !== "handled" && (
                  <button
                    className="assign"
                    onClick={() =>
                      handleAccidentStatusChange(
                        log._id,
                        log.status === "assigned" ? "active" : "assigned"
                      )
                    }
                  >
                    {log.status === "assigned" && log.assignedTo === user?.username
                      ? "Unassign"
                      : "Assign"}
                  </button>
                )}
                {log.status === "assigned" && log.assignedTo === user?.username &&
                <button
                    className="mark-as-handled"
                    onClick={() =>
                        handleAccidentStatusChange(
                            log._id,
                            "handled"
                        )
                    }
                >
                  Mark as handled
                </button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccidentLog;
