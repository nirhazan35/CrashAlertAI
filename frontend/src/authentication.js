// import React, { createContext, useContext, useState, useEffect } from "react";
// import {jwtDecode} from "jwt-decode";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState({
//     isLoggedIn: false,
//     role: null,
//     token: null,
//   });

//   const login = (accessToken) => {
//     const decoded = jwtDecode(accessToken);
//     setUser({
//       isLoggedIn: true,
//       role: decoded.role,
//       token: accessToken,
//     });
//   };

//   const logout = async () => {
//     try {
//       await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/logout`, {
//         method: "POST",
//         credentials: "include", // Include the refresh token cookie
//       });
//       setUser({ isLoggedIn: false, role: null, token: null });
//     } catch (error) {
//       console.error("Logout failed:", error.message);
//     }
//   };

//   useEffect(() => {
//     async function refreshAccessToken() {
//       try {
//         const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/authMe`, {
//           method: "GET",
//           credentials: "include", // Send HTTP-only refresh token cookie
//         });

//         if (response.ok) {
//           const data = await response.json();
//           const { accessToken } = data;
//           const decoded = jwtDecode(accessToken);

//           setUser({
//             isLoggedIn: true,
//             role: decoded.role,
//             token: accessToken,
//           });
//         } else {
//           console.error("Failed to refresh access token:", response.status);
//           setUser({ isLoggedIn: false, role: null, token: null });
//         }
//       } catch (error) {
//         console.error("Error during token refresh:", error.message);
//         setUser({ isLoggedIn: false, role: null, token: null });
//       }
//     }

//     refreshAccessToken();
//   }, []); // Run on component mount

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import api from "./api"; // Axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: null,
    token: null,
  });
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    async function refreshAccessToken() {
      try {
        const response = await api.get("/auth/authMe");
        const { accessToken } = response.data;

        const decoded = jwtDecode(accessToken);
        setUser({
          isLoggedIn: true,
          role: decoded.role,
          token: accessToken,
        });
      } catch (error) {
        console.error("Error during token refresh:", error.message);
        setUser({ isLoggedIn: false, role: null, token: null });
      } finally {
        setLoading(false); // Ensure loading is set to false after refresh attempt
      }
    }

    refreshAccessToken();
  }, []);

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
      await api.post("/auth/logout");
      setUser({ isLoggedIn: false, role: null, token: null });
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
