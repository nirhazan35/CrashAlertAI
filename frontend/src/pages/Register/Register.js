import React, { useState } from "react";
import { useAuth } from "../../authentication/AuthProvider";
import { TextInput, PasswordInput, Select, Button, Paper, Title, Alert, Text, Group } from '@mantine/core';
import { IconAlertCircle, IconUser, IconMail, IconLock, IconShield } from '@tabler/icons-react';
import "./Register.css";

const Register = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setMessage(""); // Clear any previous message
    setIsLoading(true);
    
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Paper className="register-paper" shadow="md">
        <Title order={2} className="register-title">Register New User</Title>
        <Text color="dimmed" size="sm" align="center" mb="xl">
          Create a new user account with the following details
        </Text>
        
        {message && (
          <Alert 
            icon={<IconAlertCircle size="1rem" />}
            title={message.includes("successful") ? "Success" : "Error"}
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
            icon={<IconUser size="1rem" />}
            size="md"
          />
          
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="register-input"
            icon={<IconMail size="1rem" />}
            size="md"
          />
          
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="register-input"
            icon={<IconLock size="1rem" />}
            size="md"
          />
          
          <Select
            label="Role"
            placeholder="Select user role"
            value={role}
            onChange={setRole}
            data={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
            className="register-input"
            icon={<IconShield size="1rem" />}
            size="md"
          />
          
          <Button 
            type="submit" 
            className="register-button"
            loading={isLoading}
            size="md"
          >
            {isLoading ? "Registering..." : "Register User"}
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Register;
