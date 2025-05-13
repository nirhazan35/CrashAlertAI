import React, { useState, useEffect } from 'react';
import { useAuth } from '../../authentication/AuthProvider';
import { Button, Title, Container, Box, Alert } from '@mantine/core';
import { IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { fetchUsers } from '../AdminPage/AdminActions';
import '../authFormCSS/AuthForm.css';

const DeleteUser = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const usersData = await fetchUsers(user);
                setUsers(usersData);
            } catch (err) {
                setError("Failed to load users");
            }
        };
        loadData();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const confirmDeletion = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/users/${selectedUser}`, {
                method: "DELETE",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
            });

            if (response.ok) {
                setMessage("User deleted successfully");
                // Refresh users list
                const updatedUsers = await fetchUsers(user);
                setUsers(updatedUsers);
            } else {
                const errorData = await response.json();
                setMessage(`Deletion failed: ${errorData.message}`);
            }
        } catch (err) {
            setMessage("An error occurred during deletion");
        } finally {
            setIsLoading(false);
            setShowConfirmation(false);
            setSelectedUser("");
        }
    };

    return (
        <Box className="auth-page">
            <Container size="xs">
                <div className="auth-container">
                    <Title order={2} style={{ textAlign: 'center' }}>Delete User</Title>
                    <div className="auth-subtitle">
                        Select a user to permanently delete their account
                    </div>

                    {error && <div className="auth-message auth-message-error">{error}</div>}
                    {message && (
                        <div className={`auth-message ${
                            message.includes("successfully") ? "auth-message-success" : "auth-message-error"
                        }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="auth-input-group">
                            <label className="auth-input-label">Select User</label>
                            <div className="auth-input-wrapper">
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="auth-input"
                                    required
                                    disabled={isLoading}
                                >
                                    <option value="">Choose a user</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.username} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {showConfirmation && (
                            <Alert 
                                icon={<IconAlertCircle size="1rem" />}
                                title="Confirm Deletion"
                                color="red"
                                className="auth-message"
                            >
                                <p>Are you sure you want to permanently delete this user?</p>
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                    <Button
                                        color="red"
                                        onClick={confirmDeletion}
                                        loading={isLoading}
                                    >
                                        Confirm Delete
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowConfirmation(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Alert>
                        )}

                        <Button 
                            type="submit"
                            fullWidth 
                            loading={isLoading} 
                            size="md"
                            disabled={!selectedUser}
                            leftIcon={<IconTrash size="1rem" />}
                        >
                            {isLoading ? "Deleting..." : "Delete User"}
                        </Button>
                    </form>
                </div>
            </Container>
        </Box>
    );
};

export default DeleteUser;