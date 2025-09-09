import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  assignRolesSchema,
  createUserSchema,
  updateUserSchema,
} from '../utils/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User CRUD operations
router.post('/', validate(createUserSchema), UserController.createUser);
router.get('/', UserController.getUsers);
router.get('/stats', UserController.getUserStats);
router.get('/:id', UserController.getUserById);
router.put('/:id', validate(updateUserSchema), UserController.updateUser);
router.delete('/:id', UserController.deleteUser);
router.patch('/:id/toggle-status', UserController.toggleUserStatus);

// Role assignments
router.post(
  '/:userId/roles',
  validate(assignRolesSchema),
  UserController.assignRolesToUser,
);

export default router;
