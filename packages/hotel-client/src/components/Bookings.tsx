import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { useAuth } from '../contexts/AuthContext';
import { PermissionService } from '../services/permissions';
import './Bookings.css';

interface Booking {
  id: number;
  guest_name: string;
  email: string;
  phone: string;
  room_number: string;
  check_in_date: string;
  check_out_date: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  total_amount: number;
  booking_date: string;
}

export const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'confirmed' | 'checked_in'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');

  const permissions = user
    ? PermissionService.canManageBookings(user)
    : {
        canView: false,
        canCreate: false,
        canCheckIn: false,
        canCheckOut: false,
        canCancel: false,
      };

  useEffect(() => {
    if (permissions.canView) {
      loadBookings();
    } else {
      setLoading(false);
    }
  }, [permissions.canView]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockBookings: Booking[] = [
        {
          id: 1,
          guest_name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          room_number: '101',
          check_in_date: '2025-10-05',
          check_out_date: '2025-10-08',
          status: 'confirmed',
          total_amount: 15000,
          booking_date: '2025-10-02',
        },
        {
          id: 2,
          guest_name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1234567891',
          room_number: '102',
          check_in_date: '2025-10-03',
          check_out_date: '2025-10-06',
          status: 'checked_in',
          total_amount: 12000,
          booking_date: '2025-10-01',
        },
        {
          id: 3,
          guest_name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '+1234567892',
          room_number: '201',
          check_in_date: '2025-10-06',
          check_out_date: '2025-10-09',
          status: 'pending',
          total_amount: 18000,
          booking_date: '2025-10-02',
        },
      ];
      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Pending', icon: '⏳' },
      confirmed: { class: 'status-confirmed', text: 'Confirmed', icon: '✅' },
      checked_in: {
        class: 'status-checked-in',
        text: 'Checked In',
        icon: '🏠',
      },
      checked_out: {
        class: 'status-checked-out',
        text: 'Checked Out',
        icon: '🎯',
      },
      cancelled: { class: 'status-cancelled', text: 'Cancelled', icon: '❌' },
    };

    const config = statusConfig[status];
    return (
      <span className={`status-badge ${config.class}`}>
        <span role="img" aria-label={config.text}>
          {config.icon}
        </span>
        {config.text}
      </span>
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch =
      searchTerm === '' ||
      booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room_number.includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  if (!permissions.canView) {
    return (
      <Layout title="Bookings">
        <div className="no-permission">
          <div className="no-permission-icon">
            <span role="img" aria-label="No access">
              🔒
            </span>
          </div>
          <h2>Access Denied</h2>
          <p>
            You don't have permission to view bookings. Contact your
            administrator for access.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Booking Management">
      <div className="bookings-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Booking Management</h1>
            <p>Manage guest reservations and check-ins</p>
          </div>
          <div className="header-actions">
            {permissions.canCreate && (
              <button className="btn-primary">
                <span role="img" aria-label="Add">
                  ➕
                </span>
                New Booking
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="content-card">
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by guest name, email, or room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">
                <span role="img" aria-label="Search">
                  🔍
                </span>
              </span>
            </div>

            <div className="filter-buttons">
              {['all', 'pending', 'confirmed', 'checked_in'].map(
                (filterOption) => (
                  <button
                    key={filterOption}
                    className={`filter-btn ${
                      filter === filterOption ? 'active' : ''
                    }`}
                    onClick={() => setFilter(filterOption as typeof filter)}
                  >
                    {filterOption === 'all'
                      ? 'All Bookings'
                      : filterOption === 'checked_in'
                      ? 'Checked In'
                      : filterOption.charAt(0).toUpperCase() +
                        filterOption.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="content-card">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <span role="img" aria-label="No bookings">
                  📅
                </span>
              </div>
              <h3>No bookings found</h3>
              <p>
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No bookings have been made yet'}
              </p>
            </div>
          ) : (
            <div className="bookings-table">
              <div className="table-header">
                <div className="table-row header-row">
                  <div className="table-cell">Guest</div>
                  <div className="table-cell">Room</div>
                  <div className="table-cell">Dates</div>
                  <div className="table-cell">Status</div>
                  <div className="table-cell">Amount</div>
                  <div className="table-cell">Actions</div>
                </div>
              </div>

              <div className="table-body">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="table-row">
                    <div className="table-cell guest-info">
                      <div className="guest-name">{booking.guest_name}</div>
                      <div className="guest-contact">{booking.email}</div>
                      <div className="guest-contact">{booking.phone}</div>
                    </div>

                    <div className="table-cell room-info">
                      <div className="room-number">
                        Room {booking.room_number}
                      </div>
                    </div>

                    <div className="table-cell dates-info">
                      <div className="check-in">
                        <strong>In:</strong>{' '}
                        {new Date(booking.check_in_date).toLocaleDateString()}
                      </div>
                      <div className="check-out">
                        <strong>Out:</strong>{' '}
                        {new Date(booking.check_out_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="table-cell status-info">
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="table-cell amount-info">
                      <div className="amount">
                        ₹{booking.total_amount.toLocaleString()}
                      </div>
                    </div>

                    <div className="table-cell actions-info">
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          title="View Details"
                        >
                          <span role="img" aria-label="View">
                            👁️
                          </span>
                        </button>

                        {booking.status === 'confirmed' &&
                          permissions.canCheckIn && (
                            <button
                              className="action-btn checkin-btn"
                              title="Check In"
                            >
                              <span role="img" aria-label="Check In">
                                🏠
                              </span>
                            </button>
                          )}

                        {booking.status === 'checked_in' &&
                          permissions.canCheckOut && (
                            <button
                              className="action-btn checkout-btn"
                              title="Check Out"
                            >
                              <span role="img" aria-label="Check Out">
                                🎯
                              </span>
                            </button>
                          )}

                        {booking.status === 'pending' &&
                          permissions.canCancel && (
                            <button
                              className="action-btn cancel-btn"
                              title="Cancel Booking"
                            >
                              <span role="img" aria-label="Cancel">
                                ❌
                              </span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="content-grid-4">
          <div className="content-card stat-card">
            <div className="stat-header">
              <span className="stat-icon">
                <span role="img" aria-label="Calendar">
                  📅
                </span>
              </span>
              <h3>Total Bookings</h3>
            </div>
            <div className="stat-value">{bookings.length}</div>
          </div>

          <div className="content-card stat-card">
            <div className="stat-header">
              <span className="stat-icon">
                <span role="img" aria-label="Pending">
                  ⏳
                </span>
              </span>
              <h3>Pending</h3>
            </div>
            <div className="stat-value">
              {bookings.filter((b) => b.status === 'pending').length}
            </div>
          </div>

          <div className="content-card stat-card">
            <div className="stat-header">
              <span className="stat-icon">
                <span role="img" aria-label="House">
                  🏠
                </span>
              </span>
              <h3>Checked In</h3>
            </div>
            <div className="stat-value">
              {bookings.filter((b) => b.status === 'checked_in').length}
            </div>
          </div>

          <div className="content-card stat-card">
            <div className="stat-header">
              <span className="stat-icon">
                <span role="img" aria-label="Money">
                  💰
                </span>
              </span>
              <h3>Total Revenue</h3>
            </div>
            <div className="stat-value">
              ₹
              {bookings
                .reduce((sum, b) => sum + b.total_amount, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
