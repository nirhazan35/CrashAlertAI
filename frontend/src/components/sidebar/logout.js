import { useAuth } from "../../authentication/AuthProvider";
import { UnstyledButton, Group, Text, ThemeIcon } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

const Logout = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  return (
    <UnstyledButton
      onClick={handleLogout}
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colors.dark[0],
        '&:hover': {
          backgroundColor: theme.fn.rgba(theme.colors.red[8], 0.15),
        },
      })}
    >
      <Group>
        <ThemeIcon color="red" variant="light">
          <IconLogout size={18} stroke={1.5} />
        </ThemeIcon>
        <Text fw={500}>Logout</Text>
      </Group>
    </UnstyledButton>
  );
};

export default Logout;