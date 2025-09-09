import { ActionIcon, Box, Drawer, Group, Text } from '@mantine/core';
import { HiBars3 } from 'react-icons/hi2';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  opened: boolean;
  toggle: () => void;
  close: () => void;
}

export function MobileNav({ opened, toggle, close }: MobileNavProps) {
  return (
    <>
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="lg"
        color="gray"
        onClick={toggle}
        hiddenFrom="lg"
        style={{
          '&:hover': {
            backgroundColor: '#f3f4f6',
            color: '#667eea',
          },
        }}
      >
        <HiBars3 size={20} />
      </ActionIcon>

      <Drawer
        opened={opened}
        onClose={close}
        size="280px"
        position="left"
        styles={{
          content: {
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
          },
          header: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #e5e7eb',
          },
          close: {
            color: '#667eea',
            '&:hover': {
              backgroundColor: '#f3f4f6',
            },
          },
        }}
        title={
          <Group gap="xs">
            <Box
              style={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '12px',
              }}
            >
              H
            </Box>
            <Text
              fw={700}
              size="md"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              HMS
            </Text>
          </Group>
        }
        hiddenFrom="lg"
      >
        <Sidebar onClose={close} />
      </Drawer>
    </>
  );
}
