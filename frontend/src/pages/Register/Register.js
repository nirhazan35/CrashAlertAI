import React, { useState } from "react";
import { useAuth } from "../../authentication/AuthProvider";
import { Button, Title, Container, Box } from '@mantine/core';
import { IconUser, IconMail, IconLock } from '@tabler/icons-react';
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
    <Box className="auth-page" data-testid="register-page">
      <Container size="xs">
        <div className="auth-container">
          <Title order={2} style={{ textAlign: 'center' }}>Register New User</Title>
          <div className="auth-subtitle">
            Create a new user account with the following details
          </div>

          {message && (
            <div 
              className={`auth-message ${
                message.includes("successful") ? "auth-message-success" : "auth-message-error"
              }`}
              data-testid="register-message"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleRegister}>
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
                  data-testid="username-input"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Email</label>
              <div className="auth-input-wrapper">
                <IconMail size="1rem" className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                  data-testid="email-input"
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
                  data-testid="password-input"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Role</label>
              <div className="auth-input-wrapper">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="auth-input"
                  required
                  data-testid="role-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              size="md"
              data-testid="register-button"
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