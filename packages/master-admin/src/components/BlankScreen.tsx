import { Box, Center, Text } from '@mantine/core';
import React from 'react';

const BlankScreen: React.FC = () => {
  return (
    <Box
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Center>
        <Text size="lg" c="gray.6" ta="center">
          Welcome to HMS
        </Text>
      </Center>
    </Box>
  );
};

export default BlankScreen;
