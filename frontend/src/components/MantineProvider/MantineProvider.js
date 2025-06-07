import React from 'react';
import { MantineProvider as Provider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import theme from '../../theme/mantineTheme';

export function MantineProvider({ children }) {
  return (
    <Provider theme={theme} defaultColorScheme="light">
      <Notifications />
      {children}
    </Provider>
  );
}

export default MantineProvider; 