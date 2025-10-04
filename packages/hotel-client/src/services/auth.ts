import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api'; // Server is running on port 5002

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  user_type: string;
  property_id: number;
  roles: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  last_login?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export class AuthService {
  private static ACCESS_TOKEN_KEY = 'hotel_access_token';
  private static REFRESH_TOKEN_KEY = 'hotel_refresh_token';
  private static USER_KEY = 'hotel_user';
  private static refreshAttempts = 0;
  private static maxRefreshAttempts = 3;

  // Configure axios defaults
  static {
    axios.defaults.baseURL = API_BASE_URL;

    // Add token to requests automatically
    axios.interceptors.request.use((config) => {
      const token = AuthService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops by checking if this is already a retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = AuthService.getRefreshToken();

          // Skip refresh for login/register endpoints to prevent loops
          if (
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh')
          ) {
            return Promise.reject(error);
          }

          if (refreshToken) {
            try {
              // Check if we've exceeded max refresh attempts
              if (
                AuthService.refreshAttempts >= AuthService.maxRefreshAttempts
              ) {
                console.error('Maximum refresh attempts exceeded');
                AuthService.clearAuthData();
                AuthService.refreshAttempts = 0;
                window.location.href = '/login';
                return Promise.reject(
                  new Error('Maximum refresh attempts exceeded')
                );
              }

              AuthService.refreshAttempts++;

              await AuthService.refreshToken();

              // Reset attempts on successful refresh
              AuthService.refreshAttempts = 0;

              // Retry the original request with new token
              const newToken = AuthService.getAccessToken();
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);
              }
            } catch (refreshError) {
              console.error(
                `Token refresh failed (attempt ${AuthService.refreshAttempts}):`,
                refreshError
              );

              // If max attempts reached, clear everything and redirect
              if (
                AuthService.refreshAttempts >= AuthService.maxRefreshAttempts
              ) {
                AuthService.clearAuthData();
                AuthService.refreshAttempts = 0;
                window.location.href = '/login';
              }

              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token, redirect to login
            AuthService.clearAuthData();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Login user - only allows hotel property users
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        '/auth/login',
        credentials
      );

      if (response.data.success) {
        const { user, tokens } = response.data.data;

        // Verify user belongs to a hotel property
        if (user.user_type === 'MASTER_ADMIN') {
          throw new Error('Master Admin should use the Master Admin portal');
        }

        // Store authentication data
        AuthService.setTokens(tokens.accessToken, tokens.refreshToken);
        AuthService.setUser(user);

        // Reset refresh attempts on successful login
        AuthService.refreshAttempts = 0;
      } else {
        // Handle server response with success: false
        throw new Error(response.data.message || 'Login failed');
      }

      return response.data;
    } catch (error: unknown) {
      // Handle axios errors with response data
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              success?: boolean;
              message?: string;
            };
            status?: number;
          };
        };

        // If the server responded with an error message, use it
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }

        // Handle specific HTTP status codes
        const status = axiosError.response?.status;
        if (status === 401) {
          throw new Error('Invalid email or password');
        }

        if (status === 403) {
          throw new Error('Access denied. Contact your administrator.');
        }

        if (status && status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
      }

      // Handle other error types
      if (error instanceof Error && error.message) {
        throw new Error(error.message);
      }

      throw new Error('Login failed. Please check your network connection.');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<void> {
    const refreshToken = AuthService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Create a new axios instance to avoid interceptor interference
      const refreshAxios = axios.create({
        baseURL: API_BASE_URL,
      });

      const response = await refreshAxios.post<AuthResponse>('/auth/refresh', {
        refreshToken: refreshToken,
      });

      if (response.data.success && response.data.data?.tokens) {
        const { tokens } = response.data.data;
        AuthService.setTokens(tokens.accessToken, tokens.refreshToken);
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error) {
      // Clear tokens on refresh failure
      AuthService.clearAuthData();
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    // Clear auth data immediately to prevent refresh loops
    const refreshToken = AuthService.getRefreshToken();
    AuthService.clearAuthData();

    try {
      // Only attempt server logout if we have a refresh token
      if (refreshToken) {
        await axios.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Continue with logout even if server request fails
      console.error('Logout request failed:', error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    const response = await axios.get<{
      success: boolean;
      data: { user: User };
    }>('/auth/profile');

    if (response.data.success) {
      const user = response.data.data.user;
      AuthService.setUser(user);
      return user;
    } else {
      throw new Error('Failed to fetch profile');
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const response = await axios.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Password change failed');
    }
  }

  // Token management
  static getAccessToken(): string | null {
    return localStorage.getItem(AuthService.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(AuthService.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(AuthService.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(AuthService.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
    localStorage.removeItem(AuthService.REFRESH_TOKEN_KEY);
  }

  // User management
  static getUser(): User | null {
    const userStr = localStorage.getItem(AuthService.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
  }

  static clearUser(): void {
    localStorage.removeItem(AuthService.USER_KEY);
  }

  static clearAuthData(): void {
    AuthService.clearTokens();
    AuthService.clearUser();
  }

  // Authentication status
  static isAuthenticated(): boolean {
    const token = AuthService.getAccessToken();
    const user = AuthService.getUser();
    return !!(token && user);
  }

  // Check if user belongs to hotel property
  static isHotelUser(): boolean {
    const user = AuthService.getUser();
    return user?.user_type !== 'MASTER_ADMIN';
  }
}
