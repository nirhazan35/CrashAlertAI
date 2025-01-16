import React, { useState } from "react";
import "./ResetPassword.css";
import { useAuth } from "../authentication/AuthProvider";

const ResetPassword = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    setMessage(""); // Clear previous messages
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({ username, newPassword }),
        credentials: "include",
      });

      if (response.ok) {
        setMessage("Password reset successfully!");
        setUsername("");
        setNewPassword("");
      } else {
        const errorData = await response.json();
        setMessage(`Failed to reset password: ${errorData.message}`);
      }
    } catch (error) {
      setMessage("An error occurred while resetting the password.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      {message && <p className="error-message">{message}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleResetPassword();
        }}
      >
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
