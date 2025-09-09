import { Router } from 'express';
import { PropertyController } from '../controllers/propertyController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  createPropertySchema,
  updatePropertySchema,
} from '../utils/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Property CRUD operations
router.post(
  '/',
  validate(createPropertySchema),
  PropertyController.createProperty,
);
router.get('/', PropertyController.getProperties);
router.get('/stats', PropertyController.getPropertyStats);
router.get('/:id', PropertyController.getPropertyById);
router.put(
  '/:id',
  validate(updatePropertySchema),
  PropertyController.updateProperty,
);
router.delete('/:id', PropertyController.deleteProperty);
router.patch('/:id/toggle-status', PropertyController.togglePropertyStatus);

export default router;
