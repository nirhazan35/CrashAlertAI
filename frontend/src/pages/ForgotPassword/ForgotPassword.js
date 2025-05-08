import React, { useState } from "react";
import { Button, Title, Container, Box } from '@mantine/core';
import { IconUser, IconMail } from '@tabler/icons-react';
import "../authFormCSS/AuthForm.css";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/users/request-password-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      });

      if (response.ok) {
        setMessage("An email has been sent to your admin for further instructions.");
        setUsername("");
        setEmail("");
      } else {
        const errorData = await response.json();
        setMessage(`Failed to send request: ${errorData.message}`);
      }
    } catch (error) {
      setMessage("An error occurred while sending your request.");
      console.error("Error:", error);
    }
  };

  return (
    <Box className="auth-page">
      <Container size="xs">
        <div className="auth-container">
          <Title order={2} style={{ textAlign: 'center' }}>Reset Password</Title>
          <div className="auth-subtitle">
            Please enter your username and email to reset your password
          </div>
          
          {message && <div className="auth-message auth-message-error">{message}</div>}

          <form onSubmit={handleForgotPassword}>
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

            <Button
              type="submit"
              fullWidth
              size="md"
            >
              Submit
            </Button>
          </form>
        </div>
      </Container>
    </Box>
  );
};

export default ForgotPassword;