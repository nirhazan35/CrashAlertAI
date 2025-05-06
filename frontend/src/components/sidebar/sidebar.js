import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from "../../authentication/AuthProvider";
import { Group, UnstyledButton, Text, ThemeIcon, Stack, Divider } from '@mantine/core';
import { IconHome, IconChartLine, IconHistory, IconVideo, IconShield, IconList } from '@tabler/icons-react';
import './sidebar.css';

const navigationItems = [
  { icon: IconHome, label: 'Dashboard', to: '/' },
  { icon: IconChartLine, label: 'Statistics', to: '/statistics' },
  { icon: IconHistory, label: 'History', to: '/history' },
  { icon: IconVideo, label: 'Live Feed', to: '/live' },
];

const adminItems = [
  { icon: IconShield, label: 'Admin', to: '/admin' },
  { icon: IconList, label: 'Logs', to: '/logs' },
];

const NavItem = ({ icon: Icon, label, to }) => {
  return (
    <NavLink to={to} className="nav-link">
      {({ isActive }) => (
        <UnstyledButton
          className={`nav-button ${isActive ? 'active' : ''}`}
        >
          <Group>
            <ThemeIcon 
              size={30} 
              variant={isActive ? "filled" : "light"} 
              color={isActive ? "brand" : "gray"}
              className="nav-icon"
            >
              <Icon size={18} stroke={1.5} />
            </ThemeIcon>
            <Text fw={500}>{label}</Text>
          </Group>
        </UnstyledButton>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  // const location = useLocation();
  
  return (
    <Stack spacing="xs" className="sidebar-container">
      <Text fw={700} size="lg" mb="md" align="center" c="white" className="sidebar-title">
        Navigation
      </Text>
      
      <Stack spacing={4} className="nav-section">
        {navigationItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            to={item.to}
          />
        ))}
      </Stack>
      
      {user?.role === 'admin' && (
        <>
          <Divider my="sm" label="Admin" labelPosition="center" className="admin-divider" />
          <Stack spacing={4} className="nav-section">
            {adminItems.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                to={item.to}
              />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default Sidebar;
