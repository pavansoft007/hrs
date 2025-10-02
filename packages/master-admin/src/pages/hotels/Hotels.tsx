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
  Building2,
  Edit,
  Eye,
  Globe,
  Grid,
  Hotel,
  List,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService, type Property } from '../../services/propertyService';
import { userService, type User } from '../../services/userService';

export function Hotels() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [hotels, setHotels] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'table'>('table');
  const [selectedHotel, setSelectedHotel] = useState<Property | null>(null);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  // User assignment state
  const [
    assignModalOpened,
    { open: openAssignModal, close: closeAssignModal },
  ] = useDisclosure(false);
  const [selectedHotelForAssignment, setSelectedHotelForAssignment] =
    useState<Property | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Load hotels from API
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch only hotels from properties table where property_type = 'HOTEL'
        const response = await propertyService.getHotels({
          limit: 100,
        });

        // Filter to ensure we only show hotels
        const hotelData = response.data.properties.filter(
          (property: Property) => property.property_type === 'HOTEL',
        );

        setHotels(hotelData);
      } catch (error: unknown) {
        let errorMessage = 'Failed to fetch hotels from database';
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }
        setError(errorMessage);

        // Fallback to empty array if API fails
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Filter hotels based on search query
  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (id: number) => {
    navigate(`/hotels/edit/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/hotels/view/${id}`);
  };

  const handleDeleteClick = (hotel: Property) => {
    setSelectedHotel(hotel);
    openDeleteModal();
  };

  const handleDelete = async (id: number) => {
    const hotel = hotels.find((h) => h.id === id);
    if (!hotel) return;

    setDeletingId(id);
    try {
      await propertyService.deleteProperty(id);

      // Remove from local state after successful deletion
      setHotels((prev) => prev.filter((h) => h.id !== id));

      notifications.show({
        title: 'Success',
        message: `Hotel "${hotel.name}" deleted successfully`,
        color: 'green',
      });

      closeDeleteModal();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete hotel. Please try again.',
        color: 'red',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // User assignment functions
  const handleAssignUsers = async (hotel: Property) => {
    setSelectedHotelForAssignment(hotel);
    setUsersLoading(true);
    openAssignModal();

    try {
      const [allUsers, hotelUsers] = await Promise.all([
        userService.getUsers(),
        userService.getUsersByProperty(hotel.id),
      ]);

      setAssignedUsers(hotelUsers);
      setAvailableUsers(
        allUsers.filter(
          (user: User) => !hotelUsers.some((hu: User) => hu.id === user.id),
        ),
      );
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
    if (!selectedHotelForAssignment) return;

    try {
      await userService.assignUserToProperty(
        userId,
        selectedHotelForAssignment.id,
      );

      const userToMove = availableUsers.find((user) => user.id === userId);
      if (userToMove) {
        setAvailableUsers((prev) => prev.filter((user) => user.id !== userId));
        setAssignedUsers((prev) => [...prev, userToMove]);
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
    if (!selectedHotelForAssignment) return;

    try {
      await userService.removeUserFromProperty(userId);

      const userToMove = assignedUsers.find((user) => user.id === userId);
      if (userToMove) {
        setAssignedUsers((prev) => prev.filter((user) => user.id !== userId));
        setAvailableUsers((prev) => [...prev, userToMove]);
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

  const HotelCard = ({ hotel }: { hotel: Property }) => (
    <Card
      shadow="sm"
      radius="xl"
      withBorder
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
              }}
            >
              <Hotel size={24} />
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
                  {hotel.name}
                </Text>
                <Badge
                  size="sm"
                  variant={hotel.is_active ? 'light' : 'outline'}
                  color={hotel.is_active ? 'green' : 'red'}
                  style={{ flexShrink: 0 }}
                >
                  {hotel.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" lineClamp={1}>
                Code: {hotel.code}
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
                onClick={() => handleView(hotel.id!)}
              >
                View Details
              </Menu.Item>
              <Menu.Item
                leftSection={<Edit size={14} />}
                onClick={() => handleEdit(hotel.id!)}
              >
                Edit Hotel
              </Menu.Item>
              <Menu.Item
                leftSection={<Users size={14} />}
                onClick={() => handleAssignUsers(hotel)}
              >
                Assign Users
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<Trash2 size={14} />}
                color="red"
                onClick={() => handleDeleteClick(hotel)}
              >
                Delete Hotel
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
                style={{ color: '#667eea', marginTop: '2px', flexShrink: 0 }}
              />
              <Text size="sm" c="dimmed" lineClamp={2}>
                {hotel.address_line1 || 'No address provided'}
                {hotel.city && `, ${hotel.city}`}
                {hotel.state && `, ${hotel.state}`}
                {hotel.country && `, ${hotel.country}`}
              </Text>
            </Group>

            {/* Phone */}
            <Group gap="xs">
              <Phone size={14} style={{ color: '#667eea', flexShrink: 0 }} />
              <Text size="sm" c="dimmed" lineClamp={1}>
                {hotel.phone || 'No phone provided'}
              </Text>
            </Group>

            {/* Email */}
            <Group gap="xs">
              <Mail size={14} style={{ color: '#667eea', flexShrink: 0 }} />
              <Text size="sm" c="dimmed" lineClamp={1}>
                {hotel.email || 'No email provided'}
              </Text>
            </Group>

            {/* Website */}
            <Group gap="xs">
              <Globe size={14} style={{ color: '#667eea', flexShrink: 0 }} />
              {hotel.website ? (
                <Text
                  size="sm"
                  c="#667eea"
                  td="underline"
                  lineClamp={1}
                  component="a"
                  href={hotel.website}
                  target="_blank"
                  style={{ cursor: 'pointer' }}
                >
                  {hotel.website.replace(/^https?:\/\//, '')}
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
            Added on {new Date(hotel.created_at).toLocaleDateString()}
          </Text>
          <Text size="xs" c="dimmed" fw={500}>
            {hotel.property_type}
          </Text>
        </Group>
      </Stack>
    </Card>
  );

  const HotelListItem = ({ hotel }: { hotel: Property }) => (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Group justify="space-between" align="center">
        <Group>
          <Box>
            <Text size="lg" fw={600}>
              {hotel.name}
            </Text>
            <Text size="sm" c="dimmed">
              Code: {hotel.code}
            </Text>
            <Group gap="xs">
              <MapPin size={12} style={{ display: 'inline' }} />
              <Text size="sm">
                {hotel.city}, {hotel.state}, {hotel.country}
              </Text>
            </Group>
          </Box>
        </Group>

        <Group>
          <Badge color={hotel.is_active ? 'green' : 'red'} variant="light">
            {hotel.is_active ? 'Active' : 'Inactive'}
          </Badge>

          <ActionIcon
            variant="light"
            color="blue"
            size="md"
            onClick={() => navigate(`/hotels/view/${hotel.id}`)}
          >
            <Eye size={16} />
          </ActionIcon>

          <ActionIcon
            variant="light"
            color="orange"
            size="md"
            onClick={() => navigate(`/hotels/edit/${hotel.id}`)}
          >
            <Edit size={16} />
          </ActionIcon>

          <ActionIcon
            variant="light"
            color="red"
            size="md"
            loading={deletingId === hotel.id}
            onClick={() => handleDelete(hotel.id!)}
          >
            <Trash2 size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );

  const HotelTable = ({ hotels }: { hotels: Property[] }) => (
    <Paper shadow="sm" radius="md" withBorder>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Code</Table.Th>
            <Table.Th>Location</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {hotels.map((hotel) => (
            <Table.Tr key={hotel.id}>
              <Table.Td>
                <Text fw={500}>{hotel.name}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{hotel.code}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {hotel.city}, {hotel.state}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={hotel.is_active ? 'green' : 'red'}
                  variant="light"
                  size="sm"
                >
                  {hotel.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={() => navigate(`/hotels/view/${hotel.id}`)}
                  >
                    <Eye size={14} />
                  </ActionIcon>

                  <ActionIcon
                    variant="light"
                    color="orange"
                    size="sm"
                    onClick={() => navigate(`/hotels/edit/${hotel.id}`)}
                  >
                    <Edit size={14} />
                  </ActionIcon>

                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    loading={deletingId === hotel.id}
                    onClick={() => handleDelete(hotel.id!)}
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
        title="Delete Hotel"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete{' '}
            <Text component="span" fw={600}>
              {selectedHotel?.name}
            </Text>
            ? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              color="red"
              loading={deletingId === selectedHotel?.id}
              onClick={() =>
                selectedHotel?.id && handleDelete(selectedHotel.id)
              }
            >
              Delete Hotel
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* User Assignment Modal */}
      <Modal
        opened={assignModalOpened}
        onClose={() => {
          closeAssignModal();
          setSelectedHotelForAssignment(null);
        }}
        title={`Assign Users to ${selectedHotelForAssignment?.name}`}
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
                    No users assigned to this hotel
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
          <Building2 size={32} style={{ color: '#667eea' }} />
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
            Hotels Management
          </Title>
        </Group>
        <Button
          leftSection={<Plus size={18} />}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
          }}
          onClick={() => navigate('/create-hotel')}
        >
          Add New Hotel
        </Button>
      </Group>

      {/* Search and View Controls */}
      <Card
        radius="lg"
        withBorder
        p="lg"
        mb="xl"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
        }}
      >
        <Group justify="space-between">
          <TextInput
            placeholder="Search hotels by name, code, or city..."
            leftSection={<Search size={18} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            style={{ flex: 1, maxWidth: '400px' }}
            styles={{
              input: {
                '&:focus': {
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
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
            onChange={(value: string) =>
              setViewMode(value as 'card' | 'list' | 'table')
            }
            color="blue"
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
          title="Error loading hotels"
          icon={<Building2 size={16} />}
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

      {/* Statistics Cards */}
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
                  Total Hotels
                </Text>
                <Text size="lg" fw={700}>
                  {hotels.length}
                </Text>
              </Box>
              <Hotel size={20} style={{ opacity: 0.7 }} />
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
                  Active Hotels
                </Text>
                <Text size="lg" fw={700}>
                  {hotels.filter((h) => h.is_active).length}
                </Text>
              </Box>
              <Building2 size={20} style={{ opacity: 0.7 }} />
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
                  Inactive Hotels
                </Text>
                <Text size="lg" fw={700}>
                  {hotels.filter((h) => !h.is_active).length}
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
                    hotels.filter((h) => {
                      const today = new Date();
                      const thisMonth = today.getMonth();
                      const thisYear = today.getFullYear();
                      const createdDate = new Date(h.created_at);
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

      {/* Hotels Grid */}
      {!loading && !error && (
        <>
          {filteredHotels.length === 0 ? (
            <Alert
              color="blue"
              variant="light"
              radius="xl"
              title="No hotels found"
              icon={<Building2 size={16} />}
            >
              {searchQuery
                ? 'No hotels match your search criteria. Try adjusting your search terms.'
                : 'No hotels have been added yet. Click "Add New Hotel" to get started.'}
            </Alert>
          ) : (
            <>
              {viewMode === 'card' && (
                <div className="property-grid">
                  {filteredHotels.map((hotel) => (
                    <div key={hotel.id} className="property-card">
                      <HotelCard hotel={hotel} />
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <Stack gap="sm">
                  {filteredHotels.map((hotel) => (
                    <HotelListItem key={hotel.id} hotel={hotel} />
                  ))}
                </Stack>
              )}

              {viewMode === 'table' && <HotelTable hotels={filteredHotels} />}
            </>
          )}
        </>
      )}
    </Box>
  );
}
