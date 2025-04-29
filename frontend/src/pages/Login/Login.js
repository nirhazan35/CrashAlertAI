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
  Center, 
  Box, 
  Alert,
  useMantineTheme
} from '@mantine/core';
import { IconAlertCircle, IconEyeCheck, IconEyeOff } from '@tabler/icons-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const theme = useMantineTheme();

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
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.gray[0]
      }}
    >
      <Container size="xs">
        <Paper
          radius="md"
          p={30}
          withBorder
          shadow="md"
        >
          <Title
            order={2}
            ta="center"
            mb="xl"
            fw={900}
            c={theme.colors.brand[7]}
          >
            CrashAlert AI
          </Title>
          
          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />}
              title="Authentication Error" 
              color="red" 
              radius="md"
              mb="md"
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
            />
            
            <Button
              fullWidth
              type="submit"
              loading={loading}
              size="md"
            >
              Login
            </Button>
          </form>
          
          <Text ta="center" mt="lg" size="sm" c="dimmed">
            Forgot your password?{" "}
            <Link to="/forgot-password" style={{ color: theme.colors.brand[5], textDecoration: 'none' }}>
              Reset Password
            </Link>
          </Text>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
