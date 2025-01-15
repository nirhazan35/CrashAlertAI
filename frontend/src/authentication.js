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
          // const data = await response.json();
          // const { accessToken } = data;
          // const decoded = jwtDecode(accessToken);

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

import React, { createContext, useContext, useState, useLayoutEffect, useEffect } from "react";
import {jwtDecode} from "jwt-decode";
// import api from "./api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(); // Track token state
  const [loading, setLoading] = useState(true); // Track loading state
  const [user, setUser] = useState();


  useEffect(() => {
    async function fetchAccessToken() {
      console.log("Fetching access token...");
      try {
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/authMe`, {
            method: "GET",
            credentials: "include", // Send HTTP-only refresh token cookie
          });
          
        if (response.ok) {
          const data = await response.json();
          const { accessToken } = data;
          const decoded = jwtDecode(accessToken);
          console.log("Access Token:", accessToken);
          console.log("Decoded:", decoded);
          setUser({
            isLoggedIn: true,
            role: decoded.role,
            token: accessToken,
          });
          setToken(accessToken);
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
    setToken(accessToken);
  };

  // useLayoutEffect(() => {
  //   console.log("Setting up interceptor...");
  //   const authInterceptor = api.interceptors.request.use((config) => {
  //     console.log("Config:", config);
  //     console.log("Token:", token);
  //     config.headers.Authorization = !config._retry && user.accessToken ? `Bearer ${token}` : config.headers.Authorization;
  //     console.log("Token in interceptor:", token);
  //     return config;
  //   });
  //   return () => api.interceptors.request.eject(authInterceptor);
  // }, [token]);

  const logout = async () => {
  //   try {
  //     await api.post("/auth/logout");
  //     setUser({ isLoggedIn: false, role: null, token: null });
  //   } catch (error) {
  //     console.error("Logout failed:", error.message);
  //   }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

  // useEffect(() => {
  //   async function fetchAccessToken() {
  //     console.log("Fetching access token...");
  //     try {
  //       const response = await api.get("/auth/authMe", { withCredentials: true });
  //       if (response.status === 200) {
  //         const { accessToken } = response.data;
  //         const decoded = jwtDecode(accessToken);
  //         setUser({
  //           isLoggedIn: true,
  //           role: decoded.role,
  //           token: accessToken,
  //         });
  //         setToken(accessToken);
  //       } else {
  //         console.error("Failed to fetch access token:", response.status);
  //         setUser({ isLoggedIn: false, role: null, token: null });
  //       }
  //     } catch (error) {
  //       console.error("Error during token refresh:", error.message);
  //       setUser({ isLoggedIn: false, role: null, token: null });
  //     } finally {
  //       setLoading(false); // Set loading to false after fetching
  //     }
  //   }

  //   fetchAccessToken();
  // }, []); // Run on component mount



  // useLayoutEffect(() => {
  //   async function refreshAccessToken() {
  //     try {
  //       console.log("Refreshing access token...");
  //       // const response = await api.get("/auth/authMe");
  //       const response = await api.get("/auth/authMe", { withCredentials: true });

  //       console.log("Refresh response:", response);
  //       const accessToken = response.data.accessToken;
  //       console.log("Access Token:", accessToken);

  //       const decoded = jwtDecode(accessToken);
  //       setUser({
  //         isLoggedIn: true,
  //         role: decoded.role,
  //         token: accessToken,
  //       });
  //     } catch (error) {
  //       console.error("Error during token refresh:", error.message);
  //       setUser({ isLoggedIn: false, role: null, token: null });
  //     } finally {
  //       setLoading(false); // Ensure loading is set to false after refresh attempt
  //     }
  //   }

  //   refreshAccessToken();
  // }, []);