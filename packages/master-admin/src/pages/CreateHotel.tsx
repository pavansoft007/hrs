import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Building2, Globe, Hotel, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';

interface HotelFormData {
  code: string;
  name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
}

export default function CreateHotel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<HotelFormData>({
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

  const handleInputChange = (field: keyof HotelFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await propertyService.createHotel({
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

      navigate('/hotels');
    } catch (apiError: unknown) {
      let errorMessage = 'Failed to create hotel. Please try again.';
      if (apiError && typeof apiError === 'object' && 'response' in apiError) {
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

  return (
    <Box>
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
            Create New Hotel
          </Title>
        </Group>
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
          <strong>Note:</strong> All required fields must be filled. Hotel code
          must be unique across the system.
        </Text>
      </Alert>

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
        <form onSubmit={handleSubmit}>
          <Stack gap="xl">
            <Box>
              <Group mb="lg">
                <Hotel size={24} style={{ color: '#667eea' }} />
                <Title order={3} c="#667eea">
                  Basic Information
                </Title>
              </Group>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Hotel Code"
                    placeholder="e.g., HOTEL001"
                    required
                    leftSection={
                      <Building2 size={18} style={{ color: '#667eea' }} />
                    }
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#667eea',
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Hotel Name"
                    placeholder="e.g., Grand Palace Hotel"
                    required
                    leftSection={
                      <Hotel size={18} style={{ color: '#667eea' }} />
                    }
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#667eea',
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            <Box>
              <Title order={3} mb="md" c="#667eea">
                Address Information
              </Title>
              <Stack gap="md">
                <TextInput
                  label="Address Line 1"
                  placeholder="e.g., 123 Royal Street"
                  required
                  leftSection={
                    <MapPin size={18} style={{ color: '#667eea' }} />
                  }
                  value={formData.address_line1}
                  onChange={(e) =>
                    handleInputChange('address_line1', e.target.value)
                  }
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                      },
                    },
                  }}
                />
                <TextInput
                  label="Address Line 2 (Optional)"
                  placeholder="e.g., Downtown District"
                  leftSection={
                    <MapPin size={18} style={{ color: '#667eea' }} />
                  }
                  value={formData.address_line2}
                  onChange={(e) =>
                    handleInputChange('address_line2', e.target.value)
                  }
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                      },
                    },
                  }}
                />
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
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
                            borderColor: '#667eea',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                          },
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="State"
                      placeholder="e.g., Maharashtra"
                      required
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange('state', e.target.value)
                      }
                      styles={{
                        input: {
                          '&:focus': {
                            borderColor: '#667eea',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
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
                      data={[
                        { value: 'India', label: 'India' },
                        { value: 'USA', label: 'United States' },
                        { value: 'UK', label: 'United Kingdom' },
                        { value: 'Canada', label: 'Canada' },
                        { value: 'Australia', label: 'Australia' },
                      ]}
                      value={formData.country}
                      onChange={(value) =>
                        handleInputChange('country', value || 'India')
                      }
                      styles={{
                        input: {
                          '&:focus': {
                            borderColor: '#667eea',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                          },
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
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
                            borderColor: '#667eea',
                            boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                          },
                        },
                      }}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Box>

            <Box>
              <Title order={3} mb="md" c="#667eea">
                Contact Information
              </Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Phone (Optional)"
                    placeholder="e.g., +91 22 1234 5678"
                    leftSection={
                      <Phone size={18} style={{ color: '#667eea' }} />
                    }
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#667eea',
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Email (Optional)"
                    placeholder="e.g., info@hotel.com"
                    leftSection={
                      <Mail size={18} style={{ color: '#667eea' }} />
                    }
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#667eea',
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
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
                    placeholder="e.g., https://hotel.com"
                    leftSection={
                      <Globe size={18} style={{ color: '#667eea' }} />
                    }
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange('website', e.target.value)
                    }
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: '#667eea',
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
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
                          borderColor: '#667eea',
                          boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            <Group justify="flex-end" gap="md" pt="md">
              <Button
                variant="subtle"
                onClick={() =>
                  setFormData({
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
                  })
                }
                disabled={loading}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                loading={loading}
                leftSection={<Hotel size={18} />}
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                Create Hotel
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
