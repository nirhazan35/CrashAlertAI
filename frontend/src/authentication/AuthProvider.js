import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { connectSocket, disconnectSocket, onForceLogout } from "../services/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User state
  const [loading, setLoading] = useState(true); // Track loading state
  const [sessionInfo, setSessionInfo] = useState(null); // Track session info

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/authMe`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          const { accessToken } = data;
          const decoded = jwtDecode(accessToken);
          setUser({
            isLoggedIn: true,
            role: decoded.role,
            token: accessToken,
            username: decoded.username,
          });
          connectSocket(accessToken); // Connect to socket after fetching token
          
          // Set up force logout handler
          onForceLogout(handleForceLogout);
        } else {
          console.error("Failed to fetch access token:", response.status);
          setUser({ isLoggedIn: false, role: null, token: null, username: null });
        }
      } catch (error) {
        console.error("Error during token refresh:", error.message);
        setUser({ isLoggedIn: false, role: null, token: null, username: null });
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchAccessToken();
    
    // Cleanup function
    return () => {
      disconnectSocket();
    };
  }, []);
  
  // Handler for forced logout
  const handleForceLogout = (message) => {
    // Show alert with the message
    alert(`You have been logged out: ${message}`);
    
    // Clear user data and disconnect socket
    disconnectSocket();
    setUser({ isLoggedIn: false, role: null, token: null, username: null });
    setSessionInfo(null);
    
    // Redirect to login page
    window.location.href = '/login';
  };

  const login = async (accessToken, sessionData) => {
    const decoded = jwtDecode(accessToken);
    setUser({
      isLoggedIn: true,
      role: decoded.role,
      token: accessToken,
      username: decoded.username,
    });
    
    // Store session info if provided
    if (sessionData) {
      setSessionInfo(sessionData);
    }
    
    connectSocket(accessToken); // Connect to socket after login
    
    // Set up force logout handler after login
    onForceLogout(handleForceLogout);
  };

  const logout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user.username }),
        credentials: "include",
      });
      if (response.ok) {
        disconnectSocket(); // Disconnect socket on logout
        setUser({ isLoggedIn: false, role: null, token: null, username: null });
        setSessionInfo(null);
      } else {
        console.error("Logout failed:", response.status);
      }
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, sessionInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
