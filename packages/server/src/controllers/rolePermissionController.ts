import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { Permission, Role, User } from '../models/index.js';

export class RolePermissionController {
  /**
   * Create a new role
   * Only Master Admin can create roles
   */
  static async createRole(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can create roles',
        });
        return;
      }

      const { name, description } = req.body;

      // Check if role name already exists
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        res.status(400).json({
          success: false,
          message: 'Role with this name already exists',
        });
        return;
      }

      const role = await Role.create({ name, description });

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: { role },
      });
    } catch (error) {
      console.error('Create role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating role',
      });
    }
  }

  /**
   * Get all roles with their permissions
   */
  static async getRoles(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const roles = await Role.findAll({
        include: [
          {
            model: Permission,
            as: 'permissions',
            through: { attributes: [] }, // Exclude junction table attributes
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'full_name', 'email'],
            through: { attributes: [] },
          },
        ],
        order: [['name', 'ASC']],
      });

      res.status(200).json({
        success: true,
        data: { roles },
      });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching roles',
      });
    }
  }

  /**
   * Get role by ID
   */
  static async getRoleById(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;

      const role = await Role.findByPk(id, {
        include: [
          {
            model: Permission,
            as: 'permissions',
            through: { attributes: [] },
          },
          {
            model: User,
            as: 'users',
            attributes: ['id', 'full_name', 'email', 'user_type'],
            through: { attributes: [] },
          },
        ],
      });

      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { role },
      });
    } catch (error) {
      console.error('Get role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching role',
      });
    }
  }

  /**
   * Update role
   */
  static async updateRole(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can update roles',
        });
        return;
      }

      const { id } = req.params;
      const { name, description } = req.body;

      const role = await Role.findByPk(id);
      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found',
        });
        return;
      }

      // Check if name conflicts with another role
      if (name && name !== role.name) {
        const existingRole = await Role.findOne({ where: { name } });
        if (existingRole) {
          res.status(400).json({
            success: false,
            message: 'Role with this name already exists',
          });
          return;
        }
      }

      await role.update({ name, description });

      res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        data: { role },
      });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating role',
      });
    }
  }

  /**
   * Delete role
   */
  static async deleteRole(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can delete roles',
        });
        return;
      }

      const { id } = req.params;

      const role = await Role.findByPk(id);
      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found',
        });
        return;
      }

      // Check if role is assigned to users
      const userCount = await User.count({
        include: [
          {
            model: Role,
            as: 'roles',
            where: { id },
            through: { attributes: [] },
          },
        ],
      });

      if (userCount > 0) {
        res.status(400).json({
          success: false,
          message:
            'Cannot delete role that is assigned to users. Please reassign users first.',
          assigned_users: userCount,
        });
        return;
      }

      await role.destroy();

      res.status(200).json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      console.error('Delete role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting role',
      });
    }
  }

  /**
   * Create a new permission
   */
  static async createPermission(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can create permissions',
        });
        return;
      }

      const { code, description } = req.body;

      // Check if permission code already exists
      const existingPermission = await Permission.findOne({ where: { code } });
      if (existingPermission) {
        res.status(400).json({
          success: false,
          message: 'Permission with this code already exists',
        });
        return;
      }

      const permission = await Permission.create({ code, description });

      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: { permission },
      });
    } catch (error) {
      console.error('Create permission error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating permission',
      });
    }
  }

  /**
   * Get all permissions
   */
  static async getPermissions(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const permissions = await Permission.findAll({
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
          },
        ],
        order: [['code', 'ASC']],
      });

      res.status(200).json({
        success: true,
        data: { permissions },
      });
    } catch (error) {
      console.error('Get permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching permissions',
      });
    }
  }

  /**
   * Assign permissions to role
   */
  static async assignPermissionsToRole(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can assign permissions to roles',
        });
        return;
      }

      const { roleId } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        res.status(400).json({
          success: false,
          message: 'Permission IDs must be an array',
        });
        return;
      }

      const role = await Role.findByPk(roleId);
      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found',
        });
        return;
      }

      // Verify all permissions exist
      const permissions = await Permission.findAll({
        where: { id: permissionIds },
      });

      if (permissions.length !== permissionIds.length) {
        res.status(400).json({
          success: false,
          message: 'One or more permissions not found',
        });
        return;
      }

      // Set permissions for role (this will replace existing permissions)
      await role.setPermissions(permissions);

      // Fetch updated role with permissions
      const updatedRole = await Role.findByPk(roleId, {
        include: [
          {
            model: Permission,
            as: 'permissions',
            through: { attributes: [] },
          },
        ],
      });

      res.status(200).json({
        success: true,
        message: 'Permissions assigned to role successfully',
        data: { role: updatedRole },
      });
    } catch (error) {
      console.error('Assign permissions to role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while assigning permissions',
      });
    }
  }

  /**
   * Remove permissions from role
   */
  static async removePermissionsFromRole(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can remove permissions from roles',
        });
        return;
      }

      const { roleId } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        res.status(400).json({
          success: false,
          message: 'Permission IDs must be an array',
        });
        return;
      }

      const role = await Role.findByPk(roleId);
      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found',
        });
        return;
      }

      const permissions = await Permission.findAll({
        where: { id: permissionIds },
      });

      await role.removePermissions(permissions);

      // Fetch updated role with permissions
      const updatedRole = await Role.findByPk(roleId, {
        include: [
          {
            model: Permission,
            as: 'permissions',
            through: { attributes: [] },
          },
        ],
      });

      res.status(200).json({
        success: true,
        message: 'Permissions removed from role successfully',
        data: { role: updatedRole },
      });
    } catch (error) {
      console.error('Remove permissions from role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while removing permissions',
      });
    }
  }

  /**
   * Assign role to user
   */
  static async assignRoleToUser(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can assign roles to users',
        });
        return;
      }

      const { userId, roleId } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const role = await Role.findByPk(roleId);
      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found',
        });
        return;
      }

      await user.addRole(role);

      // Fetch updated user with roles
      const updatedUser = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
          },
        ],
        attributes: { exclude: ['password_hash', 'refresh_token'] },
      });

      res.status(200).json({
        success: true,
        message: 'Role assigned to user successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error('Assign role to user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while assigning role',
      });
    }
  }

  /**
   * Remove role from user
   */
  static async removeRoleFromUser(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can remove roles from users',
        });
        return;
      }

      const { userId, roleId } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const role = await Role.findByPk(roleId);
      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found',
        });
        return;
      }

      await user.removeRole(role);

      // Fetch updated user with roles
      const updatedUser = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
          },
        ],
        attributes: { exclude: ['password_hash', 'refresh_token'] },
      });

      res.status(200).json({
        success: true,
        message: 'Role removed from user successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error('Remove role from user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while removing role',
      });
    }
  }

  /**
   * Initialize default permissions
   * This creates common permissions for hotel/restaurant management
   */
  static async initializeDefaultPermissions(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can initialize permissions',
        });
        return;
      }

      const defaultPermissions = [
        // Hotel Management
        { code: 'hotel.view', description: 'View hotel information' },
        { code: 'hotel.manage', description: 'Manage hotel settings' },
        { code: 'hotel.rooms.view', description: 'View room information' },
        {
          code: 'hotel.rooms.manage',
          description: 'Manage rooms and bookings',
        },
        { code: 'hotel.guests.view', description: 'View guest information' },
        { code: 'hotel.guests.manage', description: 'Manage guest accounts' },

        // Restaurant Management
        { code: 'restaurant.view', description: 'View restaurant information' },
        {
          code: 'restaurant.manage',
          description: 'Manage restaurant settings',
        },
        { code: 'restaurant.menu.view', description: 'View menu items' },
        {
          code: 'restaurant.menu.manage',
          description: 'Manage menu and pricing',
        },
        { code: 'restaurant.orders.view', description: 'View orders' },
        {
          code: 'restaurant.orders.manage',
          description: 'Manage orders and kitchen',
        },

        // Staff Management
        { code: 'staff.view', description: 'View staff information' },
        {
          code: 'staff.manage',
          description: 'Manage staff accounts and schedules',
        },
        { code: 'roles.view', description: 'View roles and permissions' },
        { code: 'roles.manage', description: 'Manage roles and permissions' },

        // Reports and Analytics
        { code: 'reports.view', description: 'View reports and analytics' },
        { code: 'reports.export', description: 'Export reports and data' },

        // System Management
        { code: 'system.settings', description: 'Manage system settings' },
        { code: 'system.backup', description: 'System backup and maintenance' },
      ];

      const createdPermissions = [];

      for (const permData of defaultPermissions) {
        const [permission, created] = await Permission.findOrCreate({
          where: { code: permData.code },
          defaults: permData,
        });

        if (created) {
          createdPermissions.push(permission);
        }
      }

      res.status(200).json({
        success: true,
        message: `Permissions initialized successfully. ${createdPermissions.length} new permissions created.`,
        data: {
          created_permissions: createdPermissions,
          total_permissions: await Permission.count(),
        },
      });
    } catch (error) {
      console.error('Initialize permissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while initializing permissions',
      });
    }
  }
}
