import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  AlertCircle,
  Edit,
  Eye,
  Grid,
  List,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  User as UserIcon,
  Users as UsersIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, type User } from '../../services/userService';

export function Users() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'table'>('table');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  // Load users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedUsers = await userService.getUsers();
        setUsers(fetchedUsers);
      } catch {
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user_type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (id: number) => {
    navigate(`/users/edit/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/users/view/${id}`);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    openDeleteModal();
  };

  const handleDelete = async (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    try {
      await userService.deleteUser(id);

      // Remove from local state after successful deletion
      setUsers((prev) => prev.filter((u) => u.id !== id));

      notifications.show({
        title: 'Success',
        message: `User "${user.full_name}" deleted successfully`,
        color: 'green',
      });

      closeDeleteModal();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete user. Please try again.',
        color: 'red',
      });
    }
  };

  // const handleToggleStatus = async (user: User) => {
  //   try {
  //     const updatedUser = await userService.toggleUserStatus(user.id!);
  //
  //     // Update local state
  //     setUsers((prev) =>
  //       prev.map((u) => u.id === user.id ? updatedUser : u),
  //     );
  //
  //     notifications.show({
  //       title: 'Success',
  //       message: 'User status updated successfully',
  //       color: 'green',
  //     });
  //   } catch {
  //     notifications.show({
  //       title: 'Error',
  //       message: 'Failed to update user status. Please try again.',
  //       color: 'red',
  //     });
  //   }
  // };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
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

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'MASTER_ADMIN':
        return <Shield size={24} />;
      case 'PROPERTY_ADMIN':
        return <UsersIcon size={24} />;
      case 'STAFF':
        return <UserIcon size={24} />;
      default:
        return <UserIcon size={24} />;
    }
  };

  const UserCard = ({ user }: { user: User }) => (
    <Card
      shadow="sm"
      radius="xl"
      withBorder
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 92, 246, 0.1)',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="hover-lift"
    >
      <Stack gap="md" style={{ height: '100%' }}>
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Group align="flex-start" style={{ flex: 1, minWidth: 0 }}>
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
              }}
            >
              {getUserTypeIcon(user.user_type)}
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" align="center" wrap="nowrap">
                <Text
                  fw={600}
                  size="lg"
                  c="#2d1b69"
                  lineClamp={1}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {user.full_name}
                </Text>
                <Badge
                  size="sm"
                  variant={user.is_active ? 'light' : 'outline'}
                  color={user.is_active ? 'green' : 'red'}
                  style={{ flexShrink: 0 }}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" lineClamp={1}>
                {user.user_type.replace('_', ' ')}
              </Text>
            </Box>
          </Group>

          <Menu position="bottom-end" shadow="md" radius="md">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="md"
                style={{ flexShrink: 0 }}
              >
                <MoreVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<Eye size={14} />}
                onClick={() => handleView(user.id!)}
              >
                View Details
              </Menu.Item>
              <Menu.Item
                leftSection={<Edit size={14} />}
                onClick={() => handleEdit(user.id!)}
              >
                Edit User
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<Trash2 size={14} />}
                color="red"
                onClick={() => handleDeleteClick(user)}
              >
                Delete User
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Details - Fixed height container */}
        <Box style={{ flex: 1, minHeight: '120px' }}>
          <Stack gap="xs">
            {/* Email */}
            <Group gap="xs" align="flex-start">
              <Mail
                size={14}
                style={{ color: '#8b5cf6', marginTop: '2px', flexShrink: 0 }}
              />
              <Text size="sm" c="dimmed" lineClamp={1}>
                {user.email || 'No email provided'}
              </Text>
            </Group>

            {/* Phone */}
            <Group gap="xs">
              <Phone size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
              <Text size="sm" c="dimmed" lineClamp={1}>
                {user.phone || 'No phone provided'}
              </Text>
            </Group>

            {/* Property */}
            {user.property && (
              <Group gap="xs">
                <Shield size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                <Text size="sm" c="dimmed" lineClamp={1}>
                  {user.property.name} ({user.property.code})
                </Text>
              </Group>
            )}

            {/* User Type */}
            <Group gap="xs">
              <Badge
                size="xs"
                variant="light"
                color={getUserTypeColor(user.user_type)}
              >
                {user.user_type.replace('_', ' ')}
              </Badge>
            </Group>
          </Stack>
        </Box>

        {/* Footer */}
        <Group
          justify="space-between"
          pt="sm"
          style={{
            borderTop: '1px solid #f1f3f4',
            marginTop: 'auto',
          }}
        >
          <Text size="xs" c="dimmed">
            Added on {new Date(user.created_at).toLocaleDateString()}
          </Text>
          <Text size="xs" c="dimmed" fw={500}>
            {user.last_login
              ? `Last login: ${new Date(user.last_login).toLocaleDateString()}`
              : 'Never logged in'}
          </Text>
        </Group>
      </Stack>
    </Card>
  );

  const UserListItem = ({ user }: { user: User }) => (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Group justify="space-between" align="center">
        <Group>
          <Box>
            <Text size="lg" fw={600}>
              {user.full_name}
            </Text>
            <Text size="sm" c="dimmed">
              {user.user_type.replace('_', ' ')}
            </Text>
            <Group gap="xs">
              <Mail size={12} style={{ display: 'inline' }} />
              <Text size="sm">{user.email || 'No email'}</Text>
            </Group>
          </Box>
        </Group>

        <Group>
          <Badge color={user.is_active ? 'green' : 'red'} variant="light">
            {user.is_active ? 'Active' : 'Inactive'}
          </Badge>

          <Badge
            color={getUserTypeColor(user.user_type)}
            variant="light"
            size="sm"
          >
            {user.user_type.replace('_', ' ')}
          </Badge>

          <ActionIcon
            variant="light"
            color="blue"
            size="md"
            onClick={() => handleView(user.id!)}
          >
            <Eye size={16} />
          </ActionIcon>

          <ActionIcon
            variant="light"
            color="orange"
            size="md"
            onClick={() => handleEdit(user.id!)}
          >
            <Edit size={16} />
          </ActionIcon>

          <ActionIcon
            variant="light"
            color="red"
            size="md"
            onClick={() => handleDeleteClick(user)}
          >
            <Trash2 size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );

  const UserTable = ({ users }: { users: User[] }) => (
    <Paper shadow="sm" radius="md" withBorder>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Phone</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Property</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>
                <Text fw={500}>{user.full_name}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{user.email || '-'}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{user.phone || '-'}</Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={getUserTypeColor(user.user_type)}
                  variant="light"
                  size="sm"
                >
                  {user.user_type.replace('_', ' ')}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {user.property
                    ? `${user.property.name} (${user.property.code})`
                    : '-'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={user.is_active ? 'green' : 'red'}
                  variant="light"
                  size="sm"
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={() => handleView(user.id!)}
                  >
                    <Eye size={14} />
                  </ActionIcon>

                  <ActionIcon
                    variant="light"
                    color="orange"
                    size="sm"
                    onClick={() => handleEdit(user.id!)}
                  >
                    <Edit size={14} />
                  </ActionIcon>

                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => handleDeleteClick(user)}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );

  return (
    <Box>
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete User"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete{' '}
            <Text component="span" fw={600}>
              {selectedUser?.full_name}
            </Text>
            ? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => selectedUser?.id && handleDelete(selectedUser.id)}
            >
              Delete User
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Group>
          <UsersIcon size={32} style={{ color: '#8b5cf6' }} />
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
            Users Management
          </Title>
        </Group>
        <Button
          leftSection={<Plus size={16} />}
          onClick={() => navigate('/users/create')}
          size="md"
          radius="xl"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          }}
        >
          Add New User
        </Button>
      </Group>

      {/* Search and View Controls */}
      <Card
        shadow="sm"
        radius="xl"
        withBorder
        mb="xl"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
        }}
      >
        <Group justify="space-between" align="flex-end" p="md">
          <TextInput
            placeholder="Search users by name, email, phone, or type..."
            leftSection={<Search size={16} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            size="md"
            radius="xl"
            style={{
              flex: 1,
              maxWidth: '600px',
            }}
            styles={{
              input: {
                '&:focus': {
                  borderColor: '#8b5cf6',
                  boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.1)',
                },
              },
            }}
          />

          <SegmentedControl
            value={viewMode}
            onChange={(value: string) =>
              setViewMode(value as 'card' | 'list' | 'table')
            }
            data={[
              {
                label: (
                  <Center>
                    <Eye size={16} />
                  </Center>
                ),
                value: 'table',
              },
              {
                label: (
                  <Center>
                    <List size={16} />
                  </Center>
                ),
                value: 'list',
              },
              {
                label: (
                  <Center>
                    <Grid size={16} />
                  </Center>
                ),
                value: 'card',
              },
            ]}
            size="md"
            radius="xl"
            color="violet"
          />
        </Group>
      </Card>

      {/* Loading State */}
      {loading && (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      )}

      {/* Error State */}
      {error && (
        <Alert
          color="red"
          variant="light"
          radius="xl"
          title="Error loading users"
          icon={<UsersIcon size={16} />}
          mb="xl"
        >
          {error}
          <Button
            variant="light"
            color="red"
            size="xs"
            mt="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Statistics */}
      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <Card
            shadow="sm"
            radius="md"
            withBorder
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              minHeight: '70px',
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
            }}
          >
            <Group justify="space-between" style={{ width: '100%' }} gap="xs">
              <Box>
                <Text size="xs" opacity={0.9}>
                  Total Users
                </Text>
                <Text size="lg" fw={700}>
                  {users.length}
                </Text>
              </Box>
              <UsersIcon size={20} style={{ opacity: 0.7 }} />
            </Group>
          </Card>

          <Card
            shadow="sm"
            radius="md"
            withBorder
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              minHeight: '70px',
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
            }}
          >
            <Group justify="space-between" style={{ width: '100%' }} gap="xs">
              <Box>
                <Text size="xs" opacity={0.9}>
                  Active Users
                </Text>
                <Text size="lg" fw={700}>
                  {users.filter((u) => u.is_active).length}
                </Text>
              </Box>
              <UserIcon size={20} style={{ opacity: 0.7 }} />
            </Group>
          </Card>

          <Card
            shadow="sm"
            radius="md"
            withBorder
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              minHeight: '70px',
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
            }}
          >
            <Group justify="space-between" style={{ width: '100%' }} gap="xs">
              <Box>
                <Text size="xs" opacity={0.9}>
                  Admins
                </Text>
                <Text size="lg" fw={700}>
                  {users.filter((u) => u.user_type.includes('ADMIN')).length}
                </Text>
              </Box>
              <Shield size={20} style={{ opacity: 0.7 }} />
            </Group>
          </Card>

          <Card
            shadow="sm"
            radius="md"
            withBorder
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              minHeight: '70px',
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
            }}
          >
            <Group justify="space-between" style={{ width: '100%' }} gap="xs">
              <Box>
                <Text size="xs" opacity={0.9}>
                  Inactive Users
                </Text>
                <Text size="lg" fw={700}>
                  {users.filter((u) => !u.is_active).length}
                </Text>
              </Box>
              <AlertCircle size={20} style={{ opacity: 0.7 }} />
            </Group>
          </Card>
        </div>
      )}

      {/* Content */}
      {!loading && !error && filteredUsers.length === 0 ? (
        <Alert
          variant="light"
          color="blue"
          title="No users found"
          icon={<UsersIcon size={16} />}
        >
          {searchQuery
            ? 'No users match your search criteria. Try adjusting your search terms.'
            : 'No users have been added yet. Click "Add New User" to get started.'}
        </Alert>
      ) : (
        <>
          {viewMode === 'card' && (
            <div className="property-grid">
              {filteredUsers.map((user) => (
                <div key={user.id} className="property-card">
                  <UserCard user={user} />
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <Stack gap="sm">
              {filteredUsers.map((user) => (
                <UserListItem key={user.id} user={user} />
              ))}
            </Stack>
          )}

          {viewMode === 'table' && <UserTable users={filteredUsers} />}
        </>
      )}
    </Box>
  );
}
