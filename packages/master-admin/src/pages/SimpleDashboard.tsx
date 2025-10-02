import {
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Button,
  SimpleGrid,
  Paper,
  Loader,
  Center,
  Alert,
} from '@mantine/core';
import {
  Building2,
  Users,
  ChefHat,
  Settings,
  Eye,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import type { RootState } from '../store';
import {
  dashboardService,
  type DashboardStats,
} from '../services/dashboardService';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: StatCardProps) {
  return (
    <Paper
      shadow="sm"
      radius="lg"
      p="lg"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: '1px solid #e2e8f0',
        transition: 'transform 0.2s ease',
      }}
    >
      <Group justify="apart">
        <Stack gap="xs">
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Text size="xl" fw={700} c={color}>
            {value}
          </Text>
          {subtitle && (
            <Text size="xs" color="dimmed">
              {subtitle}
            </Text>
          )}
        </Stack>
        <Icon size={32} color={color} />
      </Group>
    </Paper>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard stats
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        setError('Failed to load dashboard data. Using default values.');
        // Set fallback data
        setStats({
          totalHotels: 0,
          totalRestaurants: 0,
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          totalRoles: 0,
          usersByType: {
            MASTER_ADMIN: 0,
            PROPERTY_ADMIN: 0,
            STAFF: 0,
          },
          propertiesByType: {
            HOTEL: 0,
            RESTAURANT: 0,
          },
          recentUsers: 0,
          recentProperties: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  const quickActions = [
    {
      title: 'Create Hotel',
      description: 'Add a new hotel property',
      icon: Building2,
      path: '/create-hotel',
      color: '#42a5f5',
    },
    {
      title: 'Create Restaurant',
      description: 'Add a new restaurant property',
      icon: ChefHat,
      path: '/create-restaurant',
      color: '#66bb6a',
    },
    {
      title: 'Manage Users',
      description: 'View and manage system users',
      icon: Users,
      path: '/users',
      color: '#ab47bc',
    },
    {
      title: 'View Hotels',
      description: 'Browse all hotel properties',
      icon: Building2,
      path: '/hotels',
      color: '#26c6da',
    },
    {
      title: 'View Restaurants',
      description: 'Browse all restaurant properties',
      icon: ChefHat,
      path: '/restaurants',
      color: '#ff7043',
    },
    {
      title: 'Roles & Permissions',
      description: 'Manage user roles and permissions',
      icon: Settings,
      path: '/roles-permissions',
      color: '#ef5350',
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <Center style={{ minHeight: '400px' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading dashboard data...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      {/* Welcome Header */}
      <Paper
        p="xl"
        radius="lg"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Group justify="between" align="center">
          <Stack gap="xs">
            <Title order={1}>Welcome back, {user?.full_name || 'Admin'}!</Title>
            <Text size="lg" opacity={0.9}>
              Master Admin Dashboard - Hotel & Restaurant Management System
            </Text>
            <Badge color="rgba(255,255,255,0.2)" variant="light" size="lg">
              {user?.user_type || 'MASTER_ADMIN'}
            </Badge>
          </Stack>
        </Group>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert icon={<AlertCircle size={16} />} color="orange" variant="light">
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <StatCard
          title="Total Properties"
          value={stats ? stats.totalHotels + stats.totalRestaurants : 0}
          icon={Building2}
          color="#667eea"
          subtitle="Hotels & Restaurants"
        />
        <StatCard
          title="System Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="#764ba2"
          subtitle={`${stats?.activeUsers || 0} active users`}
        />
        <StatCard
          title="Hotels"
          value={stats?.propertiesByType.HOTEL || 0}
          icon={Building2}
          color="#42a5f5"
          subtitle="Hotel properties"
        />
        <StatCard
          title="Restaurants"
          value={stats?.propertiesByType.RESTAURANT || 0}
          icon={ChefHat}
          color="#66bb6a"
          subtitle="Restaurant properties"
        />
      </SimpleGrid>

      {/* Quick Actions */}
      <Stack gap="md">
        <Title order={2} c="#2d1b69">
          Quick Actions
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {quickActions.map((action) => (
            <Card
              key={action.path}
              shadow="sm"
              radius="lg"
              p="lg"
              withBorder
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onClick={() => navigate(action.path)}
            >
              <Group gap="md">
                <Paper
                  p="sm"
                  radius="md"
                  style={{ backgroundColor: `${action.color}20` }}
                >
                  <action.icon size={24} color={action.color} />
                </Paper>
                <Stack gap="xs" flex={1}>
                  <Text fw={600} c="#2d1b69">
                    {action.title}
                  </Text>
                  <Text size="sm" color="dimmed">
                    {action.description}
                  </Text>
                </Stack>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      {/* Recent Activity */}
      <Card shadow="sm" radius="lg" p="xl" withBorder>
        <Stack gap="md">
          <Group justify="between" align="center">
            <Title order={3} c="#2d1b69">
              System Overview
            </Title>
            <Group gap="sm">
              <Button
                variant="light"
                leftSection={<RefreshCw size={16} />}
                onClick={() => window.location.reload()}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                variant="light"
                leftSection={<Settings size={16} />}
                onClick={() => navigate('/settings')}
              >
                Settings
              </Button>
            </Group>
          </Group>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Text fw={600} c="#2d1b69">
                    System Status
                  </Text>
                  <Group justify="between">
                    <Text size="sm">Database</Text>
                    <Badge color="green" variant="light">
                      Connected
                    </Badge>
                  </Group>
                  <Group justify="between">
                    <Text size="sm">API Server</Text>
                    <Badge color="green" variant="light">
                      Running
                    </Badge>
                  </Group>
                  <Group justify="between">
                    <Text size="sm">Authentication</Text>
                    <Badge color="green" variant="light">
                      Active
                    </Badge>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="lg" radius="md" withBorder>
                <Stack gap="sm">
                  <Text fw={600} c="#2d1b69">
                    Quick Statistics
                  </Text>
                  <Group justify="between">
                    <Text size="sm">Total Roles</Text>
                    <Text fw={600}>{stats?.totalRoles || 0}</Text>
                  </Group>
                  <Group justify="between">
                    <Text size="sm">Master Admins</Text>
                    <Text fw={600}>{stats?.usersByType.MASTER_ADMIN || 0}</Text>
                  </Group>
                  <Group justify="between">
                    <Text size="sm">Property Admins</Text>
                    <Text fw={600}>
                      {stats?.usersByType.PROPERTY_ADMIN || 0}
                    </Text>
                  </Group>
                  <Group justify="between">
                    <Text size="sm">Staff Members</Text>
                    <Text fw={600}>{stats?.usersByType.STAFF || 0}</Text>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>
    </Stack>
  );
}
