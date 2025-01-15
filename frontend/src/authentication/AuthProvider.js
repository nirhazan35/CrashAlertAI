import React, { createContext, useContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true); // Track loading state
  const [user, setUser] = useState();


  useEffect(() => {
    async function fetchAccessToken() {
      try {
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
          });
        } else {
          console.error("Failed to fetch access token:", response.status);
          setUser({ isLoggedIn: false, role: null, token: null });
        }
      } catch (error) {
        console.error("Error during token refresh:", error.message);
        setUser({ isLoggedIn: false, role: null, token: null });
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    }
    fetchAccessToken();
  }, []); // Run on component mount

  const login = (accessToken) => {
    const decoded = jwtDecode(accessToken);
    setUser({
      isLoggedIn: true,
      role: decoded.role,
      token: accessToken,
    });
  };


  const logout = async () => {
     try {
       const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/logout`, {
            method: "POST",
            credentials: "include", // Send HTTP-only refresh token cookie
          });
        if (response.ok) {
          setUser({ isLoggedIn: false, role: null, token: null });
        } else {
          console.error("Logout failed:", response.status);
        }
     } catch (error) {
       console.error("Logout failed:", error.message);
     }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
