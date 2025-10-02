import React, { useState, useEffect } from 'react';
import { AuthService, User } from '../services/auth';
import { HotelService, HotelStats, Property } from '../services/hotelService';
import { PermissionService } from '../services/permissions';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [stats, setStats] = useState<HotelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user from localStorage first for immediate display
        const cachedUser = AuthService.getUser();
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Then fetch fresh data from server
        const freshUser = await AuthService.getProfile();
        setUser(freshUser);

        // Load property and stats data
        await loadHotelData();
      } catch (error) {
        console.error('Failed to load user data:', error);
        // If token is invalid, redirect to login
        await AuthService.logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    const loadHotelData = async () => {
      try {
        setStatsLoading(true);

        // Load property details and stats in parallel
        const [propertyData, statsData] = await Promise.all([
          HotelService.getPropertyDetails(),
          HotelService.getHotelStats(),
        ]);

        setProperty(propertyData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load hotel data:', error);
        // Don't redirect on hotel data failure, just show error state
      } finally {
        setStatsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if server request fails
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>Unable to load user data.</p>
          <button onClick={() => navigate('/login')}>Return to Login</button>
        </div>
      </div>
    );
  }

  // Get user permissions and role info
  const userPermissions = PermissionService.getUserPermissions(user);
  const roleInfo = PermissionService.getUserRoleInfo(user);
  const navigationItems = PermissionService.getNavigationItems(user);
  const roomPermissions = PermissionService.canManageRooms(user);
  const bookingPermissions = PermissionService.canManageBookings(user);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h1>Welcome back, {user.full_name}!</h1>
            <p>
              {roleInfo.primaryRole} •{' '}
              {property?.name || `Property ID: ${user.property_id}`}
            </p>
            <div className="access-level">
              <span
                className={`access-badge ${roleInfo.accessLevel.toLowerCase()}`}
              >
                {roleInfo.accessLevel} Access
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Hotel Statistics */}
        {statsLoading ? (
          <div className="stats-loading">
            <div className="spinner"></div>
            <p>Loading hotel statistics...</p>
          </div>
        ) : (
          stats && (
            <div className="stats-grid">
              <div className="stat-card rooms-stat">
                <div className="stat-icon" role="img" aria-label="Rooms">
                  🏠
                </div>
                <div className="stat-content">
                  <h3>Rooms</h3>
                  <div className="stat-number">{stats.total_rooms}</div>
                  <div className="stat-breakdown">
                    <span className="available">
                      Available: {stats.available_rooms}
                    </span>
                    <span className="occupied">
                      Occupied: {stats.occupied_rooms}
                    </span>
                    {stats.maintenance_rooms > 0 && (
                      <span className="maintenance">
                        Maintenance: {stats.maintenance_rooms}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="stat-card bookings-stat">
                <div className="stat-icon" role="img" aria-label="Bookings">
                  📅
                </div>
                <div className="stat-content">
                  <h3>Bookings</h3>
                  <div className="stat-number">{stats.total_bookings}</div>
                  <div className="stat-breakdown">
                    <span className="pending">
                      Pending: {stats.pending_bookings}
                    </span>
                  </div>
                </div>
              </div>

              <div className="stat-card revenue-stat">
                <div className="stat-icon" role="img" aria-label="Revenue">
                  💰
                </div>
                <div className="stat-content">
                  <h3>Revenue</h3>
                  <div className="stat-number">
                    ₹{stats.revenue_today.toLocaleString()}
                  </div>
                  <div className="stat-breakdown">
                    <span className="period">Today</span>
                    <span className="monthly">
                      This Month: ₹{stats.revenue_this_month.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        <div className="dashboard-grid">
          {/* Property Information */}
          <div className="dashboard-card property-info">
            <h2>Property Information</h2>
            {property ? (
              <div className="property-details">
                <div className="info-item">
                  <label>Property Name:</label>
                  <span>{property.name}</span>
                </div>
                <div className="info-item">
                  <label>Property Code:</label>
                  <span>{property.code}</span>
                </div>
                <div className="info-item">
                  <label>Type:</label>
                  <span className="property-type">
                    {property.property_type}
                  </span>
                </div>
                <div className="info-item">
                  <label>Location:</label>
                  <span>
                    {property.city}, {property.state}
                  </span>
                </div>
                <div className="info-item">
                  <label>Contact:</label>
                  <span>{property.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span
                    className={`status ${
                      property.is_active ? 'active' : 'inactive'
                    }`}
                  >
                    {property.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ) : (
              <p>Loading property information...</p>
            )}
          </div>

          {/* Role-based Quick Actions */}
          <div className="dashboard-card quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  className={`action-button ${item.enabled ? '' : 'disabled'}`}
                  onClick={() => item.enabled && navigate(item.path)}
                  disabled={!item.enabled}
                >
                  <span
                    className="action-icon"
                    role="img"
                    aria-label={item.title}
                  >
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                  {!item.enabled && <small>No permission</small>}
                </button>
              ))}
            </div>
          </div>

          {/* User Profile & Permissions */}
          <div className="dashboard-card user-profile">
            <h2>Your Profile & Access</h2>
            <div className="profile-info">
              <div className="info-item">
                <label>Full Name:</label>
                <span>{user.full_name}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Primary Role:</label>
                <span className="user-type">{roleInfo.primaryRole}</span>
              </div>
              <div className="info-item">
                <label>Access Level:</label>
                <span
                  className={`access-level ${roleInfo.accessLevel.toLowerCase()}`}
                >
                  {roleInfo.accessLevel}
                </span>
              </div>
              <div className="info-item">
                <label>Permissions:</label>
                <div className="permissions-list">
                  {userPermissions.slice(0, 5).map((permission) => (
                    <span key={permission} className="permission-tag">
                      {permission.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {userPermissions.length > 5 && (
                    <span className="permission-tag more">
                      +{userPermissions.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Operations Summary */}
          <div className="dashboard-card operations-summary">
            <h2>Your Operations Access</h2>
            <div className="operations-grid">
              <div className="operation-item">
                <h4>Room Management</h4>
                <div className="operation-permissions">
                  <span
                    className={roomPermissions.canView ? 'allowed' : 'denied'}
                  >
                    View: {roomPermissions.canView ? '✓' : '✗'}
                  </span>
                  <span
                    className={roomPermissions.canCreate ? 'allowed' : 'denied'}
                  >
                    Create: {roomPermissions.canCreate ? '✓' : '✗'}
                  </span>
                  <span
                    className={roomPermissions.canEdit ? 'allowed' : 'denied'}
                  >
                    Edit: {roomPermissions.canEdit ? '✓' : '✗'}
                  </span>
                  <span
                    className={roomPermissions.canDelete ? 'allowed' : 'denied'}
                  >
                    Delete: {roomPermissions.canDelete ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              <div className="operation-item">
                <h4>Booking Management</h4>
                <div className="operation-permissions">
                  <span
                    className={
                      bookingPermissions.canView ? 'allowed' : 'denied'
                    }
                  >
                    View: {bookingPermissions.canView ? '✓' : '✗'}
                  </span>
                  <span
                    className={
                      bookingPermissions.canCreate ? 'allowed' : 'denied'
                    }
                  >
                    Create: {bookingPermissions.canCreate ? '✓' : '✗'}
                  </span>
                  <span
                    className={
                      bookingPermissions.canCheckIn ? 'allowed' : 'denied'
                    }
                  >
                    Check-in: {bookingPermissions.canCheckIn ? '✓' : '✗'}
                  </span>
                  <span
                    className={
                      bookingPermissions.canCheckOut ? 'allowed' : 'denied'
                    }
                  >
                    Check-out: {bookingPermissions.canCheckOut ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
