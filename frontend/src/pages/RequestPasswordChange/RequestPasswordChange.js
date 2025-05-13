import React, { useState } from "react";
import { Button, Title, Container, Box, Text } from '@mantine/core';
import { IconMail, IconUser } from '@tabler/icons-react';
import '../authFormCSS/AuthForm.css';
import { Link } from 'react-router-dom';

const RequestPasswordChange = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleRequestPasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");

    if (email === "" || username === "") {
      setMessage("Please enter your email and username.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/users/request-password-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username }),
      });

      if (response.ok) {
        setMessage("Password change request sent successfully!");
      } else {
        const errorData = await response.json();
        setMessage(`Failed to request password change: ${errorData.error}`);
      }
    } catch (error) {
      setMessage("An error occurred while requesting password change.");
      console.error("Error:", error);
    }
  };

  return (
    <Box className="auth-page">
      <Container size="xs">
        <div className="auth-container">
          <Title order={2} style={{ textAlign: 'center' }}>Request Password Change</Title>
          <div className="auth-subtitle">
            Please enter your email and username to request a password change
          </div>

          {message && (
            <div className={`auth-message ${
              message.includes("successfully") ? "auth-message-success" : "auth-message-error"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleRequestPasswordChange}>
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
                />
              </div>
            </div>

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

            <Button 
              type="submit" 
              fullWidth 
              size="md"
            >
              Request Password Change
            </Button>
          </form>

          <Text ta="center" mt="lg" size="sm" className="auth-link-text">
            Back to Login{" "}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </Text>
        </div>
      </Container>
    </Box>
  );
};

export default RequestPasswordChange;