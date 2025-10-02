import axios from 'axios';

// Hotel-related interfaces
export interface Room {
  id: number;
  room_number: string;
  room_type: string;
  floor: number;
  capacity: number;
  price_per_night: number;
  amenities: string[];
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  room_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  booking_status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'CHECKED_OUT'
    | 'CANCELLED';
  created_at: string;
  room?: Room;
}

export interface Property {
  id: number;
  code: string;
  name: string;
  property_type: 'HOTEL' | 'RESTAURANT';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean;
}

export interface HotelStats {
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  maintenance_rooms: number;
  total_bookings: number;
  pending_bookings: number;
  revenue_today: number;
  revenue_this_month: number;
}

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export class HotelService {
  /**
   * Get current property details (hotel information)
   */
  static async getPropertyDetails(): Promise<Property> {
    const response = await axios.get<ApiResponse<{ property: Property }>>(
      '/hotel/property'
    );
    if (response.data.success) {
      return response.data.data.property;
    }
    throw new Error(
      response.data.message || 'Failed to fetch property details'
    );
  }

  /**
   * Get hotel dashboard statistics
   */
  static async getHotelStats(): Promise<HotelStats> {
    const response = await axios.get<ApiResponse<HotelStats>>('/hotel/stats');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(
      response.data.message || 'Failed to fetch hotel statistics'
    );
  }

  /**
   * Get all rooms for this property
   */
  static async getRooms(params?: {
    page?: number;
    limit?: number;
    status?: string;
    room_type?: string;
    floor?: number;
  }): Promise<PaginatedResponse<Room>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await axios.get<ApiResponse<PaginatedResponse<Room>>>(
      `/hotel/rooms?${queryParams.toString()}`
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch rooms');
  }

  /**
   * Get room by ID
   */
  static async getRoomById(roomId: number): Promise<Room> {
    const response = await axios.get<ApiResponse<{ room: Room }>>(
      `/hotel/rooms/${roomId}`
    );
    if (response.data.success) {
      return response.data.data.room;
    }
    throw new Error(response.data.message || 'Failed to fetch room details');
  }

  /**
   * Create new room
   */
  static async createRoom(
    roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Room> {
    const response = await axios.post<ApiResponse<{ room: Room }>>(
      '/hotel/rooms',
      roomData
    );
    if (response.data.success) {
      return response.data.data.room;
    }
    throw new Error(response.data.message || 'Failed to create room');
  }

  /**
   * Update room
   */
  static async updateRoom(
    roomId: number,
    roomData: Partial<Room>
  ): Promise<Room> {
    const response = await axios.put<ApiResponse<{ room: Room }>>(
      `/hotel/rooms/${roomId}`,
      roomData
    );
    if (response.data.success) {
      return response.data.data.room;
    }
    throw new Error(response.data.message || 'Failed to update room');
  }

  /**
   * Delete room
   */
  static async deleteRoom(roomId: number): Promise<void> {
    const response = await axios.delete<ApiResponse<null>>(
      `/hotel/rooms/${roomId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete room');
    }
  }

  /**
   * Get all bookings for this property
   */
  static async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    check_in_from?: string;
    check_in_to?: string;
  }): Promise<PaginatedResponse<Booking>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await axios.get<ApiResponse<PaginatedResponse<Booking>>>(
      `/hotel/bookings?${queryParams.toString()}`
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch bookings');
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(bookingId: number): Promise<Booking> {
    const response = await axios.get<ApiResponse<{ booking: Booking }>>(
      `/hotel/bookings/${bookingId}`
    );
    if (response.data.success) {
      return response.data.data.booking;
    }
    throw new Error(response.data.message || 'Failed to fetch booking details');
  }

  /**
   * Create new booking
   */
  static async createBooking(
    bookingData: Omit<Booking, 'id' | 'created_at' | 'room'>
  ): Promise<Booking> {
    const response = await axios.post<ApiResponse<{ booking: Booking }>>(
      '/hotel/bookings',
      bookingData
    );
    if (response.data.success) {
      return response.data.data.booking;
    }
    throw new Error(response.data.message || 'Failed to create booking');
  }

  /**
   * Update booking
   */
  static async updateBooking(
    bookingId: number,
    bookingData: Partial<Booking>
  ): Promise<Booking> {
    const response = await axios.put<ApiResponse<{ booking: Booking }>>(
      `/hotel/bookings/${bookingId}`,
      bookingData
    );
    if (response.data.success) {
      return response.data.data.booking;
    }
    throw new Error(response.data.message || 'Failed to update booking');
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(
    bookingId: number,
    status: Booking['booking_status']
  ): Promise<Booking> {
    const response = await axios.patch<ApiResponse<{ booking: Booking }>>(
      `/hotel/bookings/${bookingId}/status`,
      { status }
    );
    if (response.data.success) {
      return response.data.data.booking;
    }
    throw new Error(response.data.message || 'Failed to update booking status');
  }

  /**
   * Check room availability for date range
   */
  static async checkRoomAvailability(
    checkIn: string,
    checkOut: string,
    roomType?: string
  ): Promise<Room[]> {
    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
    });

    if (roomType) {
      params.append('room_type', roomType);
    }

    const response = await axios.get<ApiResponse<{ available_rooms: Room[] }>>(
      `/hotel/rooms/availability?${params.toString()}`
    );

    if (response.data.success) {
      return response.data.data.available_rooms;
    }
    throw new Error(
      response.data.message || 'Failed to check room availability'
    );
  }
}
