import React, { useState, useEffect } from 'react';
import { HotelService, HotelStats, Property } from '../services/hotelService';
import { PermissionService } from '../services/permissions';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from './Layout';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, logout, refreshProfile } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [stats, setStats] = useState<HotelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

    const loadUserData = async () => {
      try {
        // Refresh user profile to ensure we have latest data
        await refreshProfile();

        // Load property and stats data
        await loadHotelData();
      } catch (error) {
        console.error('Failed to load user data:', error);
        // If token is invalid, redirect to login
        await logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    // Only load data once when component mounts
    loadUserData();
  }, [navigate, logout, refreshProfile]); // These are now memoized with useCallback

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
    <Layout title="Dashboard">
      {/* Enhanced Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-grid">
          <div className="user-greeting">
            <div className="greeting-text">
              <h1>Welcome back, {user.full_name}!</h1>
              <p className="user-summary">
                {roleInfo.primaryRole} •{' '}
                {property?.name || 'Loading property...'}
              </p>
              <div className="user-badges">
                <span
                  className={`access-badge ${roleInfo.accessLevel.toLowerCase()}`}
                >
                  {roleInfo.accessLevel} Access
                </span>
                <span className="property-badge">
                  Property ID: {user.property_id}
                </span>
              </div>
            </div>
          </div>

          <div className="quick-stats">
            {statsLoading ? (
              <div className="loading-mini">
                <div className="spinner-small"></div>
                <span>Loading stats...</span>
              </div>
            ) : stats ? (
              <div className="mini-stats-grid">
                <div className="mini-stat">
                  <span className="mini-stat-value">{stats.total_rooms}</span>
                  <span className="mini-stat-label">Total Rooms</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-value">
                    {stats.occupied_rooms}
                  </span>
                  <span className="mini-stat-label">Occupied</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-value">
                    ₹{(stats.revenue_today / 1000).toFixed(0)}K
                  </span>
                  <span className="mini-stat-label">Today's Revenue</span>
                </div>
              </div>
            ) : (
              <div className="stats-error">
                <span>Unable to load stats</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Enhanced Hotel Statistics */}
        {statsLoading ? (
          <div className="content-card loading-card">
            <div className="loading-content">
              <div className="spinner"></div>
              <h3>Loading Hotel Statistics</h3>
              <p>
                Fetching real-time data from your hotel management system...
              </p>
            </div>
          </div>
        ) : stats ? (
          <div className="stats-section">
            <div className="section-header">
              <h2>Real-time Hotel Analytics</h2>
              <p>Live data from your property management system</p>
            </div>

            <div className="enhanced-stats-grid">
              {/* Room Status Card */}
              <div className="stat-card rooms-overview">
                <div className="card-header">
                  <div className="card-icon rooms-icon">
                    <span role="img" aria-label="Rooms">
                      🏠
                    </span>
                  </div>
                  <div className="card-title">
                    <h3>Room Status</h3>
                    <p>Current occupancy overview</p>
                  </div>
                </div>
                <div className="card-content">
                  <div className="primary-metric">
                    <span className="metric-value">{stats.total_rooms}</span>
                    <span className="metric-label">Total Rooms</span>
                  </div>
                  <div className="metrics-breakdown">
                    <div className="metric-item available">
                      <span className="metric-count">
                        {stats.available_rooms}
                      </span>
                      <span className="metric-text">Available</span>
                      <div className="metric-progress">
                        <div
                          className="progress-fill available"
                          style={{
                            width: `${
                              (stats.available_rooms / stats.total_rooms) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="metric-item occupied">
                      <span className="metric-count">
                        {stats.occupied_rooms}
                      </span>
                      <span className="metric-text">Occupied</span>
                      <div className="metric-progress">
                        <div
                          className="progress-fill occupied"
                          style={{
                            width: `${
                              (stats.occupied_rooms / stats.total_rooms) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    {stats.maintenance_rooms > 0 && (
                      <div className="metric-item maintenance">
                        <span className="metric-count">
                          {stats.maintenance_rooms}
                        </span>
                        <span className="metric-text">Maintenance</span>
                        <div className="metric-progress">
                          <div
                            className="progress-fill maintenance"
                            style={{
                              width: `${
                                (stats.maintenance_rooms / stats.total_rooms) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="occupancy-rate">
                    <span className="rate-label">Occupancy Rate</span>
                    <span className="rate-value">
                      {Math.round(
                        (stats.occupied_rooms / stats.total_rooms) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Bookings Card */}
              <div className="stat-card bookings-overview">
                <div className="card-header">
                  <div className="card-icon bookings-icon">
                    <span role="img" aria-label="Bookings">
                      📅
                    </span>
                  </div>
                  <div className="card-title">
                    <h3>Bookings</h3>
                    <p>Reservation management</p>
                  </div>
                </div>
                <div className="card-content">
                  <div className="primary-metric">
                    <span className="metric-value">{stats.total_bookings}</span>
                    <span className="metric-label">Total Bookings</span>
                  </div>
                  <div className="booking-status">
                    <div className="status-item pending">
                      <div className="status-indicator pending"></div>
                      <span className="status-count">
                        {stats.pending_bookings}
                      </span>
                      <span className="status-text">Pending Confirmation</span>
                    </div>
                    <div className="status-item confirmed">
                      <div className="status-indicator confirmed"></div>
                      <span className="status-count">
                        {stats.total_bookings - stats.pending_bookings}
                      </span>
                      <span className="status-text">Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Card */}
              <div className="stat-card revenue-overview">
                <div className="card-header">
                  <div className="card-icon revenue-icon">
                    <span role="img" aria-label="Revenue">
                      💰
                    </span>
                  </div>
                  <div className="card-title">
                    <h3>Revenue</h3>
                    <p>Financial performance</p>
                  </div>
                </div>
                <div className="card-content">
                  <div className="revenue-today">
                    <span className="revenue-label">Today's Revenue</span>
                    <span className="revenue-amount">
                      ₹{stats.revenue_today.toLocaleString()}
                    </span>
                  </div>
                  <div className="revenue-monthly">
                    <span className="monthly-label">This Month</span>
                    <span className="monthly-amount">
                      ₹{stats.revenue_this_month.toLocaleString()}
                    </span>
                    <div className="monthly-progress">
                      <div
                        className="progress-fill revenue"
                        style={{
                          width: `${Math.min(
                            (stats.revenue_today /
                              (stats.revenue_this_month / 30)) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="revenue-avg">
                    <span className="avg-label">Daily Average</span>
                    <span className="avg-value">
                      ₹
                      {Math.round(
                        stats.revenue_this_month / 30
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="content-card error-card">
            <div className="error-content">
              <div className="error-icon">
                <span role="img" aria-label="Warning">
                  ⚠️
                </span>
              </div>
              <h3>Unable to Load Statistics</h3>
              <p>
                There was an error fetching hotel data. Please check your
                connection and try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Retry Loading
              </button>
            </div>
          </div>
        )}

        <div className="dashboard-secondary-grid">
          {/* Enhanced Property Information */}
          <div className="content-card property-card">
            <div className="content-card-header">
              <h2 className="content-card-title">
                <span role="img" aria-label="Building">
                  🏢
                </span>
                Property Information
              </h2>
              {property && (
                <span
                  className={`property-status-badge ${
                    property.is_active ? 'active' : 'inactive'
                  }`}
                >
                  {property.is_active ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
            <div className="content-card-body">
              {property ? (
                <div className="property-details-grid">
                  <div className="property-main-info">
                    <div className="property-identity">
                      <h3 className="property-name">{property.name}</h3>
                      <span className="property-code">#{property.code}</span>
                      <span
                        className={`type-badge ${property.property_type.toLowerCase()}`}
                      >
                        {property.property_type}
                      </span>
                    </div>
                  </div>

                  <div className="property-contact-grid">
                    <div className="contact-item">
                      <span className="contact-icon">
                        <span role="img" aria-label="Location">
                          📍
                        </span>
                      </span>
                      <div className="contact-details">
                        <strong>Address</strong>
                        <div className="address-lines">
                          <p>{property.address_line1}</p>
                          {property.address_line2 && (
                            <p>{property.address_line2}</p>
                          )}
                          <p>
                            {property.city}, {property.state}
                          </p>
                          <p>
                            {property.country} - {property.postal_code}
                          </p>
                        </div>
                      </div>
                    </div>

                    {property.phone && (
                      <div className="contact-item">
                        <span className="contact-icon">
                          <span role="img" aria-label="Phone">
                            📞
                          </span>
                        </span>
                        <div className="contact-details">
                          <strong>Phone</strong>
                          <p>
                            <a
                              href={`tel:${property.phone}`}
                              className="contact-link"
                            >
                              {property.phone}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {property.email && (
                      <div className="contact-item">
                        <span className="contact-icon">
                          <span role="img" aria-label="Email">
                            📧
                          </span>
                        </span>
                        <div className="contact-details">
                          <strong>Email</strong>
                          <p>
                            <a
                              href={`mailto:${property.email}`}
                              className="contact-link"
                            >
                              {property.email}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {property.website && (
                      <div className="contact-item">
                        <span className="contact-icon">
                          <span role="img" aria-label="Website">
                            🌐
                          </span>
                        </span>
                        <div className="contact-details">
                          <strong>Website</strong>
                          <p>
                            <a
                              href={property.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="contact-link"
                            >
                              Visit Website
                            </a>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="loading-placeholder">
                  <div className="spinner-small"></div>
                  <span>Loading property information...</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="content-card quick-actions-card">
            <div className="content-card-header">
              <h2 className="content-card-title">
                <span role="img" aria-label="Lightning">
                  ⚡
                </span>
                Quick Actions
              </h2>
              <span className="actions-count">
                {navigationItems.filter((item) => item.enabled).length}{' '}
                available
              </span>
            </div>
            <div className="content-card-body">
              <div className="enhanced-actions-grid">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    className={`enhanced-action-button ${
                      item.enabled ? 'enabled' : 'disabled'
                    }`}
                    onClick={() => item.enabled && navigate(item.path)}
                    disabled={!item.enabled}
                    title={
                      item.enabled
                        ? `Go to ${item.title}`
                        : 'No permission for this action'
                    }
                  >
                    <div className="action-icon-wrapper">
                      <span
                        className="action-icon"
                        role="img"
                        aria-label={item.title}
                      >
                        {item.icon}
                      </span>
                    </div>
                    <div className="action-content">
                      <span className="action-title">{item.title}</span>
                      {!item.enabled && (
                        <span className="permission-notice">
                          <span role="img" aria-label="Lock">
                            🔒
                          </span>
                          No access
                        </span>
                      )}
                    </div>
                    {item.enabled && (
                      <div className="action-arrow">
                        <span role="img" aria-label="Arrow">
                          →
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
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
      </div>
    </Layout>
  );
};
