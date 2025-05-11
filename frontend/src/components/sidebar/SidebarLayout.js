import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  Text,
  ScrollArea,
  useMantineTheme,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Sidebar from './sidebar';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from "../../authentication/AuthProvider";
import NotificationCenter from '../notifications/notificationDropbox';
import { useAccidentLogs } from '../../context/AccidentContext';

const SidebarLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const theme = useMantineTheme();
  const { logout, user } = useAuth();
  const { setSelectedAlert } = useAccidentLogs();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  const handleNotificationClick = (alert) => {
    if (alert) {
      setSelectedAlert(alert);
      navigate('/dashboard');
    }
  };

  return (
    <AppShell
      header={{ height: theme.other.headerHeight }}
      navbar={{
        width: theme.other.sidebarWidth,
        breakpoint: 'sm',
        collapsed: { desktop: !opened, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} size="sm" />
            <Text size="lg" fw={700} c={theme.colors.brand[7]}>
              CrashAlert AI
            </Text>
            {user && (
                          <Text size="sm" c="dimmed">
                            {user.username} ({user.role})
                          </Text>
                        )}
          </Group>
          <Group>
            {user?.role === 'admin' && (
                <NotificationCenter onNotificationClick={handleNotificationClick} />
              )}
            <ActionIcon color="red" onClick={handleLogout} variant="subtle" size="lg">
              <IconLogout size={22} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea>
          <Sidebar />
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main pt={`calc(${theme.other.headerHeight} + var(--mantine-spacing-md))`}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default SidebarLayout;
