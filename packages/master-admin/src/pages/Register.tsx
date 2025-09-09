import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  LoadingOverlay,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useState } from 'react';
import {
  HiArrowRight,
  HiLockClosed,
  HiMail,
  HiPhone,
  HiUser,
  HiUserGroup,
} from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../store';

export function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    user_type: 'STAFF' as 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF',
  });

  const [errors, setErrors] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });

    // Validation
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
      isValid = false;
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await dispatch(
        register({
          full_name: formData.full_name.trim(),
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          user_type: formData.user_type,
        }),
      ).unwrap();

      if (result.user) {
        navigate('/login', {
          state: { message: 'Registration successful! Please sign in.' },
        });
      }
    } catch {
      // Error is handled by Redux state
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
      }}
    >
      {/* Left Side - Branding */}
      <Flex
        direction="column"
        justify="center"
        align="center"
        style={{
          flex: 1,
          background:
            'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          color: 'white',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
        visibleFrom="sm"
      >
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
          }}
        />
        <Stack align="center" gap="xl" style={{ zIndex: 1 }}>
          <Text size="4rem" fw={800} ta="center" lh={1.1} c="white">
            Join HMS
          </Text>
          <Text size="xl" fw={500} ta="center" c="rgba(255, 255, 255, 0.95)">
            Start Managing Your Business
          </Text>
          <Text size="md" ta="center" c="rgba(255, 255, 255, 0.8)" maw={400}>
            Create your account and unlock powerful tools for hotel and
            restaurant management
          </Text>
        </Stack>
      </Flex>

      {/* Right Side - Register Form */}
      <Flex
        direction="column"
        justify="center"
        style={{
          flex: 1,
          padding: '2rem',
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box pos="relative">
          <LoadingOverlay
            visible={isLoading}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />

          <Stack gap="2rem">
            <Stack gap="sm">
              <Text size="2.5rem" fw={700} c="#2d1b69">
                Create account
              </Text>
              <Text size="md" c="#6b7280">
                Enter your details to get started
              </Text>
            </Stack>

            {error && (
              <Alert
                color="red"
                variant="light"
                radius="lg"
                style={{
                  border: '1px solid #fecaca',
                  backgroundColor: '#fef2f2',
                }}
              >
                {error}
                {error.includes(
                  'Authentication required for user registration',
                ) && (
                  <Box mt="sm">
                    <Text size="sm" c="#6b7280">
                      A Master Administrator already exists in the system.
                      Please:
                    </Text>
                    <ul
                      style={{
                        margin: '8px 0',
                        paddingLeft: '20px',
                        color: '#6b7280',
                        fontSize: '14px',
                      }}
                    >
                      <li>Login as the existing Master Admin first</li>
                      <li>
                        Then create new user accounts from the application
                      </li>
                      <li>Or contact your system administrator</li>
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      color="blue"
                      mt="sm"
                      onClick={() => navigate('/login')}
                    >
                      Go to Login
                    </Button>
                  </Box>
                )}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
                  <TextInput
                    leftSection={<HiUser size={18} color="#667eea" />}
                    placeholder="Full name"
                    value={formData.full_name}
                    onChange={(e) =>
                      handleInputChange('full_name', e.target.value)
                    }
                    error={errors.full_name}
                    size="lg"
                    radius="xl"
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        border: '2px solid #e5e7eb',
                        backgroundColor: 'white',
                        '&:focus': {
                          borderColor: '#667eea',
                          backgroundColor: 'white',
                          boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />
                  <TextInput
                    leftSection={<HiMail size={18} color="#667eea" />}
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    size="lg"
                    radius="xl"
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        border: '2px solid #e5e7eb',
                        backgroundColor: 'white',
                        '&:focus': {
                          borderColor: '#667eea',
                          backgroundColor: 'white',
                          boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />
                </Flex>

                <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
                  <TextInput
                    leftSection={<HiPhone size={18} color="#667eea" />}
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                    size="lg"
                    radius="xl"
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        border: '2px solid #e5e7eb',
                        backgroundColor: 'white',
                        '&:focus': {
                          borderColor: '#667eea',
                          backgroundColor: 'white',
                          boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />
                  <Select
                    leftSection={<HiUserGroup size={18} color="#667eea" />}
                    placeholder="Select role"
                    value={formData.user_type}
                    onChange={(value) =>
                      handleInputChange('user_type', value || 'STAFF')
                    }
                    data={[
                      { value: 'STAFF', label: 'Staff' },
                      { value: 'PROPERTY_ADMIN', label: 'Property Admin' },
                      { value: 'MASTER_ADMIN', label: 'Master Admin' },
                    ]}
                    size="lg"
                    radius="xl"
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        border: '2px solid #e5e7eb',
                        backgroundColor: 'white',
                        '&:focus': {
                          borderColor: '#667eea',
                          backgroundColor: 'white',
                          boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />
                </Flex>

                <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
                  <PasswordInput
                    leftSection={<HiLockClosed size={18} color="#667eea" />}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    error={errors.password}
                    size="lg"
                    radius="xl"
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        border: '2px solid #e5e7eb',
                        backgroundColor: 'white',
                        '&:focus': {
                          borderColor: '#667eea',
                          backgroundColor: 'white',
                          boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />
                  <PasswordInput
                    leftSection={<HiLockClosed size={18} color="#667eea" />}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    error={errors.confirmPassword}
                    size="lg"
                    radius="xl"
                    style={{ flex: 1 }}
                    styles={{
                      input: {
                        border: '2px solid #e5e7eb',
                        backgroundColor: 'white',
                        '&:focus': {
                          borderColor: '#667eea',
                          backgroundColor: 'white',
                          boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                        },
                      },
                    }}
                  />
                </Flex>

                <Button
                  type="submit"
                  size="lg"
                  radius="xl"
                  rightSection={<HiArrowRight size={20} />}
                  disabled={isLoading}
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    height: '56px',
                    fontWeight: 600,
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    },
                  }}
                >
                  Create account
                </Button>
              </Stack>
            </form>

            <Divider label="or" labelPosition="center" color="#e5e7eb" />

            <Center>
              <Text size="sm" c="#6b7280">
                Already have an account?{' '}
                <Text
                  component="button"
                  type="button"
                  fw={600}
                  c="#667eea"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': { color: '#5a67d8' },
                  }}
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </Text>
              </Text>
            </Center>
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
}

export default Register;
