import React from 'react';
import {
  Menu,
  ActionIcon,
  Divider,
  Text,
  useMantineTheme,
  Indicator,
} from '@mantine/core';
import { IconBell, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAccidentLogs } from '../../context/AccidentContext';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { setSelectedAlert, accidentLogs, notifications, setNotifications } = useAccidentLogs();
  const theme = useMantineTheme();

  const handleNotificationClick = (accidentId) => {
    const found = accidentLogs.find((a) => a._id === accidentId);
    if (found) setSelectedAlert(found);

    setNotifications((prev) =>
      prev.map((n) =>
        n.accidentId === accidentId ? { ...n, read: true } : n
      )
    );
    navigate('/dashboard');
  };

  const handleClear = () => setNotifications([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Menu shadow="md" width={300}>
      <Menu.Target>
        <Indicator
          inline
          label={unreadCount}
          size={16}
          color="red"
          disabled={unreadCount === 0}
        >
          <ActionIcon variant="subtle" size="lg">
            <IconBell size={22} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        {notifications.length === 0 ? (
          <Menu.Item disabled>No new notifications</Menu.Item>
        ) : (
          <>
            {notifications.map((n, i) => (
              <Menu.Item
                key={i}
                onClick={() => handleNotificationClick(n.accidentId)}
                sx={{
                  paddingTop: theme.spacing.xs,
                  paddingBottom: theme.spacing.xs,
                  backgroundColor: !n.read
                    ? theme.colors.brand[0]
                    : undefined,
                  fontWeight: !n.read
                    ? theme.headings.fontWeight
                    : undefined,
                }}
              >
                <Text size="sm">{n.msg}</Text>
              </Menu.Item>
            ))}
            <Divider my="xs" />
            <Menu.Item
              color="red"
              onClick={handleClear}
              leftSection={<IconTrash size={16} />}
              sx={{
                paddingTop: theme.spacing.xs,
                paddingBottom: theme.spacing.xs,
              }}
            >
              Clear all notifications
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default NotificationCenter;
