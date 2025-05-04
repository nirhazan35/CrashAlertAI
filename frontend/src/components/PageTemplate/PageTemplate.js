import React from 'react';
import { Title, Paper, Stack, useMantineTheme } from '@mantine/core';

/**
 * PageTemplate provides consistent styling for all pages
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {React.ReactNode} props.children - Page content
 * @param {Object} props.titleProps - Additional props for the Title component
 * @param {Object} props.paperProps - Additional props for the Paper component
 */
const PageTemplate = ({ 
  title, 
  children, 
  titleProps = {}, 
  paperProps = {} 
}) => {
  const theme = useMantineTheme();
  
  return (
    <Stack spacing="md">
      <Paper 
        shadow="sm" 
        p="md" 
        radius="md"
        {...paperProps}
      >
        {title && (
          <Title 
            order={3} 
            mb="md" 
            fw={600}
            {...titleProps}
          >
            {title}
          </Title>
        )}
        {children}
      </Paper>
    </Stack>
  );
};

export default PageTemplate; 