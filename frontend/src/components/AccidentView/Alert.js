import React from 'react';
import './Alert.css';

// AlertDetails Component
const AlertDetails = ({ cameraId, location, date, severity, status, description }) => (
  <div className="alert-details">
    <p><strong>Status:</strong> {status || 'N/A'}</p>
    <p><strong>Camera ID:</strong> {cameraId || 'N/A'}</p>
    <p><strong>Location:</strong> {location || 'N/A'}</p>
    <p><strong>Date:</strong> {date || 'N/A'}</p>
    <p><strong>Severity:</strong> {severity || 'N/A'}</p>
    <p><strong>Description:</strong> {description || 'No Description'}</p>
  </div>
);

// Main Alert Component
const Alert = ({ alert }) => {
  const { cameraId, video, location, displayDate, severity, description, status } = alert || {};

  return (
    <div className="alert-container">
      <video className="alert-video" controls autoPlay>
        {/* If no video reference, leave the source empty for a black screen */}
        <source src={video || ''} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Passing alert details to AlertDetails component */}
      <AlertDetails
        cameraId={cameraId}
        location={location}
        date={displayDate}
        severity={severity}
        description={description}
        status={status}
        video={video}
      />
    </div>
  );
};

export default Alert;
