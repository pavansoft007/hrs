import React, { useState, useEffect } from 'react';
import { HotelService, Room } from '../services/hotelService';
import { AuthService } from '../services/auth';
import { PermissionService } from '../services/permissions';
import './RoomManagement.css';

export const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    room_type: '',
    floor: '',
  });

  const user = AuthService.getUser();
  const roomPermissions = user ? PermissionService.canManageRooms(user) : null;

  useEffect(() => {
    const loadRoomsWithFilters = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await HotelService.getRooms({
          ...filters,
          floor: filters.floor ? Number(filters.floor) : undefined,
        });

        setRooms(response.items);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load rooms';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadRoomsWithFilters();
  }, [filters]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await HotelService.getRooms({
        ...filters,
        floor: filters.floor ? Number(filters.floor) : undefined,
      });

      setRooms(response.items);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load rooms';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'status-available';
      case 'OCCUPIED':
        return 'status-occupied';
      case 'MAINTENANCE':
        return 'status-maintenance';
      case 'RESERVED':
        return 'status-reserved';
      default:
        return '';
    }
  };

  if (!user || !roomPermissions?.canView) {
    return (
      <div className="room-management">
        <div className="no-permission">
          <h2>Access Denied</h2>
          <p>You don't have permission to view room information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="room-management">
      <header className="room-header">
        <h1>Room Management</h1>
        <div className="room-actions">
          {roomPermissions.canCreate && (
            <button className="btn btn-primary" disabled>
              Add New Room
            </button>
          )}
          <button className="btn btn-secondary" onClick={loadRooms}>
            Refresh
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="room-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type-filter">Room Type:</label>
          <select
            id="type-filter"
            value={filters.room_type}
            onChange={(e) => handleFilterChange('room_type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="floor-filter">Floor:</label>
          <select
            id="floor-filter"
            value={filters.floor}
            onChange={(e) => handleFilterChange('floor', e.target.value)}
          >
            <option value="">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadRooms}>Try Again</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading rooms...</p>
        </div>
      )}

      {/* Rooms Grid */}
      {!loading && !error && (
        <div className="rooms-grid">
          {rooms.length === 0 ? (
            <div className="no-rooms">
              <p>No rooms found matching your criteria.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className={`room-card ${getStatusColor(room.status)}`}
              >
                <div className="room-header-card">
                  <h3>Room {room.room_number}</h3>
                  <span
                    className={`room-status ${getStatusColor(room.status)}`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="room-details">
                  <div className="room-info">
                    <span className="label">Type:</span>
                    <span className="value">{room.room_type}</span>
                  </div>

                  <div className="room-info">
                    <span className="label">Floor:</span>
                    <span className="value">{room.floor}</span>
                  </div>

                  <div className="room-info">
                    <span className="label">Capacity:</span>
                    <span className="value">{room.capacity} guests</span>
                  </div>

                  <div className="room-info">
                    <span className="label">Price:</span>
                    <span className="value price">
                      ₹{room.price_per_night}/night
                    </span>
                  </div>

                  <div className="room-amenities">
                    <span className="label">Amenities:</span>
                    <div className="amenities-list">
                      {room.amenities.map((amenity, index) => (
                        <span key={index} className="amenity-tag">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {room.description && (
                    <div className="room-description">
                      <span className="label">Description:</span>
                      <p>{room.description}</p>
                    </div>
                  )}
                </div>

                <div className="room-actions-card">
                  <button className="btn btn-sm btn-secondary" disabled>
                    View Details
                  </button>
                  {roomPermissions.canEdit && (
                    <button className="btn btn-sm btn-primary" disabled>
                      Edit Room
                    </button>
                  )}
                  {room.status === 'AVAILABLE' && (
                    <button className="btn btn-sm btn-success" disabled>
                      Book Room
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
