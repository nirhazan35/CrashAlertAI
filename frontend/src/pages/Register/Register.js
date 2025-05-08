import React, { useState } from "react";
import { useAuth } from "../../authentication/AuthProvider";
import { TextInput, PasswordInput, Select, Button, Paper, Title, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import "./Register.css";

const Register = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    setMessage(""); // Clear any previous message
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
        setRole("user"); // Reset role to default
      } else {
        const errorData = await response.json();
        setMessage(`Registration failed: ${errorData.message}`);
      }
    } catch (error) {
      setMessage("An error occurred while registering. Please try again later.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="register-page">
      <Paper className="register-paper" shadow="md">
        <Title order={2} className="register-title">Register</Title>
        {message && (
          <Alert 
            icon={<IconAlertCircle size="1rem" />}
            title="Notification"
            color={message.includes("successful") ? "green" : "red"}
            className="register-error"
          >
            {message}
          </Alert>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          <TextInput
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="register-input"
          />
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="register-input"
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="register-input"
          />
          <Select
            label="Role"
            placeholder="Select your role"
            value={role}
            onChange={setRole}
            data={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
            className="register-input"
          />
          <Button type="submit" className="register-button">
            Register
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Register;
