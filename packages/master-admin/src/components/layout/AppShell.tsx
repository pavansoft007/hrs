import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <MantineAppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'lg',
        collapsed: { mobile: !opened, desktop: false },
      }}
      footer={{ height: 60 }}
      padding="md"
      styles={{
        main: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          minHeight: 'calc(100vh - 130px)',
        },
      }}
    >
      <MantineAppShell.Header>
        <Navbar opened={opened} toggle={toggle} />
      </MantineAppShell.Header>

      <MantineAppShell.Navbar>
        <Sidebar onClose={close} />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>{children}</MantineAppShell.Main>

      <MantineAppShell.Footer>
        <Footer />
      </MantineAppShell.Footer>
    </MantineAppShell>
  );
}
