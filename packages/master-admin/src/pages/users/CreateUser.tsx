import {
  Alert,
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
import { notifications } from '@mantine/notifications';
import { AlertCircle, ArrowLeft, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService, type Property } from '../../services/propertyService';
import {
  userService,
  type CreateUserRequest,
} from '../../services/userService';

interface CreateUserFormValues {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  user_type: string;
  property_id: string;
}

export function CreateUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const form = useForm({
    initialValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      user_type: 'STAFF',
      property_id: '',
    },
    validate: {
      full_name: (value) => (value ? null : 'Full name is required'),
      email: (value) =>
        value && !/^\S+@\S+$/.test(value) ? 'Invalid email' : null,
      password: (value) =>
        !value
          ? 'Password is required'
          : value.length < 6
          ? 'Password must be at least 6 characters'
          : null,
      phone: (value) =>
        !value
          ? null
          : /^\d{10}$/.test(value)
          ? null
          : 'Phone must be 10 digits',
      user_type: (value) => (value ? null : 'User type is required'),
    },
  });

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setPropertiesLoading(true);
        const response = await propertyService.getProperties();
        setProperties(response.data.properties);
      } catch {
        // Handle error silently for now
      } finally {
        setPropertiesLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleSubmit = async (values: CreateUserFormValues) => {
    try {
      setLoading(true);
      setError(null);

      // Convert form values to proper types for API
      const userData: CreateUserRequest = {
        full_name: values.full_name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        password: values.password,
        user_type: values.user_type as
          | 'MASTER_ADMIN'
          | 'PROPERTY_ADMIN'
          | 'STAFF',
        property_id: values.property_id
          ? parseInt(values.property_id)
          : undefined,
      };

      await userService.createUser(userData);

      notifications.show({
        title: 'Success',
        message: 'User created successfully',
        color: 'green',
      });

      navigate('/users');
    } catch {
      const errorMessage = 'Failed to create user. Please try again.';
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

  return (
    <Box p="xl">
      <LoadingOverlay visible={loading} />

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
            Create New User
          </Title>
        </Group>
        <Button
          leftSection={<ArrowLeft size={16} />}
          variant="outline"
          onClick={() => navigate('/users')}
        >
          Back to Users
        </Button>
      </Group>

      {/* Error Alert */}
      {error && (
        <Alert
          icon={<AlertCircle size="1rem" />}
          title="Error"
          color="red"
          mb="md"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}

      {/* Create User Form */}
      <Card shadow="sm" radius="xl" withBorder p="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl">
            <Text size="xl" fw={700} mb="md" color="dark.7">
              User Information
            </Text>

            {/* Personal Information Section */}
            <Box>
              <Text size="md" fw={600} mb="md" color="dark.6">
                Personal Details
              </Text>
              <Stack gap="md">
                <TextInput
                  label="Full Name"
                  placeholder="Enter full name"
                  required
                  size="md"
                  {...form.getInputProps('full_name')}
                />

                <Group grow>
                  <TextInput
                    label="Email"
                    placeholder="Enter email address"
                    type="email"
                    size="md"
                    {...form.getInputProps('email')}
                  />
                  <TextInput
                    label="Phone"
                    placeholder="Enter phone number"
                    size="md"
                    {...form.getInputProps('phone')}
                  />
                </Group>
              </Stack>
            </Box>

            {/* Account Information Section */}
            <Box>
              <Text size="md" fw={600} mb="md" color="dark.6">
                Account Settings
              </Text>
              <Stack gap="md">
                <TextInput
                  label="Password"
                  placeholder="Enter password"
                  type="password"
                  required
                  size="md"
                  {...form.getInputProps('password')}
                />

                <Group grow>
                  <Select
                    label="User Type"
                    placeholder="Select user type"
                    size="md"
                    data={[
                      { value: 'STAFF', label: 'Staff' },
                      { value: 'PROPERTY_ADMIN', label: 'Property Admin' },
                      { value: 'MASTER_ADMIN', label: 'Master Admin' },
                    ]}
                    required
                    {...form.getInputProps('user_type')}
                  />

                  <Select
                    label="Property"
                    placeholder={
                      propertiesLoading
                        ? 'Loading properties...'
                        : 'Select property'
                    }
                    size="md"
                    data={properties.map((property) => ({
                      value: property.id.toString(),
                      label: property.name,
                    }))}
                    disabled={propertiesLoading}
                    {...form.getInputProps('property_id')}
                  />
                </Group>
              </Stack>
            </Box>

            <Group justify="flex-end" mt="xl">
              <Button
                variant="outline"
                onClick={() => navigate('/users')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                leftSection={<Save size={16} />}
                loading={loading}
                style={{
                  background:
                    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                }}
              >
                Create User
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
