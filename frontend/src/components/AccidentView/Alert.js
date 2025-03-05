import React, { useState } from 'react';
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
  const [videoError, setVideoError] = useState(false);

  const handleVideoError = () => {
    setVideoError(true);
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
