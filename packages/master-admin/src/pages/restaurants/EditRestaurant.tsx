import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  ArrowLeft,
  ChefHat,
  Globe,
  Hash,
  Mail,
  MapPin,
  Phone,
  Save,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService, type Property } from '../../services/propertyService';

export function EditRestaurant() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    phone: '',
    email: '',
    website: '',
    gstin: '',
  });

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
        setFormData({
          code: restaurantData.code || '',
          name: restaurantData.name || '',
          address_line1: restaurantData.address_line1 || '',
          address_line2: restaurantData.address_line2 || '',
          city: restaurantData.city || '',
          state: restaurantData.state || '',
          country: restaurantData.country || 'India',
          postal_code: restaurantData.postal_code || '',
          phone: restaurantData.phone || '',
          email: restaurantData.email || '',
          website: restaurantData.website || '',
          gstin: restaurantData.gstin || '',
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaveLoading(true);
    setError(null);

    try {
      await propertyService.updateProperty(Number(id), {
        code: formData.code,
        name: formData.name,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        gstin: formData.gstin,
      });

      notifications.show({
        title: 'Success',
        message: 'Restaurant updated successfully',
        color: 'green',
      });

      // Navigate back to restaurants list
      navigate('/restaurants');
    } catch (apiError: unknown) {
      let errorMessage = 'Failed to update restaurant. Please try again.';
      if (apiError && typeof apiError === 'object' && 'response' in apiError) {
        const axiosError = apiError as {
          response?: { data?: { message?: string } };
        };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    navigate('/restaurants');
  };

  const countries = [
    'India',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
  ];

  if (loading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" color="#f093fb" />
          <Text c="dimmed">Loading restaurant data...</Text>
        </Stack>
      </Center>
    );
  }

  if (error && !restaurant) {
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
          <Text size="sm">{error}</Text>
        </Alert>
        <Button leftSection={<ArrowLeft size={18} />} onClick={handleBack}>
          Back to Restaurants
        </Button>
      </Box>
    );
  }

  return (
    <Box>
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
            Edit Restaurant
          </Title>
          <Text c="dimmed" size="lg">
            Update restaurant information in your management system
          </Text>
        </Stack>
        <ChefHat size={48} style={{ color: '#f093fb', opacity: 0.7 }} />
      </Group>

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
          <Text size="sm">{error}</Text>
        </Alert>
      )}

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
        <form onSubmit={handleSubmit}>
          <Stack gap="xl">
            {/* Basic Information */}
            <Box>
              <Title order={3} mb="md" c="#f093fb">
                Basic Information
              </Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Restaurant Code"
                    placeholder="e.g., REST001"
                    required
                    leftSection={
                      <Hash size={18} style={{ color: '#f093fb' }} />
                    }
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#f093fb',
                          boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Restaurant Name"
                    placeholder="e.g., Spice Garden Restaurant"
                    required
                    leftSection={
                      <ChefHat size={18} style={{ color: '#f093fb' }} />
                    }
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#f093fb',
                          boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            {/* Address Information */}
            <Box>
              <Title order={3} mb="md" c="#f093fb">
                Address Information
              </Title>
              <Stack gap="md">
                <TextInput
                  label="Address Line 1"
                  placeholder="e.g., 123 Food Street"
                  required
                  leftSection={
                    <MapPin size={18} style={{ color: '#f093fb' }} />
                  }
                  value={formData.address_line1}
                  onChange={(e) =>
                    handleInputChange('address_line1', e.target.value)
                  }
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#f093fb',
                        boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                      },
                    },
                  }}
                />
                <TextInput
                  label="Address Line 2 (Optional)"
                  placeholder="e.g., Food District"
                  leftSection={
                    <MapPin size={18} style={{ color: '#f093fb' }} />
                  }
                  value={formData.address_line2}
                  onChange={(e) =>
                    handleInputChange('address_line2', e.target.value)
                  }
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#f093fb',
                        boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                      },
                    },
                  }}
                />
                <Grid>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      label="City"
                      placeholder="e.g., Mumbai"
                      required
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange('city', e.target.value)
                      }
                      styles={{
                        input: {
                          '&:focus': {
                            borderColor: '#f093fb',
                            boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                          },
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      label="State/Province"
                      placeholder="e.g., Maharashtra"
                      required
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange('state', e.target.value)
                      }
                      styles={{
                        input: {
                          '&:focus': {
                            borderColor: '#f093fb',
                            boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                          },
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      label="Postal Code"
                      placeholder="e.g., 400001"
                      required
                      value={formData.postal_code}
                      onChange={(e) =>
                        handleInputChange('postal_code', e.target.value)
                      }
                      styles={{
                        input: {
                          '&:focus': {
                            borderColor: '#f093fb',
                            boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                          },
                        },
                      }}
                    />
                  </Grid.Col>
                </Grid>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                      label="Country"
                      placeholder="Select country"
                      required
                      data={countries}
                      value={formData.country}
                      onChange={(value) =>
                        handleInputChange('country', value || 'India')
                      }
                      styles={{
                        input: {
                          '&:focus': {
                            borderColor: '#f093fb',
                            boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                          },
                        },
                      }}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Box>

            {/* Contact Information */}
            <Box>
              <Title order={3} mb="md" c="#f093fb">
                Contact Information
              </Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Phone (Optional)"
                    placeholder="e.g., +91 9876543210"
                    leftSection={
                      <Phone size={18} style={{ color: '#f093fb' }} />
                    }
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#f093fb',
                          boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Email (Optional)"
                    placeholder="e.g., info@spicegarden.com"
                    leftSection={
                      <Mail size={18} style={{ color: '#f093fb' }} />
                    }
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#f093fb',
                          boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
              </Grid>
              <Grid mt="md">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Website (Optional)"
                    placeholder="e.g., https://restaurant.com"
                    leftSection={
                      <Globe size={18} style={{ color: '#f093fb' }} />
                    }
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange('website', e.target.value)
                    }
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#f093fb',
                          boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="GSTIN (Optional)"
                    placeholder="e.g., 22AAAAA0000A1Z5"
                    value={formData.gstin}
                    onChange={(e) => handleInputChange('gstin', e.target.value)}
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#f093fb',
                          boxShadow: '0 0 0 2px rgba(240, 147, 251, 0.1)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            {/* Action Buttons */}
            <Group justify="flex-end" mt="xl">
              <Button
                variant="outline"
                color="gray"
                onClick={handleBack}
                disabled={saveLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={saveLoading}
                leftSection={<Save size={18} />}
                style={{
                  background:
                    'linear-gradient(135deg, #f093fb 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
