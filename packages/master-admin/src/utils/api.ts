import axios from 'axios';
import {
  initializeAuth,
  refreshAccessToken,
  validateToken,
} from '../features/auth/authSlice';
import { store } from '../store';

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken || localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const state = store.getState();
        const refreshToken =
          state.auth.refreshToken || localStorage.getItem('refreshToken');

        if (refreshToken) {
          await store.dispatch(refreshAccessToken()).unwrap();

          // Retry the original request with new token
          const newToken = store.getState().auth.accessToken;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } else {
          // No refresh token available, logout user
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common.Authorization;

        // Only redirect to login if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Setup axios interceptors function
export const setupAxiosInterceptors = () => {
  // Interceptors are already configured above
};

// Initialize authentication on app start
export const initializeApp = async () => {
  store.dispatch(initializeAuth());

  // If we have tokens, validate them by fetching user profile
  const state = store.getState();
  if (state.auth.accessToken) {
    try {
      await store.dispatch(validateToken()).unwrap();
    } catch {
      // Token validation failed, user will be redirected to login
      // Silent failure - no console log needed
    }
  }

  setupAxiosInterceptors();
};

export { axios };
export default axios;
