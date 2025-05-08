import React, { useState } from "react";
import { 
  TextInput, 
  Button, 
  Title, 
  Container, 
  Box
} from '@mantine/core';
import { IconUser, IconMail } from '@tabler/icons-react';
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async () => {
    setMessage(""); // Clear previous messages
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/users/request-password-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      });
      console.log("response", response);

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
    <Box className="forgot-password-page">
      <Container size="xs">
        <div className="forgot-password-container">
          <Title order={2} style={{ textAlign: 'center' }}>Reset Password</Title>
          <div className="forgot-password-subtitle">
            Please enter your username and email to reset your password
          </div>
          {message && <p className="error-message">{message}</p>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleForgotPassword();
            }}
          >
            <div>
              <TextInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                icon={<IconUser size="1rem" />}
                size="md"
              />
            </div>
            <div>
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
