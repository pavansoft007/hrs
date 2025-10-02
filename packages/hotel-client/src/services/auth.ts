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
      access_token: string;
      refresh_token: string;
    };
  };
}

export class AuthService {
  private static ACCESS_TOKEN_KEY = 'hotel_access_token';
  private static REFRESH_TOKEN_KEY = 'hotel_refresh_token';
  private static USER_KEY = 'hotel_user';

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
        if (error.response?.status === 401) {
          const refreshToken = AuthService.getRefreshToken();
          if (refreshToken) {
            try {
              await AuthService.refreshToken();
              // Retry the original request
              return axios.request(error.config);
            } catch (refreshError) {
              AuthService.logout();
              window.location.href = '/login';
            }
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
        AuthService.setTokens(tokens.access_token, tokens.refresh_token);
        AuthService.setUser(user);
      }

      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && error.message) {
        throw new Error(error.message);
      }

      // Handle axios errors
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        throw new Error(axiosError.response?.data?.message || 'Login failed');
      }

      throw new Error('Login failed');
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

    const response = await axios.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.data.success) {
      const { tokens } = response.data.data;
      AuthService.setTokens(tokens.access_token, tokens.refresh_token);
    } else {
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if server request fails
      console.error('Logout request failed:', error);
    } finally {
      AuthService.clearAuthData();
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
