import React, { createContext, useContext, useState } from 'react';
import {jwtDecode} from 'jwt-decode';

// Create AuthContext
const AuthContext = createContext();

// Export AuthProvider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: null,
  });

  const login = (token) => {
    const decoded = jwtDecode(token);
    setUser({
      isLoggedIn: true,
      role: decoded.role,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth hook
export const useAuth = () => {
  return useContext(AuthContext); // Make sure AuthContext is defined before this
};
