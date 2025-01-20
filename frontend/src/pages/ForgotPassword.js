import React, { useState } from "react";
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
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      {message && <p className="error-message">{message}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleForgotPassword();
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
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Reset Request</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
