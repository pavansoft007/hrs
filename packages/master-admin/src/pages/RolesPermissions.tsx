import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Edit, Lock, Plus, Shield, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

interface Permission {
  id: number;
  code: string;
  description: string;
  category: string;
}

export function RolesPermissions() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Sample data
  const roles: Role[] = [
    {
      id: 1,
      name: 'Master Admin',
      description: 'Full system access and control',
      userCount: 5,
      permissions: [
        'create_hotel',
        'create_restaurant',
        'manage_users',
        'manage_roles',
        'view_analytics',
      ],
    },
    {
      id: 2,
      name: 'Property Admin',
      description: 'Manage specific property operations',
      userCount: 42,
      permissions: ['manage_bookings', 'manage_staff', 'view_reports'],
    },
    {
      id: 3,
      name: 'Hotel Manager',
      description: 'Hotel operations management',
      userCount: 24,
      permissions: ['manage_bookings', 'manage_rooms', 'view_reports'],
    },
    {
      id: 4,
      name: 'Restaurant Manager',
      description: 'Restaurant operations management',
      userCount: 18,
      permissions: ['manage_orders', 'manage_menu', 'manage_staff'],
    },
    {
      id: 5,
      name: 'Front Desk Staff',
      description: 'Guest check-in/out and service',
      userCount: 156,
      permissions: ['manage_checkin', 'view_bookings'],
    },
    {
      id: 6,
      name: 'Housekeeping',
      description: 'Room cleaning and maintenance',
      userCount: 89,
      permissions: ['update_room_status', 'view_assignments'],
    },
    {
      id: 7,
      name: 'Chef',
      description: 'Kitchen operations and menu management',
      userCount: 67,
      permissions: ['manage_menu', 'view_orders'],
    },
    {
      id: 8,
      name: 'Waiter',
      description: 'Customer service and order management',
      userCount: 124,
      permissions: ['take_orders', 'view_menu'],
    },
  ];

  const permissions: Permission[] = [
    {
      id: 1,
      code: 'create_hotel',
      description: 'Create new hotels',
      category: 'Property Management',
    },
    {
      id: 2,
      code: 'create_restaurant',
      description: 'Create new restaurants',
      category: 'Property Management',
    },
    {
      id: 3,
      code: 'manage_users',
      description: 'Create and manage users',
      category: 'User Management',
    },
    {
      id: 4,
      code: 'manage_roles',
      description: 'Create and assign roles',
      category: 'Access Control',
    },
    {
      id: 5,
      code: 'view_analytics',
      description: 'View system analytics',
      category: 'Reports',
    },
    {
      id: 6,
      code: 'manage_bookings',
      description: 'Handle reservations',
      category: 'Operations',
    },
    {
      id: 7,
      code: 'manage_staff',
      description: 'Staff scheduling and management',
      category: 'HR',
    },
    {
      id: 8,
      code: 'view_reports',
      description: 'Access business reports',
      category: 'Reports',
    },
    {
      id: 9,
      code: 'manage_rooms',
      description: 'Room inventory and status',
      category: 'Hotel Operations',
    },
    {
      id: 10,
      code: 'manage_orders',
      description: 'Process food orders',
      category: 'Restaurant Operations',
    },
    {
      id: 11,
      code: 'manage_menu',
      description: 'Update menu items and pricing',
      category: 'Restaurant Operations',
    },
    {
      id: 12,
      code: 'manage_checkin',
      description: 'Guest check-in/out process',
      category: 'Hotel Operations',
    },
  ];

  const handleCreateRole = () => {
    setEditingRole(null);
    open();
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    open();
  };

  const handleSaveRole = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(
        editingRole
          ? 'Role updated successfully!'
          : 'Role created successfully!',
      );
      close();
    } catch {
      alert('Failed to save role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionsByCategory = () => {
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
    return grouped;
  };

  const permissionsByCategory = getPermissionsByCategory();

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
            Roles & Permissions
          </Title>
          <Text c="dimmed" size="lg">
            Manage system roles and access control permissions
          </Text>
        </Stack>
        <Group gap="md">
          <Button
            leftSection={<Plus size={18} />}
            onClick={handleCreateRole}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            Create New Role
          </Button>
        </Group>
      </Group>

      <Alert
        color="blue"
        variant="light"
        mb="xl"
        styles={{
          root: {
            background: 'rgba(102, 126, 234, 0.05)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
          },
        }}
      >
        <Text size="sm">
          <strong>Important:</strong> Changes to roles and permissions will
          affect all users assigned to those roles. Be careful when modifying
          existing roles with active users.
        </Text>
      </Alert>

      <Grid gutter="lg">
        {/* Roles Table */}
        <Grid.Col span={12}>
          <Card
            shadow="sm"
            radius="xl"
            withBorder
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
            }}
          >
            <Group justify="space-between" mb="lg">
              <Group gap="sm">
                <Shield size={24} style={{ color: '#667eea' }} />
                <Title order={3}>System Roles</Title>
              </Group>
              <Badge variant="light" color="blue" size="lg">
                {roles.length} Total Roles
              </Badge>
            </Group>

            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Role Name</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Users</Table.Th>
                    <Table.Th>Permissions</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {roles.map((role) => (
                    <Table.Tr key={role.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Badge
                            variant={
                              role.name === 'Master Admin' ? 'filled' : 'light'
                            }
                            color={
                              role.name === 'Master Admin' ? 'red' : 'blue'
                            }
                            size="sm"
                          >
                            {role.name}
                          </Badge>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {role.description}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Users size={16} style={{ color: '#667eea' }} />
                          <Text fw={600}>{role.userCount}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="dot" color="green">
                          {role.permissions.length} permissions
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            color="blue"
                            leftSection={<Edit size={14} />}
                            onClick={() => handleEditRole(role)}
                          >
                            Edit
                          </Button>
                          {role.name !== 'Master Admin' && (
                            <Button
                              size="xs"
                              variant="light"
                              color="red"
                              leftSection={<Trash2 size={14} />}
                            >
                              Delete
                            </Button>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        </Grid.Col>

        {/* Permissions Overview */}
        <Grid.Col span={12}>
          <Card
            shadow="sm"
            radius="xl"
            withBorder
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
            }}
          >
            <Group justify="space-between" mb="lg">
              <Group gap="sm">
                <Lock size={24} style={{ color: '#667eea' }} />
                <Title order={3}>Available Permissions</Title>
              </Group>
              <Badge variant="light" color="green" size="lg">
                {permissions.length} Total Permissions
              </Badge>
            </Group>

            <Grid>
              {Object.entries(permissionsByCategory).map(
                ([category, perms]) => (
                  <Grid.Col key={category} span={{ base: 12, md: 6, lg: 4 }}>
                    <Stack gap="sm">
                      <Text fw={600} c="#667eea" size="sm" tt="uppercase">
                        {category}
                      </Text>
                      <Stack gap="xs">
                        {perms.map((permission) => (
                          <Box
                            key={permission.id}
                            p="xs"
                            style={{
                              background: 'rgba(102, 126, 234, 0.05)',
                              borderRadius: '8px',
                              border: '1px solid rgba(102, 126, 234, 0.1)',
                            }}
                          >
                            <Text size="sm" fw={500}>
                              {permission.code.replace(/_/g, ' ')}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {permission.description}
                            </Text>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  </Grid.Col>
                ),
              )}
            </Grid>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Role Creation/Edit Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group gap="sm">
            <Shield size={20} style={{ color: '#667eea' }} />
            <Text fw={600}>
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </Text>
          </Group>
        }
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Role Name"
            placeholder="e.g., Hotel Supervisor"
            required
            defaultValue={editingRole?.name || ''}
          />
          <TextInput
            label="Description"
            placeholder="Brief description of the role"
            required
            defaultValue={editingRole?.description || ''}
          />

          <Box>
            <Text fw={600} mb="sm">
              Assign Permissions
            </Text>
            <ScrollArea
              h={200}
              style={{
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              <Stack gap="xs">
                {permissions.map((permission) => (
                  <Group key={permission.id} justify="space-between">
                    <Box>
                      <Text size="sm" fw={500}>
                        {permission.code.replace(/_/g, ' ')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {permission.description}
                      </Text>
                    </Box>
                    <input
                      type="checkbox"
                      defaultChecked={editingRole?.permissions.includes(
                        permission.code,
                      )}
                    />
                  </Group>
                ))}
              </Stack>
            </ScrollArea>
          </Box>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={close} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

export default RolesPermissions;
