import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  LoadingOverlay,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { HiArrowRight, HiLockClosed, HiMail } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../store';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validation
    let isValid = true;

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!isValid) return;

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      if (result.user) {
        // Navigation will be handled by the useEffect hook above
      }
    } catch {
      // Error is handled by Redux state
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: '#fafbfc',
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
              'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
          }}
        />
        <Stack align="center" gap="xl" style={{ zIndex: 1 }}>
          <Text size="4rem" fw={800} ta="center" lh={1.1} c="white">
            HMS
          </Text>
          <Text size="xl" fw={500} ta="center" c="rgba(255, 255, 255, 0.95)">
            Hotel & Restaurant Management System
          </Text>
          <Text size="md" ta="center" c="rgba(255, 255, 255, 0.8)" maw={400}>
            Streamline your hospitality operations with our comprehensive
            management platform
          </Text>
        </Stack>
      </Flex>

      {/* Right Side - Login Form */}
      <Flex
        direction="column"
        justify="center"
        style={{
          flex: 1,
          padding: '2rem',
          maxWidth: '500px',
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
                Welcome back
              </Text>
              <Text size="md" c="#6b7280">
                Sign in to your account to continue
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
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="xl">
                <TextInput
                  leftSection={<HiMail size={20} color="#667eea" />}
                  placeholder="Enter your email (admin@hms.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                  size="lg"
                  radius="xl"
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
                  leftSection={<HiLockClosed size={20} color="#667eea" />}
                  placeholder="Enter your password (admin123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                  size="lg"
                  radius="xl"
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
                  Sign in
                </Button>
              </Stack>
            </form>

            <Divider label="or" labelPosition="center" color="#e5e7eb" />

            <Center>
              <Text size="sm" c="#6b7280">
                Don't have an account?{' '}
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
                  onClick={() => navigate('/register')}
                >
                  Create account
                </Text>
              </Text>
            </Center>
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
}

export default Login;
