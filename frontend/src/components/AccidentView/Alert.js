// frontend/src/components/AccidentView/Alert.js
import React, { useState, useEffect } from 'react';
import './Alert.css';
import { useAuth } from '../../authentication/AuthProvider';

const Alert = ({ alert }) => {
  const { user } = useAuth();
  // Initialize hooks unconditionally.
  const [accidentDetails, setAccidentDetails] = useState(alert || null);
  const [descEditMode, setDescEditMode] = useState(false);
  const [newDescription, setNewDescription] = useState((alert && alert.description) || '');
  const [selectedSeverity, setSelectedSeverity] = useState((alert && alert.severity) || 'low');

  // Update local state if the alert prop changes.
  useEffect(() => {
    if (alert) {
      setAccidentDetails(alert);
      setSelectedSeverity(alert.severity || 'low');
      setNewDescription(alert.description || '');
    }
  }, [alert]);

  if (!accidentDetails) {
    return <div className="alert-container">No accident selected.</div>;
  }

  // Helper function to update accident details in backend and update local state.
  const updateAccidentField = async (updateData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/update-accident-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          accident_id: accidentDetails._id,
          ...updateData,
        }),
      });
      if (response.ok) {
        const updatedAccident = await response.json();
        setAccidentDetails(updatedAccident);
        window.alert("Accident updated successfully!");
      } else {
        const errorData = await response.json();
        window.alert(`Update failed: ${errorData.message}`);
      }
    } catch (error) {
      window.alert("Error updating accident.");
      console.error("Update error:", error);
    }
  };

  // Handle severity change with confirmation.
  const handleSeverityChange = async (e) => {
    const newSeverity = e.target.value;
    if (newSeverity === selectedSeverity) return;
    const confirmChange = window.confirm(`Are you sure you want to change severity from ${selectedSeverity} to ${newSeverity}?`);
    if (confirmChange) {
      setSelectedSeverity(newSeverity);
      await updateAccidentField({ severity: newSeverity });
    }
  };

  // Save the new description after editing.
  const handleDescriptionSave = async () => {
    await updateAccidentField({ description: newDescription });
    setDescEditMode(false);
  };

  // Toggle the falsePositive value with confirmation.
  const handleToggleAccidentMark = async () => {
    const currentMark = accidentDetails.falsePositive;
    const confirmToggle = window.confirm(
      currentMark 
        ? "Are you sure you want to mark this as an accident?" 
        : "Are you sure you want to mark this as not an accident?"
    );
    if (confirmToggle) {
      await updateAccidentField({ falsePositive: !currentMark });
    }
  };

  return (
    <div className="alert-container">
      <video className="alert-video" controls autoPlay>
        <source src={accidentDetails.video || ''} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="alert-details-container">
        <div className="alert-details">
          <div className="detail-row">
            <div className="detail-label"><strong>Status:</strong></div>
            <div className="detail-value">{accidentDetails.status || 'N/A'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Camera ID:</strong></div>
            <div className="detail-value">{accidentDetails.cameraId || 'N/A'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Location:</strong></div>
            <div className="detail-value">{accidentDetails.location || 'N/A'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Date:</strong></div>
            <div className="detail-value">{accidentDetails.displayDate || 'N/A'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Time:</strong></div>
            <div className="detail-value">{accidentDetails.displayTime || '00:00'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Severity:</strong></div>
            <div className="detail-value">
              <select value={selectedSeverity} onChange={handleSeverityChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Description:</strong></div>
            <div className="detail-value">
              {!descEditMode ? (
                <>
                  <span>{accidentDetails.description || 'No Description'}</span>
                  <button className="edit-btn" onClick={() => setDescEditMode(true)}>Edit</button>
                </>
              ) : (
                <>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows="2"
                  />
                  <button className="save-btn" onClick={handleDescriptionSave}>Save</button>
                  <button className="cancel-btn" onClick={() => { setDescEditMode(false); setNewDescription(accidentDetails.description || ''); }}>Cancel</button>
                </>
              )}
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><strong>Accident Mark:</strong></div>
            <div className="detail-value">
              {accidentDetails.falsePositive ? (
                <span style={{ color: 'red' }}>Not an Accident</span>
              ) : (
                <span>Accident</span>
              )}
            </div>
          </div>
        </div>
        <div className="alert-actions">
          <button onClick={handleToggleAccidentMark}>
            {accidentDetails.falsePositive ? "Mark As An Accident" : "Mark As Not An Accident"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
