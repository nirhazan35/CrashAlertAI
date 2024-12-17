import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication'; // Assuming you have AuthContext set up
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      // Simulating a login call with a mock token
      const mockToken = 'mock-jwt-token'; // Replace with actual authentication logic
      login(mockToken);  // Assuming your login function accepts a token
      setError(null); // Reset error state

      // Redirect to the dashboard
      navigate('/dashboard');
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
