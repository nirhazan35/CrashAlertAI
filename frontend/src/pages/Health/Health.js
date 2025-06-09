import React from 'react';

const Health = () => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '1.5rem',
        backgroundColor: '#f9f9f9'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', color: '#333' }}>
          Frontend Health Check
        </h1>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Status:</strong>{' '}
          <span style={{ color: '#28a745', fontWeight: 'bold' }}>
            {healthData.status}
          </span>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Timestamp:</strong> {healthData.timestamp}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Version:</strong> {healthData.version}
        </div>
        <div>
          <strong>Environment:</strong> {healthData.environment}
        </div>
      </div>
    </div>
  );
};

export default Health; 