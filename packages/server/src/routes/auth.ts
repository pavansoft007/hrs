import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  changePasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from '../utils/validation.js';

const router = Router();

// Public routes (no authentication required)
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/register', validate(registerSchema), AuthController.register);
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  AuthController.refreshToken,
);

// Development only route for system reset
if (process.env.NODE_ENV !== 'production') {
  router.post('/reset-system', AuthController.resetSystem);
}

// Protected routes (authentication required)
router.use(authenticate); // All routes below require authentication

router.post('/logout', AuthController.logout);
router.get('/profile', AuthController.getProfile);
router.put(
  '/change-password',
  validate(changePasswordSchema),
  AuthController.changePassword,
);

export default router;
