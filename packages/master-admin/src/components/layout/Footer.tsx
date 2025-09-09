import { ActionIcon, Badge, Box, Flex, Group, Text } from '@mantine/core';
import { Github, Heart, Sparkles, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      className="glass-card-advanced"
      style={{
        height: '100%',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(102, 126, 234, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        h="100%"
        px="lg"
        wrap="wrap"
        gap="md"
      >
        {/* Left Section - Copyright with Modern Touch */}
        <Group gap="sm">
          <Text size="sm" c="#6b7280" fw={500}>
            © {currentYear} HMS - Hotel Management System.
          </Text>
          <Group gap="xs">
            <Text size="sm" c="#9ca3af">
              Made with
            </Text>
            <Heart
              size={14}
              style={{
                color: '#ef4444',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
              fill="currentColor"
            />
            <Text size="sm" c="#9ca3af">
              by our team
            </Text>
          </Group>
        </Group>

        {/* Center Section - Status Badge */}
        <Group gap="md" visibleFrom="sm">
          <Badge
            variant="light"
            color="green"
            size="md"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#059669',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              fontWeight: 600,
              padding: '8px 12px',
            }}
            leftSection={
              <Box
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                }}
              />
            }
          >
            System Online
          </Badge>

          <Text size="xs" c="dimmed">
            v2.1.0
          </Text>
        </Group>

        {/* Right Section - Modern Links & Social */}
        <Group gap="lg" visibleFrom="sm">
          {/* Navigation Links */}
          <Group gap="md">
            {['Privacy Policy', 'Terms of Service', 'Support', 'API Docs'].map(
              (link) => (
                <Text
                  key={link}
                  size="sm"
                  c="#667eea"
                  fw={500}
                  className="hover-lift modern-focus"
                  style={{
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s var(--smooth)',
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.1)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {link}
                </Text>
              ),
            )}
          </Group>

          {/* Social Icons */}
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              size="sm"
              radius="xl"
              className="hover-lift modern-focus"
              style={{
                background: 'rgba(102, 126, 234, 0.05)',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Github size={14} style={{ color: '#667eea' }} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="sm"
              radius="xl"
              className="hover-lift modern-focus"
              style={{
                background: 'rgba(29, 161, 242, 0.05)',
                '&:hover': {
                  background: 'rgba(29, 161, 242, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Twitter size={14} style={{ color: '#1da1f2' }} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Mobile Compact Version */}
        <Group hiddenFrom="sm" w="100%" justify="space-between">
          <Group gap="sm">
            {['Privacy', 'Terms', 'Support'].map((link) => (
              <Text
                key={link}
                size="xs"
                c="#667eea"
                fw={600}
                className="modern-focus"
                style={{
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  transition: 'all 0.2s var(--smooth)',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              >
                {link}
              </Text>
            ))}
          </Group>

          <Badge
            variant="dot"
            color="green"
            size="xs"
            style={{
              background: 'transparent',
              color: '#059669',
              fontWeight: 600,
            }}
          >
            Online
          </Badge>
        </Group>
      </Flex>

      {/* Ultra-Modern Top Gradient Border */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--gradient-mesh)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 8s ease infinite',
        }}
      />

      {/* Floating Sparkles for Visual Appeal */}
      <Sparkles
        size={8}
        className="float-animation"
        style={{
          position: 'absolute',
          top: '15px',
          left: '20%',
          color: 'var(--primary-400)',
          opacity: 0.4,
          animationDelay: '0s',
        }}
      />
      <Sparkles
        size={6}
        className="float-animation"
        style={{
          position: 'absolute',
          top: '25px',
          right: '30%',
          color: 'var(--primary-500)',
          opacity: 0.3,
          animationDelay: '2s',
        }}
      />
      <Sparkles
        size={7}
        className="float-animation"
        style={{
          position: 'absolute',
          bottom: '15px',
          right: '15%',
          color: 'var(--primary-600)',
          opacity: 0.5,
          animationDelay: '4s',
        }}
      />
    </Box>
  );
}
