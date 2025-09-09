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
  ChefHat,
  Edit,
  Eye,
  Globe,
  Grid,
  List,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  Utensils,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService, type Property } from '../../services/propertyService';
import { userService, type User } from '../../services/userService';

export function Restaurants() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'table'>('table');
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Property | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  // User assignment state
  const [
    assignModalOpened,
    { open: openAssignModal, close: closeAssignModal },
  ] = useDisclosure(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Property | null>(
    null,
  );
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch restaurants from API
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyService.getRestaurants({
        limit: 100, // Get all restaurants for now
      });
      setRestaurants(response.data.properties);
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch restaurants';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter restaurants based on search query
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (id: number) => {
    navigate(`/restaurants/${id}/edit`);
  };

  const handleView = (id: number) => {
    navigate(`/restaurants/${id}`);
  };

  const handleDeleteClick = (restaurant: Property) => {
    setRestaurantToDelete(restaurant);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!restaurantToDelete) return;

    try {
      setDeleteLoading(true);
      await propertyService.deleteProperty(restaurantToDelete.id);

      notifications.show({
        title: 'Success',
        message: 'Restaurant deleted successfully',
        color: 'green',
      });

      // Refresh the list
      await fetchRestaurants();
      closeDeleteModal();
      setRestaurantToDelete(null);
    } catch (error: unknown) {
      let errorMessage = 'Failed to delete restaurant';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }

      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // User assignment handlers
  const handleAssignUsers = async (restaurant: Property) => {
    setSelectedRestaurant(restaurant);
    setUsersLoading(true);
    openAssignModal();

    try {
      // Get all users and users assigned to this property
      const [allUsers, propertyUsers] = await Promise.all([
        userService.getUsers(),
        userService.getUsersByProperty(restaurant.id),
      ]);

      setAvailableUsers(
        allUsers.filter(
          (user) => !propertyUsers.find((pu) => pu.id === user.id),
        ),
      );
      setAssignedUsers(propertyUsers);
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to load users',
        color: 'red',
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAssignUser = async (userId: number) => {
    if (!selectedRestaurant) return;

    try {
      await userService.assignUserToProperty(userId, selectedRestaurant.id);

      // Move user from available to assigned
      const userToMove = availableUsers.find((u) => u.id === userId);
      if (userToMove) {
        setAvailableUsers((prev) => prev.filter((u) => u.id !== userId));
        setAssignedUsers((prev) => [
          ...prev,
          { ...userToMove, property_id: selectedRestaurant.id },
        ]);
      }

      notifications.show({
        title: 'Success',
        message: 'User assigned successfully',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to assign user',
        color: 'red',
      });
    }
  };

  const handleUnassignUser = async (userId: number) => {
    if (!selectedRestaurant) return;

    try {
      await userService.removeUserFromProperty(userId);

      // Move user from assigned to available
      const userToMove = assignedUsers.find((u) => u.id === userId);
      if (userToMove) {
        setAssignedUsers((prev) => prev.filter((u) => u.id !== userId));
        setAvailableUsers((prev) => [
          ...prev,
          { ...userToMove, property_id: undefined },
        ]);
      }

      notifications.show({
        title: 'Success',
        message: 'User unassigned successfully',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to unassign user',
        color: 'red',
      });
    }
  };

  const RestaurantListItem = ({ restaurant }: { restaurant: Property }) => (
    <Paper
      shadow="sm"
      radius="md"
      withBorder
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(240, 147, 251, 0.1)',
        transition: 'all 0.3s ease',
        marginBottom: '1rem',
      }}
    >
      <Group p="md" justify="space-between" align="center">
        <Group align="center" style={{ flex: 1 }}>
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f093fb 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
            }}
          >
            <ChefHat size={20} />
          </Box>

          <Box style={{ flex: 1 }}>
            <Group gap="md" align="center">
              <Box>
                <Group gap="xs" align="center">
                  <Text fw={600} size="sm" c="#2d1b69">
                    {restaurant.name}
                  </Text>
                  <Badge
                    size="xs"
                    variant={restaurant.is_active ? 'light' : 'outline'}
                    color={restaurant.is_active ? 'green' : 'red'}
                  >
                    {restaurant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  Code: {restaurant.code}
                </Text>
              </Box>

              <Box style={{ minWidth: 200 }}>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  <MapPin
                    size={12}
                    style={{ display: 'inline', marginRight: 4 }}
                  />
                  {restaurant.address_line1 || 'No address'}
                  {restaurant.city && `, ${restaurant.city}`}
                </Text>
                <Text size="xs" c="dimmed">
                  <Phone
                    size={12}
                    style={{ display: 'inline', marginRight: 4 }}
                  />
                  {restaurant.phone || 'No phone'}
                </Text>
              </Box>

              <Box style={{ minWidth: 150 }}>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  <Mail
                    size={12}
                    style={{ display: 'inline', marginRight: 4 }}
                  />
                  {restaurant.email || 'No email'}
                </Text>
                {restaurant.website && (
                  <Text
                    size="xs"
                    c="#f093fb"
                    style={{ cursor: 'pointer' }}
                    onClick={() => window.open(restaurant.website, '_blank')}
                    lineClamp={1}
                  >
                    <Globe
                      size={12}
                      style={{ display: 'inline', marginRight: 4 }}
                    />
                    {restaurant.website.replace(/^https?:\/\//, '')}
                  </Text>
                )}
              </Box>
            </Group>
          </Box>
        </Group>

        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="pink"
            size="sm"
            onClick={() => handleView(restaurant.id)}
          >
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="orange"
            size="sm"
            onClick={() => handleEdit(restaurant.id)}
          >
            <Edit size={14} />
          </ActionIcon>
          <Menu position="bottom-end" shadow="md" radius="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <MoreVertical size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<Users size={14} />}
                onClick={() => handleAssignUsers(restaurant)}
              >
                Assign Users
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<Trash2 size={14} />}
                color="red"
                onClick={() => handleDeleteClick(restaurant)}
              >
                Delete Restaurant
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Paper>
  );

  const RestaurantTable = ({ restaurants }: { restaurants: Property[] }) => (
    <Paper
      shadow="sm"
      radius="md"
      withBorder
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(240, 147, 251, 0.1)',
      }}
    >
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Restaurant</Table.Th>
            <Table.Th>Code</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Location</Table.Th>
            <Table.Th>Contact</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {restaurants.map((restaurant) => (
            <Table.Tr key={restaurant.id}>
              <Table.Td>
                <Group gap="sm">
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '6px',
                      background:
                        'linear-gradient(135deg, #f093fb 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <ChefHat size={16} />
                  </Box>
                  <Box>
                    <Text fw={600} size="sm" c="#2d1b69">
                      {restaurant.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Added{' '}
                      {new Date(restaurant.created_at).toLocaleDateString()}
                    </Text>
                  </Box>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {restaurant.code}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  size="sm"
                  variant={restaurant.is_active ? 'light' : 'outline'}
                  color={restaurant.is_active ? 'green' : 'red'}
                >
                  {restaurant.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Box>
                  <Text size="sm" lineClamp={1}>
                    {restaurant.address_line1 || 'No address'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {restaurant.city && `${restaurant.city}, `}
                    {restaurant.state} {restaurant.country}
                  </Text>
                </Box>
              </Table.Td>
              <Table.Td>
                <Box>
                  <Text size="xs" c="dimmed">
                    {restaurant.phone || 'No phone'}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {restaurant.email || 'No email'}
                  </Text>
                </Box>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={() => handleView(restaurant.id)}
                  >
                    <Eye size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="orange"
                    size="sm"
                    onClick={() => handleEdit(restaurant.id)}
                  >
                    <Edit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => handleDeleteClick(restaurant)}
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

  const RestaurantCard = ({ restaurant }: { restaurant: Property }) => (
    <Card
      shadow="sm"
      radius="xl"
      withBorder
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(240, 147, 251, 0.1)',
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
                background: 'linear-gradient(135deg, #f093fb 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
              }}
            >
              <ChefHat size={24} />
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
                  {restaurant.name}
                </Text>
                <Badge
                  size="sm"
                  variant={restaurant.is_active ? 'light' : 'outline'}
                  color={restaurant.is_active ? 'green' : 'red'}
                  style={{ flexShrink: 0 }}
                >
                  {restaurant.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" lineClamp={1}>
                Code: {restaurant.code}
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
                onClick={() => handleView(restaurant.id)}
              >
                View Details
              </Menu.Item>
              <Menu.Item
                leftSection={<Edit size={14} />}
                onClick={() => handleEdit(restaurant.id)}
              >
                Edit Restaurant
              </Menu.Item>
              <Menu.Item
                leftSection={<Users size={14} />}
                onClick={() => handleAssignUsers(restaurant)}
              >
                Assign Users
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<Trash2 size={14} />}
                color="red"
                onClick={() => handleDeleteClick(restaurant)}
              >
                Delete Restaurant
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Details - Fixed height container */}
        <Box style={{ flex: 1, minHeight: '120px' }}>
          <Stack gap="xs">
            {/* Address - Always show, even if empty */}
            <Group gap="xs" align="flex-start">
              <MapPin
                size={14}
                style={{ color: '#f093fb', marginTop: '2px', flexShrink: 0 }}
              />
              <Text size="sm" c="dimmed" lineClamp={2}>
                {restaurant.address_line1 || 'No address provided'}
                {restaurant.city && `, ${restaurant.city}`}
                {restaurant.state && `, ${restaurant.state}`}
                {restaurant.country && `, ${restaurant.country}`}
              </Text>
            </Group>

            {/* Phone */}
            <Group gap="xs">
              <Phone size={14} style={{ color: '#f093fb', flexShrink: 0 }} />
              <Text size="sm" c="dimmed" lineClamp={1}>
                {restaurant.phone || 'No phone provided'}
              </Text>
            </Group>

            {/* Email */}
            <Group gap="xs">
              <Mail size={14} style={{ color: '#f093fb', flexShrink: 0 }} />
              <Text size="sm" c="dimmed" lineClamp={1}>
                {restaurant.email || 'No email provided'}
              </Text>
            </Group>

            {/* Website */}
            <Group gap="xs">
              <Globe size={14} style={{ color: '#f093fb', flexShrink: 0 }} />
              {restaurant.website ? (
                <Text
                  size="sm"
                  c="#f093fb"
                  td="underline"
                  style={{ cursor: 'pointer' }}
                  onClick={() => window.open(restaurant.website, '_blank')}
                  lineClamp={1}
                >
                  {restaurant.website.replace(/^https?:\/\//, '')}
                </Text>
              ) : (
                <Text size="sm" c="dimmed" lineClamp={1}>
                  No website provided
                </Text>
              )}
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
            Added on {new Date(restaurant.created_at).toLocaleDateString()}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="pink"
              size="sm"
              onClick={() => handleView(restaurant.id)}
            >
              <Eye size={14} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              size="sm"
              onClick={() => handleEdit(restaurant.id)}
            >
              <Edit size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );

  return (
    <Box>
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Restaurant"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete{' '}
            <strong>{restaurantToDelete?.name}</strong>? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="outline"
              onClick={closeDeleteModal}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              loading={deleteLoading}
            >
              Delete Restaurant
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* User Assignment Modal */}
      <Modal
        opened={assignModalOpened}
        onClose={() => {
          closeAssignModal();
          setSelectedRestaurant(null);
        }}
        title={`Assign Users to ${selectedRestaurant?.name}`}
        size="lg"
        centered
      >
        <Stack gap="md">
          {usersLoading ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            <>
              <Text size="sm" c="dimmed">
                Available Users
              </Text>
              <Stack gap="xs" mah={200} style={{ overflowY: 'auto' }}>
                {availableUsers.map((user) => (
                  <Paper
                    key={user.id}
                    p="sm"
                    withBorder
                    style={{ cursor: 'pointer' }}
                    onClick={() => user.id && handleAssignUser(user.id)}
                  >
                    <Group justify="space-between">
                      <Group>
                        <Text size="sm" fw={500}>
                          {user.full_name}
                        </Text>
                        <Badge size="xs" variant="light" color="blue">
                          {user.user_type}
                        </Badge>
                      </Group>
                      <Plus size={16} />
                    </Group>
                  </Paper>
                ))}
                {availableUsers.length === 0 && (
                  <Text size="sm" c="dimmed" ta="center">
                    No available users to assign
                  </Text>
                )}
              </Stack>

              <Text size="sm" c="dimmed" mt="md">
                Assigned Users
              </Text>
              <Stack gap="xs" mah={200} style={{ overflowY: 'auto' }}>
                {assignedUsers.map((user) => (
                  <Paper
                    key={user.id}
                    p="sm"
                    withBorder
                    style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                    onClick={() => user.id && handleUnassignUser(user.id)}
                  >
                    <Group justify="space-between">
                      <Group>
                        <Text size="sm" fw={500}>
                          {user.full_name}
                        </Text>
                        <Badge size="xs" variant="light" color="green">
                          {user.user_type}
                        </Badge>
                      </Group>
                      <Text size="xs" c="red" style={{ cursor: 'pointer' }}>
                        Remove
                      </Text>
                    </Group>
                  </Paper>
                ))}
                {assignedUsers.length === 0 && (
                  <Text size="sm" c="dimmed" ta="center">
                    No users assigned to this restaurant
                  </Text>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </Modal>

      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Group>
          <ChefHat size={32} style={{ color: '#f093fb' }} />
          <Title
            order={1}
            size="h1"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Restaurants Management
          </Title>
        </Group>
        <Button
          leftSection={<Plus size={18} />}
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #764ba2 100%)',
            border: 'none',
          }}
          onClick={() => navigate('/create-restaurant')}
        >
          Add New Restaurant
        </Button>
      </Group>

      {/* Search and Filters */}
      <Card
        shadow="sm"
        radius="xl"
        withBorder
        mb="xl"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(240, 147, 251, 0.1)',
        }}
      >
        <Group justify="space-between">
          <TextInput
            placeholder="Search restaurants by name, code, or city..."
            leftSection={<Search size={18} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            style={{ flex: 1, maxWidth: '400px' }}
            styles={{
              input: {
                '&:focus': {
                  borderColor: '#f093fb',
                  boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                },
              },
            }}
          />

          <SegmentedControl
            data={[
              {
                value: 'table',
                label: (
                  <Center style={{ gap: 8 }}>
                    <Eye size={16} />
                    <span>Table</span>
                  </Center>
                ),
              },
              {
                value: 'list',
                label: (
                  <Center style={{ gap: 8 }}>
                    <List size={16} />
                    <span>List</span>
                  </Center>
                ),
              },
              {
                value: 'card',
                label: (
                  <Center style={{ gap: 8 }}>
                    <Grid size={16} />
                    <span>Cards</span>
                  </Center>
                ),
              },
            ]}
            value={viewMode}
            onChange={(value) =>
              setViewMode(value as 'card' | 'list' | 'table')
            }
            color="pink"
          />
        </Group>
      </Card>

      {/* Loading State */}
      {loading && (
        <Center py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" color="#f093fb" />
            <Text c="dimmed">Loading restaurants...</Text>
          </Stack>
        </Center>
      )}

      {/* Error State */}
      {error && (
        <Alert
          color="red"
          variant="light"
          mb="xl"
          styles={{
            root: {
              background: 'rgba(255, 0, 0, 0.05)',
              border: '1px solid rgba(255, 0, 0, 0.2)',
            },
          }}
        >
          <Group>
            <AlertCircle size={20} />
            <Text>{error}</Text>
          </Group>
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
              background: 'linear-gradient(135deg, #f093fb 0%, #764ba2 100%)',
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
                  Total Restaurants
                </Text>
                <Text size="lg" fw={700}>
                  {restaurants.length}
                </Text>
              </Box>
              <ChefHat size={20} style={{ opacity: 0.7 }} />
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
                  Active Restaurants
                </Text>
                <Text size="lg" fw={700}>
                  {restaurants.filter((r) => r.is_active).length}
                </Text>
              </Box>
              <Utensils size={20} style={{ opacity: 0.7 }} />
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
                  Inactive Restaurants
                </Text>
                <Text size="lg" fw={700}>
                  {restaurants.filter((r) => !r.is_active).length}
                </Text>
              </Box>
              <AlertCircle size={20} style={{ opacity: 0.7 }} />
            </Group>
          </Card>

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
                  This Month
                </Text>
                <Text size="lg" fw={700}>
                  +
                  {
                    restaurants.filter((r) => {
                      const today = new Date();
                      const thisMonth = today.getMonth();
                      const thisYear = today.getFullYear();
                      const createdDate = new Date(r.created_at);
                      return (
                        createdDate.getMonth() === thisMonth &&
                        createdDate.getFullYear() === thisYear
                      );
                    }).length
                  }
                </Text>
              </Box>
              <Plus size={20} style={{ opacity: 0.7 }} />
            </Group>
          </Card>
        </div>
      )}

      {/* Restaurants Grid */}
      {filteredRestaurants.length === 0 ? (
        <Alert
          color="pink"
          variant="light"
          radius="xl"
          title="No restaurants found"
          icon={<ChefHat size={16} />}
        >
          {searchQuery
            ? 'No restaurants match your search criteria. Try adjusting your search terms.'
            : 'No restaurants have been added yet. Click "Add New Restaurant" to get started.'}
        </Alert>
      ) : (
        <>
          {viewMode === 'card' && (
            <div className="property-grid">
              {filteredRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="property-card">
                  <RestaurantCard restaurant={restaurant} />
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <Stack gap="sm">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantListItem
                  key={restaurant.id}
                  restaurant={restaurant}
                />
              ))}
            </Stack>
          )}

          {viewMode === 'table' && (
            <RestaurantTable restaurants={filteredRestaurants} />
          )}
        </>
      )}
    </Box>
  );
}
