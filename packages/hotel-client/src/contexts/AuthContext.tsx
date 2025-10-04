import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AuthService, User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Update authentication state whenever user changes
  useEffect(() => {
    const authState = AuthService.isAuthenticated() && !!user;
    setIsAuthenticated(authState);
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const cachedUser = AuthService.getUser();
          if (cachedUser) {
            setUser(cachedUser);
            // Try to refresh profile in the background
            try {
              const freshUser = await AuthService.getProfile();
              setUser(freshUser);
            } catch {
              console.log('Could not refresh profile, using cached user');
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear auth data on error
        AuthService.clearAuthData();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await AuthService.login({ email, password });

      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setUser(null);
      throw error; // Re-throw so Login component can handle it
    } finally {
      setLoading(false);
    }
  }, []);
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const freshUser = await AuthService.getProfile();
      setUser(freshUser);
    } catch (error) {
      console.error('Profile refresh error:', error);
      // Create a scoped logout to avoid dependency cycle
      setLoading(true);
      try {
        await AuthService.logout();
      } catch (logoutError) {
        console.error('Logout error:', logoutError);
      } finally {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        refreshProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
