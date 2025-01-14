import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

// Create AuthContext
const AuthContext = createContext();

// Export AuthProvider
export const AuthProvider = ({ children }) => {
  console.log("AuthProvider rendered"); // Debug log
  console.log("AuthProvider", children);
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: null,
    token: null,
  });

  const login = (token) => {
    console.log("AuthProvider login", token);
    const decoded = jwtDecode(token);
    console.log("AuthProvider login decoded", decoded);
    setUser({
      isLoggedIn: true,
      role: decoded.role,
      token: token,
    });
  };

  useEffect(() => {
    async function checkToken() {
      console.log('Checking token...');
      try {
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/authMe`, {
          method: 'GET',
          credentials: 'include',
        });
        console.log('GET /auth/authMe', response.status);
    
        if (response.ok) {
          const data = await response.json();
          const { accessToken } = data;
          console.log('New Access Token:', accessToken);
          return accessToken;
        } else {
          console.error('Error refreshing token:', response.status);
          const errorData = await response.json();
          console.error('Error refreshing token:', errorData.message);
          return null;
        }
      } catch (error) {
        console.error('Error refreshing token:', error.message);
        return null;
      }
    }

    checkToken();
  }, []);

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
