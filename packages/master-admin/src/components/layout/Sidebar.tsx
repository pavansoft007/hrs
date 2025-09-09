import {
  Box,
  Group,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
  rem,
} from '@mantine/core';
import {
  BarChart3,
  ChefHat,
  Home,
  Hotel,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  onClose: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  description?: string;
  badge?: string;
  isNew?: boolean;
}

const mainNavItems: NavItem[] = [
  {
    icon: Home,
    label: 'Dashboard',
    path: '/dashboard',
    description: 'Overview & Analytics',
  },
  // {
  //   icon: Building2,
  //   label: 'Properties',
  //   path: '/properties',
  //   description: 'All Properties',
  //   badge: '42',
  // },
  {
    icon: Hotel,
    label: 'Hotels',
    path: '/hotels',
    description: 'Hotel Management',
    badge: '24',
  },
  {
    icon: ChefHat,
    label: 'Restaurants',
    path: '/restaurants',
    description: 'Restaurant Management',
    badge: '18',
  },
  // {
  //   icon: Calendar,
  //   label: 'Bookings',
  //   path: '/bookings',
  //   description: 'Reservations',
  //   badge: '48',
  // },
  {
    icon: Users,
    label: 'Users',
    path: '/users',
    description: 'User Management',
    badge: '1247',
  },
];

// Master Admin specific navigation items
// const masterAdminItems: NavItem[] = [
//   {
//     icon: Hotel,
//     label: 'Create Hotel',
//     path: '/create-hotel',
//     description: 'Add New Hotel',
//     isNew: true,
//   },
//   {
//     icon: ChefHat,
//     label: 'Create Restaurant',
//     path: '/create-restaurant',
//     description: 'Add New Restaurant',
//     isNew: true,
//   },
//   {
//     icon: UserPlus,
//     label: 'Create User',
//     path: '/create-user',
//     description: 'Add Team Members',
//   },
//   {
//     icon: Shield,
//     label: 'Roles & Permissions',
//     path: '/roles-permissions',
//     description: 'Access Control',
//     badge: '12',
//   },
// ];

const analyticsNavItems: NavItem[] = [
  {
    icon: BarChart3,
    label: 'Analytics',
    path: '/analytics',
    description: 'Data Insights',
    isNew: true,
  },
  {
    icon: TrendingUp,
    label: 'Reports',
    path: '/reports',
    description: 'Business Reports',
  },
];

const systemNavItems: NavItem[] = [
  // {
  //   icon: UserCheck,
  //   label: 'Staff Management',
  //   path: '/staff',
  //   description: 'Team Overview',
  // },
  {
    icon: Zap,
    label: 'AI Assistant',
    path: '/ai-assistant',
    description: 'Smart Helper',
    isNew: true,
  },
  {
    icon: Settings,
    label: 'Settings',
    path: '/settings',
    description: 'System Config',
  },
];

export function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // const { user } = useSelector((state: RootState) => state.auth);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  // const isMasterAdmin = user?.user_type === 'MASTER_ADMIN';

  const renderNavSection = (title: string, items: NavItem[]) => (
    <Box key={title}>
      <Text
        size="xs"
        tt="uppercase"
        fw={700}
        c="dimmed"
        px="md"
        mb="sm"
        style={{
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </Text>
      <Stack gap={4}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <UnstyledButton
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              px="md"
              py="sm"
              style={{
                borderRadius: '12px',
                margin: '0 8px',
                transition: 'all 0.2s ease',
                background: isActive
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'transparent',
                color: isActive ? 'white' : '#374151',
                '&:hover': {
                  backgroundColor: isActive
                    ? undefined
                    : 'rgba(102, 126, 234, 0.08)',
                  transform: 'translateX(2px)',
                },
              }}
            >
              <Group gap="sm" wrap="nowrap">
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: rem(20),
                    height: rem(20),
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      color: isActive ? 'white' : '#667eea',
                    }}
                  />
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={600} size="sm" style={{ color: 'inherit' }}>
                    {item.label}
                  </Text>
                  {item.description && (
                    <Text
                      size="xs"
                      style={{
                        color: isActive
                          ? 'rgba(255, 255, 255, 0.8)'
                          : '#9ca3af',
                        lineHeight: 1.2,
                      }}
                    >
                      {item.description}
                    </Text>
                  )}
                </Box>
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>
    </Box>
  );

  return (
    <Box
      style={{
        height: '100%',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid #e5e7eb',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        p="md"
        style={{
          borderBottom: '1px solid #f3f4f6',
          background: 'rgba(255, 255, 255, 0.5)',
          flexShrink: 0,
        }}
      >
        <Group gap="xs">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '14px',
            }}
          >
            H
          </Box>
          <Box>
            <Text
              fw={800}
              size="sm"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Hotel MS
            </Text>
            <Text size="xs" c="dimmed" lh={1}>
              Management
            </Text>
          </Box>
        </Group>
      </Box>

      {/* Navigation */}
      <ScrollArea
        style={{
          flex: 1,
          minHeight: 0, // Important for flex child with overflow
        }}
        scrollbarSize={4}
        scrollHideDelay={500}
      >
        <Stack gap="xl" p="sm" pt="lg">
          {renderNavSection('Main', mainNavItems)}
          {/* {isMasterAdmin && renderNavSection('Master Admin', masterAdminItems)} */}
          {renderNavSection('Analytics', analyticsNavItems)}
          {renderNavSection('System', systemNavItems)}
        </Stack>
      </ScrollArea>

      {/* Gradient accent */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          height: '100%',
          background:
            'linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}
      />
    </Box>
  );
}
