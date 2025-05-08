import React, {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import { useAuth } from '../../authentication/AuthProvider';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Title, 
  Text, 
  Paper, 
  Container, 
  Box, 
  Alert
} from '@mantine/core';
import { IconAlertCircle, IconEyeCheck, IconEyeOff, IconUser, IconLock } from '@tabler/icons-react';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-page">
      <Container size="xs">
        <Paper className="login-paper">
          <Title order={2} className="login-title" style={{ textAlign: 'center' }}>
            CrashAlert AI
          </Title>
          <div className="login-subtitle">
            Welcome back! Please enter your credentials to continue
          </div>
          
          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />}
              title="Authentication Error" 
              color="red" 
              radius="md"
              mb="md"
              className="login-error"
            >
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextInput
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              mb="md"
              className="login-input"
              icon={<IconUser size="1rem" />}
              size="md"
            />
            
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              visibilityToggleIcon={({ reveal }) =>
                reveal ? <IconEyeOff size={16} /> : <IconEyeCheck size={16} />
              }
              mb="xl"
              className="login-input"
              icon={<IconLock size="1rem" />}
              size="md"
            />
            
            <Button
              fullWidth
              type="submit"
              loading={loading}
              size="md"
              className="login-button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <Text ta="center" mt="lg" size="sm" className="forgot-password-text">
            Forgot your password?{" "}
            <Link to="/forgot-password" className="forgot-password-link">
              Reset Password
            </Link>
          </Text>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
