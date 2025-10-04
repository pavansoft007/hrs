import { Router } from 'express';
import { HotelController } from '../controllers/hotelController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All hotel routes require authentication
router.use(authenticate);

// Property information
router.get('/property', HotelController.getPropertyDetails);

// Hotel statistics
router.get('/stats', HotelController.getHotelStats);

// Room management
router.get('/rooms', HotelController.getRooms);
router.post('/rooms', HotelController.createRoom);
router.get('/rooms/availability', HotelController.checkRoomAvailability);
// TODO: Add individual room operations
// router.get('/rooms/:roomId', HotelController.getRoomById);
// router.put('/rooms/:roomId', HotelController.updateRoom);
// router.delete('/rooms/:roomId', HotelController.deleteRoom);

// Booking management
router.get('/bookings', HotelController.getBookings);
router.post('/bookings', HotelController.createBooking);
router.patch(
  '/bookings/:bookingId/status',
  HotelController.updateBookingStatus
);
// TODO: Add individual booking operations
// router.get('/bookings/:bookingId', HotelController.getBookingById);
// router.put('/bookings/:bookingId', HotelController.updateBooking);

export default router;
