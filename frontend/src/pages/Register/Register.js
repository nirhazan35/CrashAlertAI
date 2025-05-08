import React, { useState } from "react";
import { useAuth } from "../../authentication/AuthProvider";
import { 
  TextInput, 
  PasswordInput, 
  Select, 
  Button, 
  Title, 
  Container, 
  Box 
} from '@mantine/core';
import { IconUser, IconMail, IconLock, IconShield } from '@tabler/icons-react';
import '../authFormCSS/AuthForm.css';

const Register = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({ username, email, password, role }),
        credentials: "include",
      });

      if (response.ok) {
        setMessage("Registration successful!");
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("user");
      } else {
        const errorData = await response.json();
        setMessage(`Registration failed: ${errorData.message}`);
      }
    } catch (error) {
      setMessage("An error occurred while registering. Please try again later.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="auth-page">
      <Container size="xs">
        <div className="auth-container">
          <Title order={2} style={{ textAlign: 'center' }}>Register New User</Title>
          <div className="auth-subtitle">
            Create a new user account with the following details
          </div>

          {message && (
            <p className={`auth-message ${message.includes("successful") ? "auth-message-success" : "auth-message-error"}`}>
              {message}
            </p>
          )}

          <form onSubmit={handleRegister}>
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
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              icon={<IconMail size="1rem" />}
              size="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<IconLock size="1rem" />}
              size="md"
            />

            <Select
              label="Role"
              placeholder="Select user role"
              value={role}
              onChange={setRole}
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
              mt="xl"
            >
              {isLoading ? "Registering..." : "Register User"}
            </Button>
          </form>
        </div>
      </Container>
    </Box>
  );
};

export default Register;