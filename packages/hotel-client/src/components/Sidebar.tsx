import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PermissionService } from '../services/permissions';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  enabled: boolean;
  badge?: string;
  color: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navigationItems = PermissionService.getNavigationItems(user);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  // Simplified menu items - cleaner and easier to understand
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      enabled: true,
      color: '#3b82f6',
    },
    {
      id: 'rooms',
      title: 'Rooms',
      path: '/rooms',
      icon: '🏠',
      enabled:
        navigationItems.find((item) => item.id === 'rooms')?.enabled || false,
      color: '#10b981',
    },
    {
      id: 'bookings',
      title: 'Bookings',
      path: '/bookings',
      icon: '📅',
      enabled:
        navigationItems.find((item) => item.id === 'bookings')?.enabled ||
        false,
      badge: '12',
      color: '#f59e0b',
    },
    {
      id: 'users',
      title: 'Staff',
      path: '/users',
      icon: '👥',
      enabled:
        navigationItems.find((item) => item.id === 'users')?.enabled || false,
      color: '#8b5cf6',
    },
    {
      id: 'roles',
      title: 'Roles',
      path: '/roles',
      icon: '🔐',
      enabled:
        navigationItems.find((item) => item.id === 'roles')?.enabled || false,
      color: '#ef4444',
    },
    {
      id: 'reports',
      title: 'Reports',
      path: '/reports',
      icon: '📈',
      enabled:
        navigationItems.find((item) => item.id === 'reports')?.enabled || false,
      color: '#06b6d4',
    },
    {
      id: 'settings',
      title: 'Settings',
      path: '/settings',
      icon: '⚙️',
      enabled:
        navigationItems.find((item) => item.id === 'settings')?.enabled ||
        false,
      color: '#64748b',
    },
  ];

  const renderMenuItem = (item: MenuItem) => {
    if (!item.enabled) return null;

    const isActive = location.pathname === item.path;

    return (
      <Link
        key={item.id}
        to={item.path}
        className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
        title={!isOpen ? item.title : ''}
      >
        <div className="nav-icon" style={{ color: item.color }}>
          {item.icon}
        </div>
        {isOpen && (
          <div className="nav-content">
            <span className="nav-text">{item.title}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        )}
        {isActive && <div className="nav-indicator" />}
      </Link>
    );
  };

  return (
    <div
      className={`modern-sidebar ${
        isOpen ? 'modern-sidebar--open' : 'modern-sidebar--closed'
      }`}
    >
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}

      {/* Header Section */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon">
              <span role="img" aria-label="Hotel">
                🏨
              </span>
            </div>
            {isOpen && <span className="brand-text">Hotel MS</span>}
          </div>
        </div>

        <button
          className="sidebar-toggle"
          onClick={onToggle}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d={isOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* User Profile Section */}
      <div className="user-profile">
        <div className="user-avatar">
          <div className="avatar-image">
            {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="user-status"></div>
        </div>

        {isOpen && (
          <div className="user-info">
            <div className="user-name">{user.full_name || user.email}</div>
            <div className="user-role">
              {user.roles?.map((role) => role.name).join(', ') || 'No role'}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-navigation">
        <div className="nav-menu">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="sidebar-footer">
        <button
          className="logout-button"
          onClick={handleLogout}
          title="Sign out"
        >
          <div className="menu-item-content">
            <div className="menu-item-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {isOpen && <span className="menu-item-text">Sign Out</span>}
          </div>
        </button>
      </div>
    </div>
  );
};
