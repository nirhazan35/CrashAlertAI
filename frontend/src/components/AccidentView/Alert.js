import React from 'react';
import './Alert.css';

// AlertDetails Component
const AlertDetails = ({ location, date, severity, vehiclesInvolved, description }) => (
  <div className="alert-details">
    <p><strong>Location:</strong> {location || 'N/A'}</p>
    <p><strong>Date:</strong> {date || 'N/A'}</p>
    <p><strong>Severity:</strong> {severity || 'N/A'}</p>
    <p><strong>Vehicles Involved:</strong> {vehiclesInvolved || 'N/A'}</p>
    <p><strong>Description:</strong> {description || 'N/A'}</p>
  </div>
);

// Main Alert Component
const Alert = ({ alert }) => {
  const { videoReference, Location, Date, Severity, VehiclesInvolved, Description } = alert || {};

  return (
    <div className="alert-container">
      <video className="alert-video" controls autoPlay>
        {/* If no video reference, leave the source empty for a black screen */}
        <source src={videoReference || ''} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Passing alert details to AlertDetails component */}
      <AlertDetails
        location={Location}
        date={Date}
        severity={Severity}
        vehiclesInvolved={VehiclesInvolved}
        description={Description}
      />
    </div>
  );
};

export default Alert;
