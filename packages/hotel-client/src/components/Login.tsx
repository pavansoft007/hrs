import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/auth';
import './Login.css';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      const state = location.state as LocationState;
      const from = state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await AuthService.login(credentials);

      if (response.success) {
        // Redirect to intended page or dashboard
        const state = location.state as LocationState;
        const from = state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Hotel Portal</h1>
          <p>Sign in to access your hotel management system</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Having trouble accessing your account?
            <br />
            Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};
