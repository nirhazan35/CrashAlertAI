import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './Login.css';
import { useAuth } from '../authentication/AuthProvider';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { user, login } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isLoggedIn) {
      // If user is logged in, redirect to the dashboard using navigate
      navigate('/admin');
    }
  }, [user, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call the login function from the AuthProvider
      const payload = { username, password };
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (response.status !== 200) {
        console.error("Login failed:", response.status);
        throw new Error("Login failed");
      }
      setError(null);
      const data = await response.json();
      const {accessToken} =  data;
      login(accessToken);
      // Redirect
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
