import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  Loader,
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
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService, type Property } from '../../services/propertyService';
import {
  userService,
  type UpdateUserRequest,
  type User as UserType,
} from '../../services/userService';

interface EditUserFormValues {
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  property_id: string;
  is_active: boolean;
}

export function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  const form = useForm({
    initialValues: {
      full_name: '',
      email: '',
      phone: '',
      user_type: 'STAFF',
      property_id: '',
      is_active: true,
    },
    validate: {
      full_name: (value) => (value ? null : 'Full name is required'),
      email: (value) =>
        value && !/^\S+@\S+$/.test(value) ? 'Invalid email' : null,
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userData = await userService.getUserById(parseInt(id));
        setUser(userData);

        // Set form values
        form.setValues({
          full_name: userData.full_name,
          email: userData.email || '',
          phone: userData.phone || '',
          user_type: userData.user_type,
          property_id: userData.property_id
            ? userData.property_id.toString()
            : '',
          is_active: userData.is_active,
        });
      } catch {
        const errorMessage = 'Failed to load user details';
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

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const handleSubmit = async (values: EditUserFormValues) => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);

      // Convert form values to proper types for API
      const updateData: UpdateUserRequest = {
        full_name: values.full_name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        user_type: values.user_type as
          | 'MASTER_ADMIN'
          | 'PROPERTY_ADMIN'
          | 'STAFF',
        property_id: values.property_id
          ? parseInt(values.property_id)
          : undefined,
        is_active: values.is_active,
      };

      await userService.updateUser(parseInt(id), updateData);

      notifications.show({
        title: 'Success',
        message: 'User updated successfully',
        color: 'green',
      });

      navigate('/users');
    } catch {
      const errorMessage = 'Failed to update user. Please try again.';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error && !user) {
    return (
      <Box p="xl">
        <Alert
          icon={<AlertCircle size="1rem" />}
          title="Error"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
        <Button
          leftSection={<ArrowLeft size={16} />}
          variant="outline"
          onClick={() => navigate('/users')}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box p="xl">
      <LoadingOverlay visible={saving} />

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
            Edit User
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

      {/* Edit User Form */}
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

                <Checkbox
                  label="Active User"
                  description="Inactive users cannot log in to the system"
                  size="md"
                  {...form.getInputProps('is_active', { type: 'checkbox' })}
                />
              </Stack>
            </Box>

            <Group justify="flex-end" mt="xl">
              <Button
                variant="outline"
                onClick={() => navigate('/users')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                leftSection={<Save size={16} />}
                loading={saving}
                style={{
                  background:
                    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                }}
              >
                Update User
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
