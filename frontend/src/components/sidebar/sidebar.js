import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from "../../authentication/AuthProvider";
import { Group, UnstyledButton, Text, ThemeIcon, Stack, Divider, rgba } from '@mantine/core';
import { IconHome, IconChartLine, IconHistory, IconVideo, IconShield, IconList } from '@tabler/icons-react';

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

const NavItem = ({ icon: Icon, label, to, active }) => {
  return (
    <NavLink to={to} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <UnstyledButton
          sx={(theme) => ({
            display: 'block',
            width: '100%',
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            color: theme.colors.dark[0],
            backgroundColor: isActive ? rgba(theme.colors.brand[8], 0.25) : 'transparent',
            '&:hover': {
              backgroundColor: rgba(theme.colors.brand[8], 0.15),
              color: theme.white,
              transform: 'translateX(4px)',
              transition: 'transform 0.2s, background-color 0.2s',
            },
          })}
        >
          <Group>
            <ThemeIcon 
              size={30} 
              variant={isActive ? "filled" : "light"} 
              color={isActive ? "brand" : "gray"}
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
  const location = useLocation();
  
  return (
    <Stack spacing="xs">
      <Text fw={700} size="lg" mb="md" align="center" c="white">
        Navigation
      </Text>
      
      <Stack spacing={4}>
        {navigationItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            to={item.to}
            active={location.pathname === item.to}
          />
        ))}
      </Stack>
      
      {user?.role === 'admin' && (
        <>
          <Divider my="sm" label="Admin" labelPosition="center" />
          <Stack spacing={4}>
            {adminItems.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={location.pathname === item.to}
              />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default Sidebar;
