import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Burger,
  Flex,
  Group,
  Indicator,
  Menu,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import {
  Bell,
  Command,
  LogOut,
  Search,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import { HiChevronDown } from 'react-icons/hi2';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import type { AppDispatch, RootState } from '../../store';

interface NavbarProps {
  opened: boolean;
  toggle: () => void;
}

export function Navbar({ opened, toggle }: NavbarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box
      className="glass-card-advanced"
      style={{
        height: '100%',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        position: 'relative',
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        h="100%"
        px="lg"
        style={{ position: 'relative' }}
      >
        {/* Left Section */}
        <Group gap="lg">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="lg"
            size="sm"
            style={{
              color: 'var(--primary-500)',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              },
            }}
          />

          {/* Logo - Ultra Modern Design */}
          <Group gap="sm" visibleFrom="sm" className="hover-lift">
            <Box
              className="float-animation"
              style={{
                width: 44,
                height: 44,
                borderRadius: '16px',
                background: 'var(--gradient-mesh)',
                backgroundSize: '400% 400%',
                animation: 'gradient-shift 8s ease infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 900,
                fontSize: '20px',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.8)',
                }}
              />
              H
              <Sparkles
                size={12}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                }}
              />
            </Box>
            <Box>
              <Text
                fw={900}
                size="xl"
                className="gradient-text"
                style={{
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.5px',
                }}
              >
                HMS
              </Text>
              <Text
                size="xs"
                c="dimmed"
                lh={1}
                fw={600}
                style={{
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Management Suite
              </Text>
            </Box>
          </Group>

          {/* Advanced Search Bar */}
          <Box
            visibleFrom="md"
            className="modern-focus neomorphic-inset"
            style={{
              position: 'relative',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.6)',
              padding: '2px',
            }}
          >
            <TextInput
              placeholder="Search anything... ⌘K"
              leftSection={<Search size={18} style={{ color: '#9ca3af' }} />}
              rightSection={
                <Badge
                  size="xs"
                  variant="light"
                  color="gray"
                  style={{
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    color: 'var(--primary-700)',
                    border: 'none',
                  }}
                >
                  <Command size={10} />K
                </Badge>
              }
              size="sm"
              radius="xl"
              w={320}
              styles={{
                input: {
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontWeight: 500,
                  '&:focus': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    transform: 'scale(1.02)',
                  },
                  '&::placeholder': {
                    color: '#9ca3af',
                    fontWeight: 500,
                  },
                },
              }}
            />
          </Box>
        </Group>

        {/* Right Section - Modern Action Buttons */}
        <Group gap="xs">
          {/* AI Assistant Button */}
          <ActionIcon
            variant="subtle"
            size="xl"
            radius="xl"
            className="hover-lift modern-focus"
            style={{
              background: 'rgba(102, 126, 234, 0.05)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.1)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Sparkles size={20} style={{ color: 'var(--primary-600)' }} />
          </ActionIcon>

          {/* Notifications with Modern Indicator */}
          <Indicator
            inline
            size={8}
            offset={6}
            color="red"
            style={{
              indicator: {
                background: 'linear-gradient(45deg, #ff4757, #ff3838)',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)',
              },
            }}
          >
            <ActionIcon
              variant="subtle"
              size="xl"
              radius="xl"
              className="hover-lift modern-focus"
              style={{
                background: 'rgba(255, 71, 87, 0.05)',
                border: '1px solid rgba(255, 71, 87, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 71, 87, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Bell size={20} style={{ color: '#ff4757' }} />
            </ActionIcon>
          </Indicator>

          {/* Settings */}
          <ActionIcon
            variant="subtle"
            size="xl"
            radius="xl"
            className="hover-lift modern-focus"
            style={{
              background: 'rgba(156, 163, 175, 0.05)',
              border: '1px solid rgba(156, 163, 175, 0.1)',
              '&:hover': {
                background: 'rgba(156, 163, 175, 0.1)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Settings size={20} style={{ color: '#6b7280' }} />
          </ActionIcon>

          {/* Ultra-Modern User Menu */}
          <Menu
            shadow="xl"
            width={280}
            radius="xl"
            position="bottom-end"
            offset={8}
            styles={{
              dropdown: {
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--backdrop-blur)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              },
              item: {
                borderRadius: '12px',
                margin: '4px',
                fontWeight: 500,
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)',
                },
              },
            }}
          >
            <Menu.Target>
              <UnstyledButton
                className="hover-lift modern-focus ripple"
                style={{
                  padding: '8px 16px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s var(--spring)',
                }}
              >
                <Group gap="sm">
                  <Box style={{ position: 'relative' }}>
                    <Avatar
                      size={36}
                      radius="xl"
                      style={{
                        background: 'var(--gradient-mesh)',
                        backgroundSize: '400% 400%',
                        animation: 'gradient-shift 8s ease infinite',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      }}
                    >
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #10b981, #059669)',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </Box>
                  <Box visibleFrom="sm" style={{ minWidth: 0 }}>
                    <Text
                      fw={600}
                      size="sm"
                      c="#2d1b69"
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '120px',
                      }}
                    >
                      {user?.full_name || 'User'}
                    </Text>
                    <Text
                      size="xs"
                      c="dimmed"
                      lh={1}
                      fw={500}
                      style={{
                        textTransform: 'capitalize',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {user?.user_type?.toLowerCase().replace('_', ' ') ||
                        'User'}
                    </Text>
                  </Box>
                  <HiChevronDown
                    size={16}
                    style={{
                      color: '#9ca3af',
                      transition: 'transform 0.2s',
                    }}
                  />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Box p="sm">
                <Group gap="sm" mb="md">
                  <Avatar
                    size={48}
                    radius="xl"
                    style={{
                      background: 'var(--gradient-mesh)',
                      backgroundSize: '400% 400%',
                      animation: 'gradient-shift 8s ease infinite',
                    }}
                  >
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Text fw={600} size="sm" c="#2d1b69">
                      {user?.full_name || 'User'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {user?.email || 'user@example.com'}
                    </Text>
                  </Box>
                </Group>
              </Box>

              <Menu.Divider />

              <Menu.Item
                leftSection={<User size={16} />}
                style={{
                  borderRadius: '12px',
                  margin: '4px',
                  fontWeight: 500,
                }}
              >
                Profile & Settings
              </Menu.Item>

              <Menu.Item
                leftSection={<Settings size={16} />}
                style={{
                  borderRadius: '12px',
                  margin: '4px',
                  fontWeight: 500,
                }}
              >
                Account Preferences
              </Menu.Item>

              <Menu.Item
                leftSection={<Sparkles size={16} />}
                style={{
                  borderRadius: '12px',
                  margin: '4px',
                  fontWeight: 500,
                }}
              >
                AI Assistant
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                leftSection={<LogOut size={16} />}
                color="red"
                onClick={handleLogout}
                style={{
                  borderRadius: '12px',
                  margin: '4px',
                  fontWeight: 500,
                  background: 'rgba(239, 68, 68, 0.05)',
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                Sign Out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Ultra-Modern Gradient Bottom Border */}
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'var(--gradient-mesh)',
            backgroundSize: '400% 400%',
            animation: 'gradient-shift 8s ease infinite',
            borderRadius: '0 0 8px 8px',
          }}
        />

        {/* Floating Orbs for Visual Appeal */}
        <Box
          className="float-animation"
          style={{
            position: 'absolute',
            top: '10px',
            right: '20%',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            opacity: 0.6,
            animationDelay: '0s',
          }}
        />
        <Box
          className="float-animation"
          style={{
            position: 'absolute',
            top: '50px',
            right: '40%',
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            opacity: 0.4,
            animationDelay: '2s',
          }}
        />
      </Flex>
    </Box>
  );
}
