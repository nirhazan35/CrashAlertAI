// src/components/Register/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../authentication/AuthProvider';
import {
  TextInput,
  Select,
  Button,
  Alert,
  Text,
  Container,
  Box,
  Title,
  Paper,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconUser,
  IconMail,
  IconShield,
  IconCheck,
} from '@tabler/icons-react';
import '../authFormCSS/AuthForm.css';

const Register = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };
  const handleRoleChange = (value) => {
    setForm({ ...form, role: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_URL_BACKEND}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          credentials: 'include',
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage('registered successfully!');
        setForm({ username: '', email: '', password: '', role: 'user' });
      } else {
        setMessage(`Registration failed: ${data.message || 'Unknown error'}`);
      }
    } catch {
      setMessage(
        'An error occurred while registering. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="auth-page">
      <Container size="xs">
        <Paper className="auth-container" shadow="md" style={{ padding: '2.5rem' }}>
          <Title order={2} style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            Register New User
          </Title>
          <Text className="auth-subtitle" mb="xl">
            Create a new user account with the following details
          </Text>

          {message && message.includes('successful') && (
            <Alert
              icon={<IconCheck size="1.5rem" />}
              title="Success"
              color="green"
              variant="light"
              radius="md"
            >
              {message}
            </Alert>
          )}
          {message && !message.includes('successful') && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Error"
              color="red"
              radius="md"
            >
              {message}
            </Alert>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <TextInput
              label="Username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange('username')}
              required
              icon={<IconUser size="1rem" />}
              size="md"
            />

            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange('email')}
              required
              icon={<IconMail size="1rem" />}
              size="md"
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              required
              size="md"
            />

            <Select
              label="Role"
              placeholder="Select user role"
              value={form.role}
              onChange={handleRoleChange}
              data={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ]}
              icon={<IconShield size="1rem" />}
              size="md"
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              size="md"
            >
              {isLoading ? 'Registering...' : 'Register User'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
