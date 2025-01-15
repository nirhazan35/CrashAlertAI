import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_URL_BACKEND, // Set your backend URL
  withCredentials: true, // Include cookies (e.g., refresh token)
});

// Request interceptor
// const authInterceptor = api.interceptors.request.use((config) => {
//   config.headers.Authorization = !config._retry && token ? `Bearer ${token}` : config.headers.Authorization;
//   return config;
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken"); // Example if token stored in memory or state
//     console.log("Token in api.js:", token);
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Response interceptor (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally, e.g., refresh token logic
    return Promise.reject(error);
  }
);

export default api;
