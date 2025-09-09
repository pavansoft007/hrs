import express from 'express';
import {
  getDashboardStats,
  getMonthlyStats,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get monthly statistics for charts
router.get('/monthly-stats', getMonthlyStats);

export default router;
