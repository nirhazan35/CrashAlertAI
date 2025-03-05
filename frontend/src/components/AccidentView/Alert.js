import React, { useState, useEffect } from "react";
import "./Alert.css";
import { useAuth } from "../../authentication/AuthProvider";
import { useAccidentLogs } from "../../context/AccidentContext";

const Alert = () => {
  const { user } = useAuth();
  const {
    selectedAlert,
    updateAccidentDetails,
    updateAccidentStatus,
    clearSelectedAlert,
  } = useAccidentLogs();
  const [descEditMode, setDescEditMode] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("low");

  useEffect(() => {
    if (selectedAlert) {
      setNewDescription(selectedAlert.description || "");
      setSelectedSeverity(selectedAlert.severity || "low");
    }
  }, [selectedAlert]);

  if (!selectedAlert) {
    return <div className="alert-container">No accident selected.</div>;
  }

  const isEditable = selectedAlert.assignedTo === user.username;

  const handleSeverityChange = async (e) => {
    const newVal = e.target.value;
    if (newVal === selectedSeverity) return;
    if (window.confirm(`Change severity from ${selectedSeverity} to ${newVal}?`)) {
      await updateAccidentDetails({ accident_id: selectedAlert._id, severity: newVal });
      setSelectedSeverity(newVal);
    }
  };

  const handleDescriptionSave = async () => {
    await updateAccidentDetails({ accident_id: selectedAlert._id, description: newDescription });
    setDescEditMode(false);
  };

  const handleToggleAccidentMark = async () => {
    if (window.confirm(
      selectedAlert.falsePositive
        ? "Mark as an accident?"
        : "Mark as not an accident?"
    )) {
      await updateAccidentDetails({
        accident_id: selectedAlert._id,
        falsePositive: !selectedAlert.falsePositive,
      });
    }
  };

  const handleMarkAsHandled = async () => {
    if (window.confirm("Mark this accident as handled?")) {
      await updateAccidentStatus(selectedAlert._id, "handled");
      clearSelectedAlert();
    }
  };

  return (
    <div className="alert-container">
      {/* Show error message on top of video */}
      {videoError && (
        <div className="video-error-message">
          Unable to load or play the video.
        </div>
      )}

      <video className="alert-video" controls autoPlay onError={handleVideoError}>
        <source src={video || '1'} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="alert-details-container">
        <div className="alert-details">
          <div className="detail-row">
            <div className="detail-label"><strong>Status:</strong></div>
            <div className="detail-value">{selectedAlert.status}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Camera ID:</strong></div>
            <div className="detail-value">{selectedAlert.cameraId}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Location:</strong></div>
            <div className="detail-value">{selectedAlert.location}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Date:</strong></div>
            <div className="detail-value">{selectedAlert.displayDate}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Time:</strong></div>
            <div className="detail-value">{selectedAlert.displayTime}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Severity:</strong></div>
            <div className="detail-value">
              {isEditable ? (
                <select value={selectedSeverity} onChange={handleSeverityChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <span>{selectedAlert.severity}</span>
              )}
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Description:</strong></div>
            <div className="detail-value">
              {!descEditMode ? (
                <>
                  <span>{selectedAlert.description || "No Description"}</span>
                  {isEditable && (
                    <button onClick={() => setDescEditMode(true)}>Edit</button>
                  )}
                </>
              ) : (
                <>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows="2"
                  />
                  <button onClick={handleDescriptionSave}>Save</button>
                  <button onClick={() => setDescEditMode(false)}>Cancel</button>
                </>
              )}
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Accident Mark:</strong></div>
            <div className="detail-value">
              {selectedAlert.falsePositive ? (
                <span style={{ color: "red" }}>Not an Accident</span>
              ) : (
                <span>Accident</span>
              )}
            </div>
          </div>
        </div>
        {isEditable && (
          <div className="alert-actions">
            <button onClick={handleToggleAccidentMark}>
              {selectedAlert.falsePositive ? "Mark As An Accident" : "Mark As Not An Accident"}
            </button>
            {selectedAlert.status !== "handled" && (
              <button onClick={handleMarkAsHandled}>Mark As Handled</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
