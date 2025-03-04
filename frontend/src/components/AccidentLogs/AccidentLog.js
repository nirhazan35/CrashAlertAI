import React, { useState } from "react";
import "./AccidentLog.css";
import { useAccidentLogs } from "../../context/AccidentContext"; // Use context for accident logs
import { useAuth } from "../../authentication/AuthProvider"; // Get logged-in user info

const AccidentLog = () => {
  const { accidentLogs, handleAccidentStatusChange, handleRowDoubleClick } = useAccidentLogs();
  const { user } = useAuth();
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    cameraId: "",
    location: "",
    date: "",
    severity: "",
  });

  // Update filter state when an input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Filter accident logs based on filter criteria
  const filteredLogs = accidentLogs.filter((log) => {
    return (
      (filters.cameraId === "" || log.cameraId.toLowerCase() === filters.cameraId.toLowerCase()) &&
      (filters.location === "" || log.location.toLowerCase() === filters.location.toLowerCase()) &&
      (filters.date === "" || (log.displayDate && log.displayDate.includes(filters.date))) &&
      (filters.severity === "" || log.severity.toLowerCase() === filters.severity.toLowerCase())
    );
  });

  // Handle row click: highlight the clicked row
  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  return (
    <div>
      {/* Filter Options */}
      <div className="filter-container">
        <select name="cameraId" value={filters.cameraId} onChange={handleFilterChange}>
          <option value="">All Camera IDs</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>

        <select name="location" value={filters.location} onChange={handleFilterChange}>
          <option value="">All Locations</option>
          <option value="Highway 1">Highway 1</option>
          <option value="Highway 2">Highway 2</option>
        </select>

        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          placeholder="Filter by Date"
        />

        <select name="severity" value={filters.severity} onChange={handleFilterChange}>
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="accident-log-container">
        <table className="accident-log-table">
          <thead>
            <tr>
              <th>Video</th>
              <th>Location</th>
              <th>Date</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs
              .slice() // Avoid mutating the original array
              .sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate)) // Sorting from new to old
              .map((log, index) => (
                <tr
                  key={index}
                  className={`${selectedRowIndex === index ? "highlighted" : ""} ${log.status}`}
                  onClick={() => handleRowClick(index)}
                  onDoubleClick={() => handleRowDoubleClick(log)}
                >
                  <td>
                    <a href={log.video} target="_blank" rel="noopener noreferrer">
                      View Video
                    </a>
                  </td>
                  <td>{log.location}</td>
                  <td>{log.displayDate}</td>
                  <td>{log.severity}</td>
                  <td>{log.description}</td>
                  <td>
                    {log.status === "assigned" && log.assignedTo !== user?.username ? (
                      <button className="assigned" disabled>
                        Assigned to {log.assignedTo}
                      </button>
                    ) : log.status !== "handled" && (
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
                    {log.status === "assigned" && log.assignedTo === user?.username && (
                      <button
                        className="mark-as-handled"
                        onClick={() => handleAccidentStatusChange(log._id, "handled")}
                      >
                        Mark as handled
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccidentLog;
