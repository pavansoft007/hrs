import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title = 'Hotel Management System',
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <button
          className="menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <span role="img" aria-label="Menu">
            ☰
          </span>
        </button>
        <div className="header-title">
          <h1>{title}</h1>
          <div className="current-time">{getCurrentTime()}</div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-info">
          <div className="notifications">
            <button className="notification-btn" aria-label="Notifications">
              <span role="img" aria-label="Bell">
                🔔
              </span>
              <span className="notification-badge">3</span>
            </button>
          </div>

          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                <span role="img" aria-label="User">
                  👤
                </span>
              </div>
              <div className="user-details">
                <div className="user-name">{user?.full_name}</div>
                <div className="user-property">
                  Property ID: {user?.property_id}
                </div>
              </div>
            </div>

            <div className="user-actions">
              <button
                className="profile-btn"
                onClick={() => navigate('/profile')}
                aria-label="View profile"
              >
                <span role="img" aria-label="Settings">
                  ⚙️
                </span>
              </button>

              <button
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <span role="img" aria-label="Logout">
                  🚪
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
