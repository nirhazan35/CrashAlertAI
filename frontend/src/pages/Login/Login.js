import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../authentication/AuthProvider';
import { Button, Title, Text, Container, Box } from '@mantine/core';
import { IconUser, IconLock } from '@tabler/icons-react';
import '../authFormCSS/AuthForm.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Login failed");
      }
      const data = await response.json();
      await login(data.accessToken, data.session);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-page">
      <Container size="xs">
        <div className="auth-container">
          <Title order={2} style={{ textAlign: 'center' }}>CrashAlert AI</Title>
          <div className="auth-subtitle">
            Welcome back! Please enter your credentials to continue
          </div>

          {error && <div className="auth-message auth-message-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label className="auth-input-label">Username</label>
              <div className="auth-input-wrapper">
                <IconUser size="1rem" className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Password</label>
              <div className="auth-input-wrapper">
                <IconLock size="1rem" className="auth-input-icon" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              loading={loading} 
              size="md"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Text ta="center" mt="lg" size="sm" className="auth-link-text">
            Forgot your password?{" "}
            <Link to="/forgot-password" className="auth-link">
              Reset Password
            </Link>
          </Text>
        </div>
      </Container>
    </Box>
  );
};

export default Login;