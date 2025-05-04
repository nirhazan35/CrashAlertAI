import { MantineProvider as Provider, createTheme } from '@mantine/core';
import theme from '../../theme/mantineTheme';

export function MantineProvider({ children }) {
  return (
    <Provider theme={theme} defaultColorScheme="light">
      {children}
    </Provider>
  );
}

export default MantineProvider; 