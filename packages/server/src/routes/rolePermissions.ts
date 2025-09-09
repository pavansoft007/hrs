import { Router } from 'express';
import { RolePermissionController } from '../controllers/rolePermissionController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  assignPermissionsSchema,
  createPermissionSchema,
  createRoleSchema,
} from '../utils/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Role management
router.post(
  '/roles',
  validate(createRoleSchema),
  RolePermissionController.createRole,
);
router.get('/roles', RolePermissionController.getRoles);
router.get('/roles/:id', RolePermissionController.getRoleById);
router.put(
  '/roles/:id',
  validate(createRoleSchema),
  RolePermissionController.updateRole,
);
router.delete('/roles/:id', RolePermissionController.deleteRole);

// Permission management
router.post(
  '/permissions',
  validate(createPermissionSchema),
  RolePermissionController.createPermission,
);
router.get('/permissions', RolePermissionController.getPermissions);
router.post(
  '/permissions/initialize',
  RolePermissionController.initializeDefaultPermissions,
);

// Role-Permission assignments
router.post(
  '/roles/:roleId/permissions',
  validate(assignPermissionsSchema),
  RolePermissionController.assignPermissionsToRole,
);
router.delete(
  '/roles/:roleId/permissions',
  validate(assignPermissionsSchema),
  RolePermissionController.removePermissionsFromRole,
);

// User-Role assignments
router.post(
  '/users/:userId/roles/:roleId',
  RolePermissionController.assignRoleToUser,
);
router.delete(
  '/users/:userId/roles/:roleId',
  RolePermissionController.removeRoleFromUser,
);

export default router;
