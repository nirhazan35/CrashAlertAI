import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../authentication/AuthProvider';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      
      if (response.status !== 200) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      setError(null);
      const data = await response.json();
      const { accessToken, session } = data;
      
      // Pass both the access token and session info to the login function
      await login(accessToken, session);
      
      // If session.singleSessionOnly is true, show a message
      if (session && session.singleSessionOnly) {
        console.log("Note: Your account is configured for single-session only. Logging in from another device will terminate this session.");
      }
      
      // Redirect
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
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
