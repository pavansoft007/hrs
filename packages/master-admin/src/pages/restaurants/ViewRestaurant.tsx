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
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  ArrowLeft,
  Calendar,
  ChefHat,
  Clock,
  Edit,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService, type Property } from '../../services/propertyService';

export function ViewRestaurant() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Property | null>(null);

  // Fetch restaurant data on component mount
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) {
        setError('Restaurant ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await propertyService.getPropertyById(Number(id));
        const restaurantData = response.data.property;

        if (restaurantData.property_type !== 'RESTAURANT') {
          setError('This property is not a restaurant');
          setLoading(false);
          return;
        }

        setRestaurant(restaurantData);
      } catch (apiError: unknown) {
        let errorMessage = 'Failed to fetch restaurant data';
        if (
          apiError &&
          typeof apiError === 'object' &&
          'response' in apiError
        ) {
          const axiosError = apiError as {
            response?: { data?: { message?: string } };
          };
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const handleBack = () => {
    navigate('/restaurants');
  };

  const handleEdit = () => {
    navigate(`/restaurants/${id}/edit`);
  };

  if (loading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" color="#f093fb" />
          <Text c="dimmed">Loading restaurant details...</Text>
        </Stack>
      </Center>
    );
  }

  if (error || !restaurant) {
    return (
      <Box>
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
          <Text size="sm">{error || 'Restaurant not found'}</Text>
        </Alert>
        <Button leftSection={<ArrowLeft size={18} />} onClick={handleBack}>
          Back to Restaurants
        </Button>
      </Box>
    );
  }

  const InfoCard = ({
    icon: Icon,
    label,
    value,
    link,
  }: {
    icon: React.ElementType;
    label: string;
    value?: string;
    link?: string;
  }) => {
    const content = (
      <Group gap="sm" wrap="nowrap">
        <Icon size={18} style={{ color: '#f093fb', flexShrink: 0 }} />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lh={1}>
            {label}
          </Text>
          <Text
            size="sm"
            fw={500}
            style={{
              color: link ? '#f093fb' : undefined,
              textDecoration: link ? 'underline' : undefined,
              cursor: link ? 'pointer' : undefined,
            }}
            truncate
          >
            {value || 'Not specified'}
          </Text>
        </Box>
      </Group>
    );

    if (link) {
      return (
        <Box
          onClick={() => window.open(link, '_blank')}
          style={{ cursor: 'pointer' }}
        >
          {content}
        </Box>
      );
    }

    return content;
  };

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Stack gap="xs">
          <Group>
            <Button
              variant="subtle"
              leftSection={<ArrowLeft size={18} />}
              onClick={handleBack}
            >
              Back to Restaurants
            </Button>
          </Group>
          <Group>
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
              }}
            >
              <ChefHat size={24} />
            </Box>
            <Stack gap={4}>
              <Group gap="sm">
                <Title
                  order={1}
                  size="h1"
                  style={{
                    background:
                      'linear-gradient(135deg, #f093fb 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {restaurant.name}
                </Title>
                <Badge
                  size="lg"
                  variant={restaurant.is_active ? 'light' : 'outline'}
                  color={restaurant.is_active ? 'green' : 'red'}
                >
                  {restaurant.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Group>
              <Text c="dimmed" size="lg">
                Restaurant Code: {restaurant.code}
              </Text>
            </Stack>
          </Group>
        </Stack>
        <ActionIcon
          size="xl"
          variant="light"
          color="pink"
          onClick={handleEdit}
          style={{ background: 'rgba(240, 147, 251, 0.1)' }}
        >
          <Edit size={24} />
        </ActionIcon>
      </Group>

      <Grid>
        {/* Main Information */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            {/* Basic Details */}
            <Card
              shadow="sm"
              radius="xl"
              withBorder
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(240, 147, 251, 0.1)',
              }}
            >
              <Stack gap="lg">
                <Group justify="space-between">
                  <Title order={3} c="#f093fb">
                    Restaurant Details
                  </Title>
                  <Button
                    leftSection={<Edit size={16} />}
                    variant="light"
                    color="pink"
                    size="sm"
                    onClick={handleEdit}
                  >
                    Edit Details
                  </Button>
                </Group>

                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <InfoCard
                      icon={ChefHat}
                      label="Restaurant Name"
                      value={restaurant.name}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <InfoCard
                      icon={User}
                      label="Restaurant Code"
                      value={restaurant.code}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>

            {/* Location Information */}
            <Card
              shadow="sm"
              radius="xl"
              withBorder
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(240, 147, 251, 0.1)',
              }}
            >
              <Stack gap="lg">
                <Title order={3} c="#f093fb">
                  Location Information
                </Title>

                <Stack gap="md">
                  <InfoCard
                    icon={MapPin}
                    label="Address Line 1"
                    value={restaurant.address_line1}
                  />
                  {restaurant.address_line2 && (
                    <InfoCard
                      icon={MapPin}
                      label="Address Line 2"
                      value={restaurant.address_line2}
                    />
                  )}
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <InfoCard
                        icon={MapPin}
                        label="City"
                        value={restaurant.city}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <InfoCard
                        icon={MapPin}
                        label="State"
                        value={restaurant.state}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <InfoCard
                        icon={MapPin}
                        label="Country"
                        value={restaurant.country}
                      />
                    </Grid.Col>
                  </Grid>
                  <InfoCard
                    icon={MapPin}
                    label="Postal Code"
                    value={restaurant.postal_code}
                  />
                </Stack>
              </Stack>
            </Card>

            {/* Contact Information */}
            <Card
              shadow="sm"
              radius="xl"
              withBorder
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(240, 147, 251, 0.1)',
              }}
            >
              <Stack gap="lg">
                <Title order={3} c="#f093fb">
                  Contact Information
                </Title>

                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <InfoCard
                      icon={Phone}
                      label="Phone"
                      value={restaurant.phone}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <InfoCard
                      icon={Mail}
                      label="Email"
                      value={restaurant.email}
                    />
                  </Grid.Col>
                </Grid>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <InfoCard
                      icon={Globe}
                      label="Website"
                      value={restaurant.website}
                      link={restaurant.website}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <InfoCard
                      icon={User}
                      label="GSTIN"
                      value={restaurant.gstin}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>

        {/* Sidebar */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            {/* Status Card */}
            <Card
              shadow="sm"
              radius="xl"
              withBorder
              style={{
                background: restaurant.is_active
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
              }}
            >
              <Stack gap="md" align="center">
                <ChefHat size={48} style={{ opacity: 0.8 }} />
                <Stack gap={4} align="center">
                  <Text size="lg" fw={600}>
                    Restaurant Status
                  </Text>
                  <Badge
                    size="lg"
                    variant="light"
                    color={restaurant.is_active ? 'green' : 'orange'}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    {restaurant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Stack>
              </Stack>
            </Card>

            {/* Timestamps */}
            <Card
              shadow="sm"
              radius="xl"
              withBorder
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(240, 147, 251, 0.1)',
              }}
            >
              <Stack gap="lg">
                <Title order={4} c="#f093fb">
                  Timeline
                </Title>
                <Stack gap="md">
                  <InfoCard
                    icon={Calendar}
                    label="Created"
                    value={new Date(restaurant.created_at).toLocaleString()}
                  />
                  <InfoCard
                    icon={Clock}
                    label="Last Updated"
                    value={new Date(restaurant.updated_at).toLocaleString()}
                  />
                </Stack>
              </Stack>
            </Card>

            {/* Quick Actions */}
            <Card
              shadow="sm"
              radius="xl"
              withBorder
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(240, 147, 251, 0.1)',
              }}
            >
              <Stack gap="lg">
                <Title order={4} c="#f093fb">
                  Quick Actions
                </Title>
                <Stack gap="sm">
                  <Button
                    leftSection={<Edit size={16} />}
                    variant="light"
                    color="pink"
                    fullWidth
                    onClick={handleEdit}
                  >
                    Edit Restaurant
                  </Button>
                  <Button
                    leftSection={<ArrowLeft size={16} />}
                    variant="outline"
                    color="gray"
                    fullWidth
                    onClick={handleBack}
                  >
                    Back to List
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
