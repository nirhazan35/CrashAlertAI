// src/components/Login/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../authentication/AuthProvider';
import { 
  TextInput,
  Button, 
  Title, 
  Text, 
  Container, 
  Box
} from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
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
        <div className="auth-container" style={{ position: 'relative', zIndex: 1 }}>
          <Title order={2} style={{ textAlign: 'center' }}>CrashAlert AI</Title>
          <div className="auth-subtitle">
            Welcome back! Please enter your credentials to continue
          </div>

          {error && <p className="auth-error-message">{error}</p>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <TextInput
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              icon={<IconUser size="1rem" />}
              size="md"
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="md"
              type="password"
            />

            <Button type="submit" fullWidth loading={loading} size="md">
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
