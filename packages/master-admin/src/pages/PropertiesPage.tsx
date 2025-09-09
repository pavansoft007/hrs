import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type React from 'react';
import { HiEye, HiPencilSquare, HiPlus } from 'react-icons/hi2';
import { DashboardLayout } from '../components/layout';

const PropertiesPage: React.FC = () => {
  const properties = [
    {
      id: 1,
      name: 'Grand Hotel Plaza',
      location: 'New York, NY',
      rooms: 150,
      occupancy: 85,
      status: 'Active',
      revenue: '$12,450',
    },
    {
      id: 2,
      name: 'Seaside Resort',
      location: 'Miami, FL',
      rooms: 200,
      occupancy: 92,
      status: 'Active',
      revenue: '$18,200',
    },
    {
      id: 3,
      name: 'Mountain View Lodge',
      location: 'Denver, CO',
      rooms: 75,
      occupancy: 68,
      status: 'Maintenance',
      revenue: '$8,900',
    },
  ];

  return (
    <DashboardLayout title="Properties Management">
      <Stack gap="xl">
        {/* Action Bar */}
        <Group justify="space-between">
          <Text size="md" c="dimmed">
            Manage your hotel properties and track their performance
          </Text>
          <Button
            leftSection={<HiPlus size={16} />}
            radius="lg"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            Add Property
          </Button>
        </Group>

        {/* Properties Grid */}
        <Grid gutter="lg">
          {properties.map((property) => (
            <Grid.Col key={property.id} span={{ base: 12, md: 6, lg: 4 }}>
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
                <Stack gap="md">
                  {/* Header */}
                  <Group justify="space-between">
                    <Title order={4} size="lg" fw={600} c="#2d1b69">
                      {property.name}
                    </Title>
                    <Badge
                      color={property.status === 'Active' ? 'green' : 'orange'}
                      variant="light"
                      radius="lg"
                    >
                      {property.status}
                    </Badge>
                  </Group>

                  {/* Content */}
                  <Stack gap="sm">
                    <Text size="sm" c="dimmed">
                      📍 {property.location}
                    </Text>
                    <Group justify="space-between">
                      <Text size="sm">
                        <strong>{property.rooms}</strong> Rooms
                      </Text>
                      <Text size="sm">
                        <strong>{property.occupancy}%</strong> Occupied
                      </Text>
                    </Group>
                    <Text size="lg" fw={700} c="#667eea">
                      {property.revenue}
                      <Text component="span" size="sm" c="dimmed" fw={400}>
                        {' '}
                        / month
                      </Text>
                    </Text>
                  </Stack>

                  {/* Actions */}
                  <Group gap="xs" mt="md">
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<HiEye size={14} />}
                      color="blue"
                      radius="lg"
                      style={{ flex: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<HiPencilSquare size={14} />}
                      color="gray"
                      radius="lg"
                      style={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </DashboardLayout>
  );
};

export default PropertiesPage;
