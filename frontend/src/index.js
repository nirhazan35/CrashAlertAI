import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './authentication/AuthProvider';
import { AccidentLogsProvider } from './context/AccidentContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AccidentLogsProvider>
        <App />
      </AccidentLogsProvider>
    </AuthProvider>
  </React.StrictMode>
);

