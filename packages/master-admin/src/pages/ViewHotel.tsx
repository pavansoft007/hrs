import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  ArrowLeft,
  Building2,
  Edit,
  Globe,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type Property } from '../services/propertyService';

export function ViewHotel() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    const loadHotel = () => {
      setLoading(true);

      // Simulate API delay (reduced to 300ms for better UX)
      setTimeout(() => {
        const hotelId = parseInt(id || '0', 10);
        const foundHotel = mockHotels.find((h) => h.id === hotelId);
        setHotel(foundHotel || null);
        setLoading(false);
      }, 300);
    };

    if (id) {
      loadHotel();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (!id) {
    return (
      <Box>
        <Text c="red">Invalid hotel ID</Text>
        <Button
          variant="light"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => navigate('/hotels')}
          mt="md"
        >
          Back to Hotels
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box pos="relative" mih={400}>
        <LoadingOverlay visible />
      </Box>
    );
  }

  if (!hotel) {
    return (
      <Box>
        <Text c="red">Hotel not found</Text>
        <Button
          variant="light"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => navigate('/hotels')}
          mt="md"
        >
          Back to Hotels
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Group mb="xl">
        <Button
          variant="subtle"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => navigate('/hotels')}
        >
          Back to Hotels
        </Button>
        <Group ml="auto">
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
            Hotel Details
          </Title>
        </Group>
      </Group>

      {/* Hotel Information Card */}
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
        <Stack gap="lg">
          {/* Basic Info */}
          <Group justify="space-between" align="flex-start">
            <Box>
              <Group gap="sm" mb="xs">
                <Title order={2}>{hotel.name}</Title>
                <Badge
                  variant="light"
                  color={hotel.is_active ? 'green' : 'red'}
                  size="sm"
                >
                  {hotel.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Group>
              <Text c="dimmed" size="sm">
                Code: {hotel.code} • {hotel.property_type}
              </Text>
            </Box>
            <Button
              leftSection={<Edit size={16} />}
              onClick={() => navigate(`/hotels/edit/${hotel.id}`)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              Edit Hotel
            </Button>
          </Group>

          {/* Address Section */}
          <Card withBorder radius="md" p="md">
            <Group gap="sm" mb="sm">
              <MapPin size={20} style={{ color: '#667eea' }} />
              <Title order={4}>Address</Title>
            </Group>
            <Stack gap="xs">
              <Text>{hotel.address_line1}</Text>
              {hotel.address_line2 && <Text>{hotel.address_line2}</Text>}
              <Text>
                {hotel.city}, {hotel.state} {hotel.postal_code}
              </Text>
              <Text>{hotel.country}</Text>
            </Stack>
          </Card>

          {/* Contact Section */}
          <Card withBorder radius="md" p="md">
            <Group gap="sm" mb="sm">
              <Phone size={20} style={{ color: '#667eea' }} />
              <Title order={4}>Contact Information</Title>
            </Group>
            <Stack gap="sm">
              <Group gap="sm">
                <Phone size={16} />
                <Text>{hotel.phone}</Text>
              </Group>
              <Group gap="sm">
                <Mail size={16} />
                <Text>{hotel.email}</Text>
              </Group>
              {hotel.website && (
                <Group gap="sm">
                  <Globe size={16} />
                  <Text
                    component="a"
                    href={hotel.website}
                    target="_blank"
                    style={{
                      color: '#667eea',
                      textDecoration: 'none',
                    }}
                  >
                    {hotel.website}
                  </Text>
                </Group>
              )}
            </Stack>
          </Card>

          {/* Additional Details */}
          <Card withBorder radius="md" p="md">
            <Title order={4} mb="sm">
              Additional Information
            </Title>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={500}>Timezone:</Text>
                <Text>{hotel.timezone}</Text>
              </Group>
              {hotel.gstin && (
                <Group justify="space-between">
                  <Text fw={500}>GSTIN:</Text>
                  <Text>{hotel.gstin}</Text>
                </Group>
              )}
              <Group justify="space-between">
                <Text fw={500}>Created:</Text>
                <Text>{new Date(hotel.created_at).toLocaleDateString()}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={500}>Last Updated:</Text>
                <Text>{new Date(hotel.updated_at).toLocaleDateString()}</Text>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </Card>
    </Box>
  );
}
