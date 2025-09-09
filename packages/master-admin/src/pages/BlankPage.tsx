import { Box, Card, Grid, Group, Paper, Text, Title } from '@mantine/core';
import type React from 'react';
import {
  HiBuildingOffice2,
  HiChartBarSquare,
  HiCurrencyDollar,
  HiUsers,
} from 'react-icons/hi2';
import { DashboardLayout } from '../components/layout';

const BlankPage: React.FC = () => {
  const stats = [
    {
      title: 'Total Properties',
      value: '12',
      icon: HiBuildingOffice2,
      color: '#667eea',
    },
    {
      title: 'Active Guests',
      value: '148',
      icon: HiUsers,
      color: '#764ba2',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      icon: HiCurrencyDollar,
      color: '#f093fb',
    },
    {
      title: 'Occupancy Rate',
      value: '87%',
      icon: HiChartBarSquare,
      color: '#667eea',
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <Grid gutter="lg">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid.Col key={index} span={{ base: 12, xs: 6, sm: 3 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="xl"
                style={{
                  border: '1px solid #f3f4f6',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Group justify="space-between" mb="md">
                  <Box>
                    <Text size="sm" color="dimmed" fw={500}>
                      {stat.title}
                    </Text>
                    <Text size="xl" fw={700} c="#2d1b69">
                      {stat.value}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={24} style={{ color: stat.color }} />
                  </Box>
                </Group>
              </Card>
            </Grid.Col>
          );
        })}

        <Grid.Col span={12}>
          <Paper
            shadow="sm"
            p="xl"
            radius="xl"
            style={{
              border: '1px solid #f3f4f6',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box ta="center" py="xl">
              <Title order={2} size="1.5rem" fw={600} c="#374151" mb="md">
                Welcome to Your Hotel Management System
              </Title>
              <Text size="md" c="dimmed" maw={600} mx="auto" mb="xl">
                This is your dashboard where you can manage all aspects of your
                hotel operations. Navigate through the sidebar to access
                different features and modules.
              </Text>
              <Box
                style={{
                  height: 200,
                  background:
                    'linear-gradient(135deg, #667eea10, #764ba210, #f093fb10)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #e5e7eb',
                }}
              >
                <Text size="lg" c="dimmed" fw={500}>
                  Dashboard content will be displayed here
                </Text>
              </Box>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </DashboardLayout>
  );
};

export default BlankPage;
