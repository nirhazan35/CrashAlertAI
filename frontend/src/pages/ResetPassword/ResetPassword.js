import React, { useState } from "react";
import { useAuth } from "../../authentication/AuthProvider";
import { useSearchParams } from "react-router-dom";
import { Button, Title, Container, Box, TextInput } from '@mantine/core';
import notifyPasswordChange from "./NotifyUser";
import '../authFormCSS/AuthForm.css';

const ResetPassword = () => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmNewPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (response.ok) {
        setMessage("Password reset successfully!");
        notifyPasswordChange(token, user, newPassword);
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        const errorData = await response.json();
        setMessage(`Failed to reset password: ${errorData.error}`);
      }
    } catch (error) {
      setMessage("An error occurred while resetting the password.");
      console.error("Error:", error);
    }
  };

  return (
    <Box className="auth-page">
      <Container size="xs">
        <div className="auth-container">
          <Title order={2} style={{ textAlign: 'center' }}>Reset Password</Title>
          <div className="auth-subtitle">
            Please enter and confirm your new password
          </div>

          {message && (
            <div className={`auth-message ${
              message.includes("successfully") ? "auth-message-success" : "auth-message-error"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleResetPassword}>
            <TextInput
              label="New Password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              size="md"
              type="password"
            />

            <TextInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              size="md"
              type="password"
            />

            <Button 
              type="submit" 
              fullWidth 
              size="md"
            >
              Reset Password
            </Button>
          </form>
        </div>
      </Container>
    </Box>
  );
};

export default ResetPassword;