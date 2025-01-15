import React from 'react';
import { useAuth } from '../authentication';

const AdminPage = () => {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  }

  return (
    <div>
      <h2>Welcome, Admin!</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminPage;
