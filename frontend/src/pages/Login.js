import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../authentication';
import api from "../api";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth()

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call the login function from the AuthProvider
      console.log("POST /auth/login", { username, password });
      const payload = { username, password };
      const response = await api.post("/auth/login", payload);

      console.log("POST /auth/login", response.status);

      if (response.status !== 200) {
        console.error("Login failed:", response.status);
        throw new Error(response.data || "Login failed");
      }
      setError(null);
      const token =  response.data.accessToken;
      login(token);
      // Redirect to the dashboard
      navigate('/admin');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>  {}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
