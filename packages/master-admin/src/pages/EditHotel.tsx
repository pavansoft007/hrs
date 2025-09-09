import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type Property } from '../services/propertyService';

interface EditHotelForm {
  code: string;
  name: string;
  property_type: 'HOTEL' | 'RESTAURANT';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  timezone: string;
  phone: string;
  email: string;
  website?: string;
  gstin?: string;
  is_active: boolean;
}

export function EditHotel() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hotel, setHotel] = useState<Property | null>(null);

  // Mock data for now - replace with API call when server is working
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

  const form = useForm<EditHotelForm>({
    initialValues: {
      code: '',
      name: '',
      property_type: 'HOTEL',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: 'India',
      postal_code: '',
      timezone: 'Asia/Kolkata',
      phone: '',
      email: '',
      website: '',
      gstin: '',
      is_active: true,
    },
    validate: {
      name: (value) => (value.trim() ? null : 'Name is required'),
      code: (value) => (value.trim() ? null : 'Code is required'),
      address_line1: (value) => (value.trim() ? null : 'Address is required'),
      city: (value) => (value.trim() ? null : 'City is required'),
      state: (value) => (value.trim() ? null : 'State is required'),
      country: (value) => (value.trim() ? null : 'Country is required'),
      postal_code: (value) => (value.trim() ? null : 'Postal code is required'),
      phone: (value) => (value.trim() ? null : 'Phone is required'),
      email: (value) =>
        value.trim() && /^\S+@\S+\.\S+$/.test(value)
          ? null
          : 'Valid email is required',
      website: (value) =>
        !value || /^https?:\/\/.+/.test(value) ? null : 'Valid URL is required',
    },
  });

  // Load hotel data
  useEffect(() => {
    const loadHotel = () => {
      setLoading(true);

      // Simulate API delay (reduced for better UX)
      setTimeout(() => {
        const hotelId = parseInt(id || '0', 10);
        const foundHotel = mockHotels.find((h) => h.id === hotelId);

        if (foundHotel) {
          setHotel(foundHotel);
          form.setValues({
            code: foundHotel.code,
            name: foundHotel.name,
            property_type: foundHotel.property_type,
            address_line1: foundHotel.address_line1,
            address_line2: foundHotel.address_line2 || '',
            city: foundHotel.city,
            state: foundHotel.state,
            country: foundHotel.country,
            postal_code: foundHotel.postal_code,
            timezone: foundHotel.timezone,
            phone: foundHotel.phone,
            email: foundHotel.email,
            website: foundHotel.website || '',
            gstin: foundHotel.gstin || '',
            is_active: foundHotel.is_active,
          });
        }
        setLoading(false);
      }, 300);
    };

    if (id) {
      loadHotel();
    } else {
      setLoading(false);
    }
  }, [id, form]);

  const handleSubmit = async (values: EditHotelForm) => {
    setSubmitting(true);
    try {
      // TODO: Replace with API call when server is working
      // await propertyService.updateProperty(parseInt(id || '0'), values);

      // Simulate API call (reduced delay)
      await new Promise((resolve) => setTimeout(resolve, 300));

      alert(`Hotel "${values.name}" updated successfully!`);
      navigate('/hotels');
    } catch {
      alert('Failed to update hotel. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!id) {
    return (
      <Box>
        <Text color="red">Invalid hotel ID</Text>
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
        <Text color="red">Hotel not found</Text>
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
            Edit Hotel
          </Title>
        </Group>
      </Group>

      {/* Form */}
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
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Title order={3} c="dimmed" mb="xs">
              Basic Information
            </Title>

            <Group grow>
              <TextInput
                label="Hotel Code"
                placeholder="HOTEL001"
                required
                {...form.getInputProps('code')}
              />
              <Select
                label="Property Type"
                data={[
                  { value: 'HOTEL', label: 'Hotel' },
                  { value: 'RESTAURANT', label: 'Restaurant' },
                ]}
                required
                {...form.getInputProps('property_type')}
              />
            </Group>

            <TextInput
              label="Hotel Name"
              placeholder="Grand Palace Hotel"
              required
              {...form.getInputProps('name')}
            />

            <Title order={3} c="dimmed" mb="xs" mt="lg">
              Address Information
            </Title>

            <TextInput
              label="Address Line 1"
              placeholder="123 Main Street"
              required
              {...form.getInputProps('address_line1')}
            />

            <TextInput
              label="Address Line 2"
              placeholder="Suite 100 (optional)"
              {...form.getInputProps('address_line2')}
            />

            <Group grow>
              <TextInput
                label="City"
                placeholder="Mumbai"
                required
                {...form.getInputProps('city')}
              />
              <TextInput
                label="State"
                placeholder="Maharashtra"
                required
                {...form.getInputProps('state')}
              />
            </Group>

            <Group grow>
              <TextInput
                label="Country"
                placeholder="India"
                required
                {...form.getInputProps('country')}
              />
              <TextInput
                label="Postal Code"
                placeholder="400001"
                required
                {...form.getInputProps('postal_code')}
              />
            </Group>

            <Title order={3} c="dimmed" mb="xs" mt="lg">
              Contact Information
            </Title>

            <Group grow>
              <TextInput
                label="Phone"
                placeholder="+91 22 1234 5678"
                required
                {...form.getInputProps('phone')}
              />
              <TextInput
                label="Email"
                placeholder="info@hotel.com"
                required
                {...form.getInputProps('email')}
              />
            </Group>

            <Group grow>
              <TextInput
                label="Website"
                placeholder="https://hotel.com"
                {...form.getInputProps('website')}
              />
              <TextInput
                label="GSTIN"
                placeholder="27AAAAA0000A1Z5"
                {...form.getInputProps('gstin')}
              />
            </Group>

            <Select
              label="Timezone"
              data={[
                { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
                { value: 'America/New_York', label: 'America/New_York (EST)' },
              ]}
              required
              {...form.getInputProps('timezone')}
            />

            <Select
              label="Status"
              data={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              value={form.values.is_active.toString()}
              onChange={(value) =>
                form.setFieldValue('is_active', value === 'true')
              }
              required
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="subtle" onClick={() => navigate('/hotels')}>
                Cancel
              </Button>
              <Button
                type="submit"
                leftSection={<Save size={16} />}
                loading={submitting}
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                Update Hotel
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
