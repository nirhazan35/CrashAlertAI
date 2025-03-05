// frontend/src/components/AccidentLogs/AccidentLog.js
import React, { useState } from "react";
import "./AccidentLog.css";
import { useAccidentLogs } from "../../context/AccidentContext";
import { useAuth } from "../../authentication/AuthProvider";

// Generate time options for each hour (e.g., 00:00, 01:00, ... 23:00)
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

const AccidentLog = () => {
  const { accidentLogs, handleAccidentStatusChange, handleRowDoubleClick } = useAccidentLogs();
  const { user } = useAuth();
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Filter state including new time filters
  const [filters, setFilters] = useState({
    cameraId: "",
    location: "",
    date: "",
    severity: "",
    startTime: "",
    endTime: "",
  });

  // Handler for filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      cameraId: "",
      location: "",
      date: "",
      severity: "",
      startTime: "",
      endTime: "",
    });
  };

  // Filter accident logs based on the filter criteria
  const filteredLogs = accidentLogs.filter((log) => {
    const matchesCameraId =
      filters.cameraId === "" || log.cameraId.toLowerCase() === filters.cameraId.toLowerCase();
    const matchesLocation =
      filters.location === "" || log.location.toLowerCase() === filters.location.toLowerCase();
    const matchesDate =
      filters.date === "" ||
      (log.displayDate &&
        log.displayDate === new Date(filters.date).toLocaleDateString("en-GB"));
    const matchesSeverity =
      filters.severity === "" || log.severity.toLowerCase() === filters.severity.toLowerCase();
    // Time filter: check if log.displayTime is within the selected range (if provided)
    let matchesTime = true;
    if (filters.startTime) {
      matchesTime = matchesTime && (log.displayTime >= filters.startTime + ":00");
    }
    if (filters.endTime) {
      matchesTime = matchesTime && (log.displayTime <= filters.endTime + ":00");
    }
    return matchesCameraId && matchesLocation && matchesDate && matchesSeverity && matchesTime;
  });

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

        {/* Time filters as dropdowns */}
        <select name="startTime" value={filters.startTime} onChange={handleFilterChange}>
          <option value="">From Time</option>
          {timeOptions.map((time) => (
            <option key={`start-${time}`} value={time}>
              {time}
            </option>
          ))}
        </select>

        <select name="endTime" value={filters.endTime} onChange={handleFilterChange}>
          <option value="">To Time</option>
          {timeOptions.map((time) => (
            <option key={`end-${time}`} value={time}>
              {time}
            </option>
          ))}
        </select>

        <button onClick={handleClearFilters}>Clear Filters</button>
      </div>

      <div className="accident-log-container">
        <table className="accident-log-table">
          <thead>
            <tr>
              <th>Video</th>
              <th>Location</th>
              <th>Date</th>
              <th>Time</th>
              <th>Severity</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs
              .slice()
              .sort((a, b) => new Date(a.date) - new Date(b.date))
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
                  <td>{log.displayTime}</td>
                  <td>{log.severity}</td>
                  <td>{log.description}</td>
                  <td>
                    {log.status === "assigned" && log.assignedTo !== user?.username ? (
                      <button className="assigned" disabled>
                        Assigned to {log.assignedTo}
                      </button>
                    ) : (
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
