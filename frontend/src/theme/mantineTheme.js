import { createTheme } from '@mantine/core';

// Custom theme for CrashAlertAI
export const theme = createTheme({
  fontFamily: 'Inter, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },
  colors: {
    brand: [
      '#EBF5FF', // 0
      '#D1E6FF', // 1
      '#A9CDFF', // 2
      '#81B4FF', // 3
      '#5A9BFF', // 4
      '#3380FF', // 5 - Primary
      '#0E66FF', // 6
      '#0051EB', // 7
      '#0042BE', // 8
      '#003499', // 9
    ],
    // Alert colors
    danger: [
      '#FFEAEA',
      '#FFD5D5',
      '#FFA8A8',
      '#FF7A7A',
      '#FF5C5C',
      '#FF3131', // Primary alert
      '#F71919',
      '#D10E0E',
      '#AB0A0A',
      '#870707',
    ],
    success: [
      '#E7FAEB',
      '#C8F2D1',
      '#9AE6AE',
      '#6CD98A',
      '#44CA6D',
      '#2ABE56',
      '#1EA74B',
      '#158A3C',
      '#0D6C2E',
      '#074F22',
    ],
    warning: [
      '#FFF6E6',
      '#FFECCC',
      '#FFDB99',
      '#FFCA66',
      '#FFB833',
      '#FFA800',
      '#E69700',
      '#CC8600',
      '#A36B00',
      '#7A5000',
    ],
  },
  primaryColor: 'brand',
  
  // Other theme settings
  defaultRadius: 'sm',
  
  // Shadow presets
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05)',
    sm: '0 2px 5px rgba(0, 0, 0, 0.07)',
    md: '0 3px 8px rgba(0, 0, 0, 0.08)',
    lg: '0 5px 14px rgba(0, 0, 0, 0.09)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  
  other: {
    // Application specific values
    dashboardPadding: '1.5rem',
    sidebarWidth: '250px',
    headerHeight: '70px',
  },
  
  // Responsive breakpoints
  breakpoints: {
    xs: '576px',
    sm: '768px',
    md: '992px',
    lg: '1200px',
    xl: '1400px',
  }
});

export default theme; 