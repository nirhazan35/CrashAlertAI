import React, { useState } from "react";
import "./ResetPassword.css";
import { useAuth } from "../../authentication/AuthProvider";
import { useSearchParams } from "react-router-dom";
import { PasswordInput, Button, Paper, Title, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import notifyPasswordChange from "./NotifyUser";

const ResetPassword = () => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const handleResetPassword = async () => {
    setMessage(""); // Clear previous messages

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
    <div className="reset-password-page">
      <Paper className="reset-password-paper" shadow="md">
        <Title order={2} className="reset-password-title">Reset Password</Title>
        {message && (
          <Alert 
            icon={<IconAlertCircle size="1rem" />}
            title="Notification"
            color={message.includes("successfully") ? "green" : "red"}
            className="reset-password-error"
          >
            {message}
          </Alert>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleResetPassword();
          }}
        >
          <PasswordInput
            label="New Password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="reset-password-input"
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            className="reset-password-input"
          />
          <Button type="submit" className="reset-password-button">
            Reset Password
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default ResetPassword;
