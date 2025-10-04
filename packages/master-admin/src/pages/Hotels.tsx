import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  AlertCircle,
  Building2,
  Edit,
  Eye,
  Globe,
  Hotel,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Property } from '../services/propertyService';

export function Hotels() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [hotels, setHotels] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load mock data (replace with API call)
  useEffect(() => {
    const loadMockData = () => {
      setLoading(true);
      // Simulate API delay (reduced for better UX)
      setTimeout(() => {
        const mockHotels: Property[] = [
          {
            id: 1,
            code: 'HOTEL001',
            name: 'Grand Palace Hotel',
            property_type: 'HOTEL',
            address_line1: '123 Royal Street',
            address_line2: 'Downtown District',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            postal_code: '400001',
            timezone: 'Asia/Kolkata',
            phone: '+91 22 1234 5678',
            email: 'info@grandpalace.com',
            website: 'https://grandpalace.com',
            gstin: '27AAAAA0000A1Z5',
            is_active: true,
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
          },
          {
            id: 2,
            code: 'HOTEL002',
            name: 'Luxury Resort & Spa',
            property_type: 'HOTEL',
            address_line1: '456 Beach Road',
            address_line2: 'Resort Complex',
            city: 'Goa',
            state: 'Goa',
            country: 'India',
            postal_code: '403001',
            timezone: 'Asia/Kolkata',
            phone: '+91 832 9876 5432',
            email: 'bookings@luxuryresort.com',
            website: 'https://luxuryresort.com',
            gstin: '30BBBBB1111B2Z6',
            is_active: true,
            created_at: '2024-02-10T00:00:00Z',
            updated_at: '2024-02-10T00:00:00Z',
          },
          {
            id: 3,
            code: 'HOTEL003',
            name: 'Business Inn',
            property_type: 'HOTEL',
            address_line1: '789 Corporate Avenue',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            postal_code: '560001',
            timezone: 'Asia/Kolkata',
            phone: '+91 80 5555 7777',
            email: 'info@businessinn.com',
            website: 'https://businessinn.com',
            is_active: false,
            created_at: '2024-03-05T00:00:00Z',
            updated_at: '2024-03-05T00:00:00Z',
          },
        ];
        setHotels(mockHotels);
        setLoading(false);
      }, 300);
    };

    loadMockData();
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

  const handleDelete = async (id: number) => {
    const hotel = hotels.find((h) => h.id === id);
    if (!hotel) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${hotel.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(id);
    try {
      // For now, just remove from local state
      // TODO: Use propertyService.deleteProperty(id) when server is working
      setHotels((prev) => prev.filter((h) => h.id !== id));

      // Show success message
      alert(`Hotel "${hotel.name}" deleted successfully`);
    } catch {
      alert('Failed to delete hotel. Please try again.');
      setError('Failed to delete hotel. Please try again.');
    } finally {
      setDeletingId(null);
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
      }}
      className="hover-lift"
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Group>
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
              }}
            >
              <Hotel size={24} />
            </Box>
            <Box>
              <Group gap="xs">
                <Text fw={600} size="lg" c="#2d1b69">
                  {hotel.name}
                </Text>
                <Badge
                  size="sm"
                  variant={hotel.is_active ? 'light' : 'outline'}
                  color={hotel.is_active ? 'green' : 'red'}
                >
                  {hotel.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Code: {hotel.code}
              </Text>
            </Box>
          </Group>

          <Menu position="bottom-end" shadow="md" radius="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg" radius="md">
                <MoreVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<Eye size={14} />}
                onClick={() => handleView(hotel.id)}
              >
                View Details
              </Menu.Item>
              <Menu.Item
                leftSection={<Edit size={14} />}
                onClick={() => handleEdit(hotel.id)}
              >
                Edit Hotel
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<Trash2 size={14} />}
                color="red"
                onClick={() => handleDelete(hotel.id)}
              >
                Delete Hotel
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Details */}
        <Stack gap="xs">
          {hotel.address_line1 && (
            <Group gap="xs">
              <MapPin
                size={14}
                style={{ color: '#667eea', marginTop: '2px' }}
              />
              <Text size="sm" c="dimmed">
                {hotel.address_line1}
                {hotel.city && `, ${hotel.city}`}
                {hotel.state && `, ${hotel.state}`}
                {hotel.country && `, ${hotel.country}`}
              </Text>
            </Group>
          )}

          {hotel.phone && (
            <Group gap="xs">
              <Phone size={14} style={{ color: '#667eea' }} />
              <Text size="sm" c="dimmed">
                {hotel.phone}
              </Text>
            </Group>
          )}

          {hotel.email && (
            <Group gap="xs">
              <Mail size={14} style={{ color: '#667eea' }} />
              <Text size="sm" c="dimmed">
                {hotel.email}
              </Text>
            </Group>
          )}

          {hotel.website && (
            <Group gap="xs">
              <Globe size={14} style={{ color: '#667eea' }} />
              <Text
                size="sm"
                c="#667eea"
                td="underline"
                style={{ cursor: 'pointer' }}
                onClick={() => window.open(hotel.website, '_blank')}
              >
                {hotel.website}
              </Text>
            </Group>
          )}
        </Stack>

        {/* Footer */}
        <Group
          justify="space-between"
          pt="sm"
          style={{ borderTop: '1px solid #f1f3f4' }}
        >
          <Text size="xs" c="dimmed">
            Added on {new Date(hotel.created_at).toLocaleDateString()}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={() => handleView(hotel.id)}
            >
              <Eye size={14} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="orange"
              size="sm"
              onClick={() => handleEdit(hotel.id)}
            >
              <Edit size={14} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              onClick={() => handleDelete(hotel.id)}
              loading={deletingId === hotel.id}
              disabled={deletingId === hotel.id}
            >
              <Trash2 size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );

  return (
    <Box>
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

      {/* Search and Filters */}
      <Card
        shadow="sm"
        radius="xl"
        withBorder
        mb="xl"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(102, 126, 234, 0.1)',
        }}
      >
        <Group>
          <TextInput
            placeholder="Search hotels by name, code, or city..."
            leftSection={<Search size={18} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            style={{ flex: 1 }}
            styles={{
              input: {
                '&:focus': {
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                },
              },
            }}
          />
        </Group>
      </Card>

      {/* Loading State */}
      {loading && (
        <Center py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" color="#667eea" />
            <Text c="dimmed">Loading hotels...</Text>
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
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="sm"
              radius="xl"
              withBorder
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <Group justify="space-between">
                <Box>
                  <Text size="sm" opacity={0.9}>
                    Total Hotels
                  </Text>
                  <Text size="xl" fw={700}>
                    {hotels.length}
                  </Text>
                </Box>
                <Hotel size={32} style={{ opacity: 0.7 }} />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="sm"
              radius="xl"
              withBorder
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
              }}
            >
              <Group justify="space-between">
                <Box>
                  <Text size="sm" opacity={0.9}>
                    Active Hotels
                  </Text>
                  <Text size="xl" fw={700}>
                    {hotels.filter((h) => h.is_active).length}
                  </Text>
                </Box>
                <Building2 size={32} style={{ opacity: 0.7 }} />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="sm"
              radius="xl"
              withBorder
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
              }}
            >
              <Group justify="space-between">
                <Box>
                  <Text size="sm" opacity={0.9}>
                    Inactive Hotels
                  </Text>
                  <Text size="xl" fw={700}>
                    {hotels.filter((h) => !h.is_active).length}
                  </Text>
                </Box>
                <AlertCircle size={32} style={{ opacity: 0.7 }} />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="sm"
              radius="xl"
              withBorder
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
              }}
            >
              <Group justify="space-between">
                <Box>
                  <Text size="sm" opacity={0.9}>
                    This Month
                  </Text>
                  <Text size="xl" fw={700}>
                    +2
                  </Text>
                </Box>
                <Plus size={32} style={{ opacity: 0.7 }} />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {/* Hotels Grid */}
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
        <Grid>
          {filteredHotels.map((hotel) => (
            <Grid.Col key={hotel.id} span={{ base: 12, md: 6, xl: 4 }}>
              <HotelCard hotel={hotel} />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Box>
  );
}
