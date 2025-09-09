import { Box, Container, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { AppShell } from '../layout';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  maxWidth?: string | number;
}

export function DashboardLayout({
  children,
  title,
  maxWidth = 'xl',
}: DashboardLayoutProps) {
  return (
    <AppShell>
      <Container size={maxWidth} px="md">
        {title && (
          <Box mb="xl">
            <Title
              order={1}
              size="2rem"
              fw={700}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px',
              }}
            >
              {title}
            </Title>
            <Box
              style={{
                width: '60px',
                height: '4px',
                borderRadius: '2px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }}
            />
          </Box>
        )}
        {children}
      </Container>
    </AppShell>
  );
}
