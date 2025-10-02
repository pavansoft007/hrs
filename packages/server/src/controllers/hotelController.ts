import type { Response } from 'express';
import { Op } from 'sequelize';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { Property, User } from '../models/index.js';

export class HotelController {
  /**
   * Get current user's property details
   * Property-admin and staff can only see their own property
   */
  static async getPropertyDetails(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Get property based on user's property_id
      const property = await Property.findOne({
        where: {
          id: req.user.property_id,
          is_active: true,
        },
      });

      if (!property) {
        res.status(404).json({
          success: false,
          message: 'Property not found or inactive',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { property },
      });
    } catch (error) {
      console.error('Get property details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching property details',
      });
    }
  }

  /**
   * Get hotel statistics for current property
   */
  static async getHotelStats(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // For now, return mock data as we don't have rooms/bookings tables yet
      // In a real implementation, you would query actual rooms and bookings tables
      const mockStats = {
        total_rooms: 50,
        occupied_rooms: 35,
        available_rooms: 12,
        maintenance_rooms: 3,
        total_bookings: 142,
        pending_bookings: 8,
        revenue_today: 45000,
        revenue_this_month: 1250000,
      };

      res.status(200).json({
        success: true,
        data: mockStats,
      });
    } catch (error) {
      console.error('Get hotel stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching hotel statistics',
      });
    }
  }

  /**
   * Get rooms for current property with pagination and filtering
   */
  static async getRooms(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { page = 1, limit = 10, status, room_type, floor } = req.query;

      // Mock rooms data for now
      // In real implementation, you would query rooms table filtered by property_id
      const mockRooms = [
        {
          id: 1,
          room_number: '101',
          room_type: 'Standard',
          floor: 1,
          capacity: 2,
          price_per_night: 2500,
          amenities: ['AC', 'TV', 'WiFi'],
          status: 'AVAILABLE',
          description: 'Comfortable standard room with city view',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          room_number: '102',
          room_type: 'Deluxe',
          floor: 1,
          capacity: 3,
          price_per_night: 3500,
          amenities: ['AC', 'TV', 'WiFi', 'Mini Bar'],
          status: 'OCCUPIED',
          description: 'Spacious deluxe room with garden view',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          room_number: '201',
          room_type: 'Suite',
          floor: 2,
          capacity: 4,
          price_per_night: 5000,
          amenities: ['AC', 'TV', 'WiFi', 'Mini Bar', 'Balcony'],
          status: 'MAINTENANCE',
          description: 'Luxury suite with separate living area',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const filteredRooms = mockRooms.filter((room) => {
        if (status && room.status !== status) return false;
        if (room_type && room.room_type !== room_type) return false;
        if (floor && room.floor !== Number(floor)) return false;
        return true;
      });

      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        data: {
          items: paginatedRooms,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(filteredRooms.length / Number(limit)),
            total_items: filteredRooms.length,
            items_per_page: Number(limit),
          },
        },
      });
    } catch (error) {
      console.error('Get rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching rooms',
      });
    }
  }

  /**
   * Get bookings for current property with pagination and filtering
   */
  static async getBookings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const {
        page = 1,
        limit = 10,
        status,
        check_in_from,
        check_in_to,
      } = req.query;

      // Mock bookings data for now
      const mockBookings = [
        {
          id: 1,
          room_id: 1,
          guest_name: 'John Doe',
          guest_email: 'john.doe@email.com',
          guest_phone: '+91-9876543210',
          check_in_date: '2024-10-03',
          check_out_date: '2024-10-05',
          total_amount: 5000,
          booking_status: 'CONFIRMED',
          created_at: new Date().toISOString(),
          room: {
            id: 1,
            room_number: '101',
            room_type: 'Standard',
          },
        },
        {
          id: 2,
          room_id: 2,
          guest_name: 'Jane Smith',
          guest_email: 'jane.smith@email.com',
          guest_phone: '+91-8765432109',
          check_in_date: '2024-10-02',
          check_out_date: '2024-10-04',
          total_amount: 7000,
          booking_status: 'CHECKED_IN',
          created_at: new Date().toISOString(),
          room: {
            id: 2,
            room_number: '102',
            room_type: 'Deluxe',
          },
        },
        {
          id: 3,
          room_id: 3,
          guest_name: 'Bob Johnson',
          guest_email: 'bob.johnson@email.com',
          guest_phone: '+91-7654321098',
          check_in_date: '2024-10-05',
          check_out_date: '2024-10-07',
          total_amount: 10000,
          booking_status: 'PENDING',
          created_at: new Date().toISOString(),
          room: {
            id: 3,
            room_number: '201',
            room_type: 'Suite',
          },
        },
      ];

      const filteredBookings = mockBookings.filter((booking) => {
        if (status && booking.booking_status !== status) return false;
        if (check_in_from && booking.check_in_date < check_in_from)
          return false;
        if (check_in_to && booking.check_in_date > check_in_to) return false;
        return true;
      });

      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        data: {
          items: paginatedBookings,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(filteredBookings.length / Number(limit)),
            total_items: filteredBookings.length,
            items_per_page: Number(limit),
          },
        },
      });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching bookings',
      });
    }
  }

  /**
   * Create new room (Property Admin only)
   */
  static async createRoom(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Check if user has permission to create rooms
      if (
        req.user.user_type !== 'PROPERTY_ADMIN' &&
        req.user.user_type !== 'MASTER_ADMIN'
      ) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create rooms',
        });
        return;
      }

      const roomData = req.body;

      // Mock room creation
      const newRoom = {
        id: Date.now(), // Mock ID
        ...roomData,
        property_id: req.user.property_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: { room: newRoom },
      });
    } catch (error) {
      console.error('Create room error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating room',
      });
    }
  }

  /**
   * Create new booking
   */
  static async createBooking(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const bookingData = req.body;

      // Mock booking creation
      const newBooking = {
        id: Date.now(), // Mock ID
        ...bookingData,
        property_id: req.user.property_id,
        booking_status: 'PENDING',
        created_at: new Date().toISOString(),
      };

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: { booking: newBooking },
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating booking',
      });
    }
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { bookingId } = req.params;
      const { status } = req.body;

      // Mock booking status update
      const updatedBooking = {
        id: Number(bookingId),
        booking_status: status,
        updated_at: new Date().toISOString(),
      };

      res.status(200).json({
        success: true,
        message: 'Booking status updated successfully',
        data: { booking: updatedBooking },
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating booking status',
      });
    }
  }

  /**
   * Check room availability for date range
   */
  static async checkRoomAvailability(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { check_in, check_out, room_type } = req.query;

      // Mock available rooms
      const availableRooms = [
        {
          id: 4,
          room_number: '103',
          room_type: 'Standard',
          floor: 1,
          capacity: 2,
          price_per_night: 2500,
          amenities: ['AC', 'TV', 'WiFi'],
          status: 'AVAILABLE',
          description: 'Comfortable standard room',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      res.status(200).json({
        success: true,
        data: {
          available_rooms: room_type
            ? availableRooms.filter((room) => room.room_type === room_type)
            : availableRooms,
        },
      });
    } catch (error) {
      console.error('Check room availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while checking room availability',
      });
    }
  }
}
