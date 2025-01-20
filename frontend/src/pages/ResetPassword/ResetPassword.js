import React, { useState } from "react";
import "./ResetPassword.css";
import { useAuth } from "../../authentication/AuthProvider";
import { useSearchParams } from "react-router-dom";
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
      {message && <p className={`message ${message.includes("successfully") ? "success-message" : "error-message"}`}>{message}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleResetPassword();
        }}
      >
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
        <div>
          <label htmlFor="confirmNewPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
