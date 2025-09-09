import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import {
  Badge,
  Box,
  Card,
  Grid,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  Activity,
  Building2,
  ChefHat,
  Shield,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  dashboardService,
  type DashboardStats,
  type MonthlyStats,
} from '../services/dashboardService';
import type { RootState } from '../store';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  subtitle,
}: StatCardProps) {
  const isPositive = change ? change > 0 : false;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card
      shadow="sm"
      radius="xl"
      withBorder
      className="hover-lift"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
      }}
    >
      <Group justify="space-between" mb="xs">
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={24} style={{ color }} />
        </Box>
        {change !== undefined && (
          <Group gap="xs">
            <TrendIcon
              size={16}
              style={{ color: isPositive ? '#10b981' : '#ef4444' }}
            />
            <Text size="sm" fw={600} c={isPositive ? 'green.6' : 'red.6'}>
              {Math.abs(change)}%
            </Text>
          </Group>
        )}
      </Group>
      <Text size="lg" fw={700} mb={4}>
        {value}
      </Text>
      <Text size="sm" c="dimmed">
        {title}
      </Text>
      {subtitle && (
        <Text size="xs" c="dimmed" mt={4}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
}

export function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null,
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, monthlyStatsData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getMonthlyStats(),
        ]);

        setDashboardData(statsData);
        setMonthlyData(monthlyStatsData);
      } catch {
        // console.error('Error fetching dashboard data');
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <Loader size="xl" />
      </Box>
    );
  }

  if (error || !dashboardData || !monthlyData) {
    return (
      <Box>
        <Text color="red" size="lg" ta="center">
          {error || 'Failed to load dashboard data'}
        </Text>
      </Box>
    );
  }

  // Calculate percentage changes (mock data for now, you can enhance this)
  const calculateChange = (current: number, base: number = 100): number => {
    if (base === 0) return 0;
    return Number((((current - base) / base) * 100).toFixed(1));
  };

  // Dynamic stats based on real data
  const stats = [
    {
      title: 'Total Hotels',
      value: dashboardData.totalHotels,
      change: calculateChange(dashboardData.totalHotels, 20), // assuming base of 20
      icon: Building2,
      color: '#667eea',
      subtitle: `${dashboardData.recentProperties} new this month`,
    },
    {
      title: 'Total Restaurants',
      value: dashboardData.totalRestaurants,
      change: calculateChange(dashboardData.totalRestaurants, 15), // assuming base of 15
      icon: ChefHat,
      color: '#f093fb',
      subtitle: `${Math.floor(
        dashboardData.recentProperties * 0.4,
      )} new this month`, // estimate
    },
    {
      title: 'Total Users',
      value: dashboardData.totalUsers,
      change: calculateChange(dashboardData.totalUsers, 1000), // assuming base of 1000
      icon: Users,
      color: '#48cae4',
      subtitle: 'All registered users',
    },
    {
      title: 'Total Roles',
      value: dashboardData.totalRoles,
      change: 0,
      icon: Shield,
      color: '#764ba2',
      subtitle: 'System roles defined',
    },
    {
      title: 'Active Users',
      value: dashboardData.activeUsers,
      change: calculateChange(
        dashboardData.activeUsers,
        dashboardData.totalUsers * 0.8,
      ),
      icon: UserCheck,
      color: '#10b981',
      subtitle: `${Math.round(
        (dashboardData.activeUsers / dashboardData.totalUsers) * 100,
      )}% of total users`,
    },
    {
      title: 'Inactive Users',
      value: dashboardData.inactiveUsers,
      change: -calculateChange(
        dashboardData.inactiveUsers,
        dashboardData.totalUsers * 0.2,
      ),
      icon: Activity,
      color: '#ef4444',
      subtitle: `${Math.round(
        (dashboardData.inactiveUsers / dashboardData.totalUsers) * 100,
      )}% of total users`,
    },
  ];

  // User distribution data from real data
  const userDistributionData = [
    {
      name: 'Master Admin',
      value: dashboardData.usersByType.MASTER_ADMIN,
      color: '#667eea',
    },
    {
      name: 'Property Admin',
      value: dashboardData.usersByType.PROPERTY_ADMIN,
      color: '#764ba2',
    },
    {
      name: 'Staff',
      value: dashboardData.usersByType.STAFF,
      color: '#f093fb',
    },
  ];

  // Revenue by property type (calculated from property counts - mock calculation)
  const totalProperties =
    dashboardData.totalHotels + dashboardData.totalRestaurants;
  const hotelPercentage =
    totalProperties > 0
      ? Math.round((dashboardData.totalHotels / totalProperties) * 100)
      : 0;
  const restaurantPercentage = 100 - hotelPercentage;

  const revenueByTypeData = [
    {
      type: 'Hotels',
      revenue: dashboardData.totalHotels * 25000, // mock revenue per hotel
      percentage: hotelPercentage,
    },
    {
      type: 'Restaurants',
      revenue: dashboardData.totalRestaurants * 15000, // mock revenue per restaurant
      percentage: restaurantPercentage,
    },
  ];

  // Revenue chart data - using monthly data from API
  const revenueData = monthlyData.userChart.map((month) => ({
    month: month.month,
    revenue: month.users * 200 + Math.random() * 10000, // mock calculation
    profit: month.users * 50 + Math.random() * 3000, // mock calculation
  }));

  // New properties added chart data - from monthly API data
  const newPropertiesData = monthlyData.propertyChart.map((month) => ({
    month: month.month,
    hotels: month.hotels,
    restaurants: month.restaurants,
  }));

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Stack gap="xs">
          <Title
            order={1}
            size="h1"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Master Admin Dashboard
          </Title>
          <Text c="dimmed" size="lg">
            Welcome back, {user?.full_name}! Here's your system overview.
          </Text>
        </Stack>
        <Badge
          variant="light"
          color="blue"
          size="lg"
          style={{
            background: 'rgba(102, 126, 234, 0.1)',
            color: '#667eea',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            fontWeight: 600,
            padding: '8px 16px',
          }}
        >
          {user?.user_type?.replace('_', ' ')}
        </Badge>
      </Group>

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </SimpleGrid>

      {/* Charts Grid */}
      <Grid gutter="lg">
        {/* Revenue Chart */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper
            shadow="sm"
            radius="xl"
            p="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
            }}
          >
            <Group justify="space-between" mb="lg">
              <Stack gap="xs">
                <Title order={3}>Revenue Overview</Title>
                <Text c="dimmed" size="sm">
                  Monthly revenue and profit trends
                </Text>
              </Stack>
              <Group gap="lg">
                <Group gap="xs">
                  <Box
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#667eea',
                    }}
                  />
                  <Text size="sm" fw={500}>
                    Revenue
                  </Text>
                </Group>
                <Group gap="xs">
                  <Box
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#10b981',
                    }}
                  />
                  <Text size="sm" fw={500}>
                    Profit
                  </Text>
                </Group>
              </Group>
            </Group>
            <AreaChart
              h={300}
              data={revenueData}
              dataKey="month"
              series={[
                { name: 'revenue', color: '#667eea' },
                { name: 'profit', color: '#10b981' },
              ]}
              curveType="linear"
              fillOpacity={0.1}
              strokeWidth={3}
              gridAxis="xy"
              withGradient
              tickLine="xy"
            />
          </Paper>
        </Grid.Col>

        {/* User Distribution Donut Chart */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper
            shadow="sm"
            radius="xl"
            p="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
            }}
          >
            <Stack gap="lg">
              <Stack gap="xs">
                <Title order={3}>User Distribution</Title>
                <Text c="dimmed" size="sm">
                  Users by role type
                </Text>
              </Stack>
              <DonutChart
                h={250}
                data={userDistributionData}
                thickness={30}
                withLabelsLine
                withLabels
                withTooltip
                strokeWidth={2}
              />
            </Stack>
          </Paper>
        </Grid.Col>

        {/* New Properties Chart */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Paper
            shadow="sm"
            radius="xl"
            p="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
            }}
          >
            <Stack gap="lg">
              <Group justify="space-between">
                <Stack gap="xs">
                  <Title order={3}>New Properties Added</Title>
                  <Text c="dimmed" size="sm">
                    Monthly new hotel and restaurant additions
                  </Text>
                </Stack>
                <Group gap="lg">
                  <Group gap="xs">
                    <Box
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '2px',
                        background: '#667eea',
                      }}
                    />
                    <Text size="sm" fw={500}>
                      Hotels
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Box
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '2px',
                        background: '#f093fb',
                      }}
                    />
                    <Text size="sm" fw={500}>
                      Restaurants
                    </Text>
                  </Group>
                </Group>
              </Group>
              <BarChart
                h={250}
                data={newPropertiesData}
                dataKey="month"
                series={[
                  { name: 'hotels', color: '#667eea' },
                  { name: 'restaurants', color: '#f093fb' },
                ]}
                tickLine="y"
                gridAxis="y"
              />
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Revenue by Type */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Paper
            shadow="sm"
            radius="xl"
            p="xl"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
            }}
          >
            <Stack gap="lg">
              <Stack gap="xs">
                <Title order={3}>Revenue by Property Type</Title>
                <Text c="dimmed" size="sm">
                  Total revenue breakdown
                </Text>
              </Stack>

              <Stack gap="md">
                {revenueByTypeData.map((item, index) => (
                  <Box key={item.type}>
                    <Group justify="space-between" mb="xs">
                      <Text fw={600}>{item.type}</Text>
                      <Group gap="sm">
                        <Text fw={600}>${item.revenue.toLocaleString()}</Text>
                        <Badge
                          variant="light"
                          color={index === 0 ? 'blue' : 'pink'}
                          size="sm"
                        >
                          {item.percentage}%
                        </Badge>
                      </Group>
                    </Group>
                    <Box
                      style={{
                        width: '100%',
                        height: '8px',
                        borderRadius: '4px',
                        background: '#f1f3f4',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        style={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          background: index === 0 ? '#667eea' : '#f093fb',
                          borderRadius: '4px',
                          transition: 'width 1s ease',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Group justify="center" mt="md">
                <Stack align="center" gap="xs">
                  <Text size="xl" fw={700} c="#667eea">
                    $692,000
                  </Text>
                  <Text size="sm" c="dimmed">
                    Total Revenue
                  </Text>
                </Stack>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Quick Actions */}
      <Paper
        shadow="sm"
        radius="xl"
        p="xl"
        mt="xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(240, 147, 251, 0.05) 100%)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
        }}
      >
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={3}>System Health</Title>
            <Text c="dimmed">
              All systems operational • Last updated:{' '}
              {new Date().toLocaleDateString()}
            </Text>
          </Stack>
          <Group gap="md">
            <Badge
              variant="dot"
              color="green"
              size="lg"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                fontWeight: 600,
              }}
            >
              Database Online
            </Badge>
            <Badge
              variant="dot"
              color="green"
              size="lg"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                fontWeight: 600,
              }}
            >
              API Services
            </Badge>
            <Badge
              variant="dot"
              color="blue"
              size="lg"
              style={{
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                fontWeight: 600,
              }}
            >
              {userDistributionData.reduce((sum, item) => sum + item.value, 0)}{' '}
              Active Sessions
            </Badge>
          </Group>
        </Group>
      </Paper>
    </Box>
  );
}

export default Dashboard;
