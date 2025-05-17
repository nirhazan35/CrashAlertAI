import React from 'react';
import { render, screen } from '@testing-library/react';
import MantineProvider from '../../src/components/MantineProvider/MantineProvider';
import theme from '../../src/theme/mantineTheme';

// Mock @mantine/core
jest.mock('@mantine/core', () => {
  return {
    MantineProvider: ({ children, theme, defaultColorScheme }) => (
      <div data-testid="mantine-provider" data-theme={JSON.stringify(theme)} data-color-scheme={defaultColorScheme}>
        {children}
      </div>
    )
  };
});

// Mock the theme
jest.mock('../../src/theme/mantineTheme', () => {
  return {
    __esModule: true,
    default: {
      colors: {
        brand: ['#EBF5FF', '#D1E6FF', '#A9CDFF', '#81B4FF', '#5A9BFF', '#3380FF'],
      },
      primaryColor: 'brand',
    }
  };
});

describe('MantineProvider Component', () => {
  test('renders with the correct theme and default color scheme', () => {
    render(
      <MantineProvider>
        <div data-testid="child-component">Test Child</div>
      </MantineProvider>
    );
    
    // Check that the provider renders
    const provider = screen.getByTestId('mantine-provider');
    expect(provider).toBeInTheDocument();
    
    // Check that it has the right theme
    const themeData = JSON.parse(provider.getAttribute('data-theme'));
    expect(themeData.primaryColor).toBe('brand');
    expect(themeData.colors.brand).toEqual(theme.colors.brand);
    
    // Check that it has the right color scheme
    expect(provider.getAttribute('data-color-scheme')).toBe('light');
    
    // Check that it renders children
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByTestId('child-component').textContent).toBe('Test Child');
  });
  
  test('passes children through correctly', () => {
    render(
      <MantineProvider>
        <div>Multiple</div>
        <div>Children</div>
      </MantineProvider>
    );
    
    expect(screen.getByText('Multiple')).toBeInTheDocument();
    expect(screen.getByText('Children')).toBeInTheDocument();
  });
}); 