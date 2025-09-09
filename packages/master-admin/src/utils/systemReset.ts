import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

export const resetSystemForDevelopment = async (): Promise<boolean> => {
  try {
    // Only allow in development
    if (import.meta.env.PROD) {
      return false;
    }

    const response = await axios.post(`${API_BASE_URL}/auth/reset-system`, {
      confirm_reset: 'YES_DELETE_ALL_USERS',
    });

    if (response.data.success) {
      // Clear any stored tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      return true;
    }

    return false;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    // eslint-disable-next-line no-console
    console.error(
      'System reset failed:',
      apiError.response?.data?.message || apiError.message,
    );
    return false;
  }
};

// Add to window object for console access in development
if (!import.meta.env.PROD) {
  (
    window as unknown as { resetSystem: typeof resetSystemForDevelopment }
  ).resetSystem = resetSystemForDevelopment;
}
