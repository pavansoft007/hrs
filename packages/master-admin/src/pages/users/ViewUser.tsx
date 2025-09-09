import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Edit,
  Mail,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService, type User as UserType } from '../../services/userService';

export function ViewUser() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userData = await userService.getUserById(parseInt(id));
        setUser(userData);
      } catch {
        const errorMessage = 'Failed to load user details';
        setError(errorMessage);
        notifications.show({
          title: 'Error',
          message: errorMessage,
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !user) {
    return (
      <Box p="xl">
        <Alert
          icon={<AlertCircle size="1rem" />}
          title="Error"
          color="red"
          mb="md"
        >
          {error || 'User not found'}
        </Alert>
        <Button
          leftSection={<ArrowLeft size={16} />}
          variant="outline"
          onClick={() => navigate('/users')}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'MASTER_ADMIN':
        return 'red';
      case 'PROPERTY_ADMIN':
        return 'blue';
      case 'STAFF':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Box p="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Group>
          <User size={32} style={{ color: '#8b5cf6' }} />
          <Title
            order={1}
            size="h1"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            User Details
          </Title>
        </Group>
        <Group>
          <Button
            leftSection={<Edit size={16} />}
            onClick={() => navigate(`/users/edit/${id}`)}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            }}
          >
            Edit User
          </Button>
          <Button
            leftSection={<ArrowLeft size={16} />}
            variant="outline"
            onClick={() => navigate('/users')}
          >
            Back to Users
          </Button>
        </Group>
      </Group>

      {/* User Details Card */}
      <Card shadow="sm" radius="xl" withBorder p="xl">
        <Stack gap="xl">
          {/* Basic Information */}
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Text size="xl" fw={700}>
                {user.full_name}
              </Text>
              <Badge
                size="lg"
                variant="light"
                color={getUserTypeColor(user.user_type)}
                leftSection={<Shield size={14} />}
              >
                {user.user_type.replace('_', ' ')}
              </Badge>
              <Badge
                size="sm"
                variant={user.is_active ? 'light' : 'outline'}
                color={user.is_active ? 'green' : 'red'}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </Stack>
          </Group>

          {/* Contact Information */}
          <Stack gap="md">
            <Text size="lg" fw={600} c="dimmed">
              Contact Information
            </Text>

            {user.email && (
              <Group gap="sm">
                <Mail size={18} style={{ color: '#6b7280' }} />
                <Text>{user.email}</Text>
              </Group>
            )}

            {user.phone && (
              <Group gap="sm">
                <Phone size={18} style={{ color: '#6b7280' }} />
                <Text>{user.phone}</Text>
              </Group>
            )}

            {!user.email && !user.phone && (
              <Text c="dimmed" fs="italic">
                No contact information available
              </Text>
            )}
          </Stack>

          {/* Account Information */}
          <Stack gap="md">
            <Text size="lg" fw={600} c="dimmed">
              Account Information
            </Text>

            <Group gap="sm">
              <Calendar size={18} style={{ color: '#6b7280' }} />
              <Text>
                Created: {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </Group>

            <Group gap="sm">
              <Calendar size={18} style={{ color: '#6b7280' }} />
              <Text>
                Last Updated: {new Date(user.updated_at).toLocaleDateString()}
              </Text>
            </Group>

            {user.last_login && (
              <Group gap="sm">
                <Calendar size={18} style={{ color: '#6b7280' }} />
                <Text>
                  Last Login: {new Date(user.last_login).toLocaleDateString()}
                </Text>
              </Group>
            )}
          </Stack>

          {/* Property Information */}
          {user.property && (
            <Stack gap="md">
              <Text size="lg" fw={600} c="dimmed">
                Assigned Property
              </Text>
              <Card withBorder p="md">
                <Group justify="space-between">
                  <Stack gap="xs">
                    <Text fw={600}>{user.property.name}</Text>
                    <Text size="sm" c="dimmed">
                      Code: {user.property.code}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            </Stack>
          )}

          {/* Roles */}
          {user.roles && user.roles.length > 0 && (
            <Stack gap="md">
              <Text size="lg" fw={600} c="dimmed">
                Roles
              </Text>
              <Group gap="sm">
                {user.roles.map((role) => (
                  <Badge key={role.id} variant="outline" size="lg">
                    {role.name}
                  </Badge>
                ))}
              </Group>
            </Stack>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
