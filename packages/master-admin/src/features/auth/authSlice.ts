import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import axios from 'axios';

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create a separate axios instance for auth operations to avoid interceptor conflicts
const authAxios = axios.create({
  baseURL: API_BASE_URL,
});

// Types
export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  user_type: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
  property_id?: number;
  is_active: boolean;
  last_login?: string;
  email_verified_at?: string;
  roles: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  user_type?: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
  property_id?: number;
}

// Error interface for type safety
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Configure axios defaults for the main instance
axios.defaults.baseURL = API_BASE_URL;

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAxios.post('/auth/login', credentials);
      const { user, tokens } = response.data.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // Set default authorization header for main axios instance
      axios.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;

      return { user, tokens };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const message = apiError?.response?.data?.message || 'Login failed';
      return rejectWithValue(message);
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authAxios.post('/auth/register', userData);
      const { user, tokens } = response.data.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // Set default authorization header for main axios instance
      axios.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;

      return { user, tokens };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const message =
        apiError?.response?.data?.message || 'Registration failed';
      return rejectWithValue(message);
    }
  },
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken =
        state.auth.refreshToken || localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAxios.post('/auth/refresh-token', {
        refreshToken,
      });
      const { tokens } = response.data.data;

      // Store new tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // Update authorization header for main axios instance
      axios.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;

      return tokens;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const message =
        apiError?.response?.data?.message || 'Token refresh failed';
      return rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    // Use main axios instance for logout (requires authentication)
    await axios.post('/auth/logout');
  } catch {
    // Ignore logout API errors, proceed with local logout
  } finally {
    // Always clear local data regardless of API call success
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common.Authorization;
  }
});

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      // Use main axios instance for profile (requires authentication)
      const response = await axios.get('/auth/profile');
      return response.data.data.user;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const message =
        apiError?.response?.data?.message || 'Failed to fetch profile';
      return rejectWithValue(message);
    }
  },
);

// Validate existing token and get user profile
export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found');
      }

      // Set token in axios header
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Try to get profile to validate token
      const response = await axios.get('/auth/profile');
      return response.data.data.user;
    } catch (error: unknown) {
      // Token is invalid, try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          await dispatch(refreshAccessToken()).unwrap();
          // After successful refresh, get profile again
          const response = await axios.get('/auth/profile');
          return response.data.data.user;
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          delete axios.defaults.headers.common.Authorization;
          const apiError = refreshError as ApiError;
          const message =
            apiError?.response?.data?.message || 'Session expired';
          return rejectWithValue(message);
        }
      } else {
        // No refresh token, clear everything
        localStorage.removeItem('accessToken');
        delete axios.defaults.headers.common.Authorization;
        const apiError = error as ApiError;
        const message = apiError?.response?.data?.message || 'Session expired';
        return rejectWithValue(message);
      }
    }
  },
);

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (token && refreshToken) {
        state.accessToken = token;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      } else {
        // Clear everything if tokens are missing
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common.Authorization;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Refresh Token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Don't clear authentication status on profile fetch failure
      })

      // Validate Token
      .addCase(validateToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(validateToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null; // Don't show error on token validation failure
      });
  },
});

export const { clearError, setTokens, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
