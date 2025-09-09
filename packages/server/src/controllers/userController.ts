import type { Response } from 'express';
import { Op } from 'sequelize';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { Permission, Property, Role, User } from '../models/index.js';
import { AuthUtils } from '../utils/auth.js';

export class UserController {
  /**
   * Create a new user
   * Master Admin can create any user, Property Admin can create staff for their property
   */
  static async createUser(
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

      const {
        full_name,
        email,
        phone,
        password,
        user_type,
        property_id,
        role_ids,
      } = req.body;

      // Check permissions
      if (req.user.user_type !== 'MASTER_ADMIN') {
        // Property Admin can only create STAFF users for their property
        if (
          req.user.user_type !== 'PROPERTY_ADMIN' ||
          user_type !== 'STAFF' ||
          property_id !== req.user.property_id
        ) {
          res.status(403).json({
            success: false,
            message:
              'Insufficient permissions. Property Admin can only create staff for their property.',
          });
          return;
        }
      }

      // Check if email already exists
      if (email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: 'User with this email already exists',
          });
          return;
        }
      }

      // Verify property exists if property_id is provided
      if (property_id) {
        const property = await Property.findByPk(property_id);
        if (!property) {
          res.status(400).json({
            success: false,
            message: 'Property not found',
          });
          return;
        }
      }

      // Hash password if provided
      let password_hash;
      if (password) {
        password_hash = await AuthUtils.hashPassword(password);
      }

      // Create user
      const user = await User.create({
        full_name,
        email,
        phone,
        password_hash,
        user_type: user_type || 'STAFF',
        property_id,
        is_active: true,
      });

      // Assign roles if provided
      if (role_ids && Array.isArray(role_ids) && role_ids.length > 0) {
        const roles = await Role.findAll({ where: { id: role_ids } });
        if (roles.length > 0) {
          await user.setRoles(roles);
        }
      }

      // Fetch created user with associations
      const createdUser = await User.findByPk(user.id, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
          },
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'property_type', 'code'],
          },
        ],
        attributes: { exclude: ['password_hash', 'refresh_token'] },
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: createdUser },
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating user',
      });
    }
  }

  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(
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

      const {
        page = 1,
        limit = 10,
        user_type,
        property_id,
        search,
        is_active,
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Build where conditions based on user permissions
      const whereConditions: any = {};

      // Master Admin can see all users, Property Admin can see only their property users
      if (req.user.user_type === 'PROPERTY_ADMIN') {
        whereConditions.property_id = req.user.property_id;
      } else if (req.user.user_type === 'STAFF') {
        // Staff can only see users in their property
        whereConditions.property_id = req.user.property_id;
      }

      // Apply filters
      if (user_type) {
        whereConditions.user_type = user_type;
      }

      if (property_id && req.user.user_type === 'MASTER_ADMIN') {
        whereConditions.property_id = property_id;
      }

      if (is_active !== undefined) {
        whereConditions.is_active = is_active === 'true';
      }

      if (search) {
        whereConditions[Op.or] = [
          { full_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereConditions,
        limit: Number(limit),
        offset,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            include: [
              {
                model: Permission,
                as: 'permissions',
                through: { attributes: [] },
                attributes: ['id', 'code', 'description'],
              },
            ],
          },
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'property_type', 'code'],
          },
        ],
        attributes: { exclude: ['password_hash', 'refresh_token'] },
      });

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            current_page: Number(page),
            total_pages: Math.ceil(count / Number(limit)),
            total_items: count,
            items_per_page: Number(limit),
          },
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching users',
      });
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(
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

      const user = await User.findByPk(id, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            include: [
              {
                model: Permission,
                as: 'permissions',
                through: { attributes: [] },
                attributes: ['id', 'code', 'description'],
              },
            ],
          },
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'property_type', 'code'],
          },
        ],
        attributes: { exclude: ['password_hash', 'refresh_token'] },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Check permissions to view this user
      const canView =
        req.user.user_type === 'MASTER_ADMIN' ||
        req.user.id === user.id ||
        (req.user.user_type === 'PROPERTY_ADMIN' &&
          req.user.property_id === user.property_id);

      if (!canView) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view this user',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching user',
      });
    }
  }

  /**
   * Update user
   */
  static async updateUser(
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
      const updateData = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Check permissions to update this user
      const canUpdate =
        req.user.user_type === 'MASTER_ADMIN' ||
        req.user.id === user.id ||
        (req.user.user_type === 'PROPERTY_ADMIN' &&
          req.user.property_id === user.property_id);

      if (!canUpdate) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to update this user',
        });
        return;
      }

      // Restrict what can be updated based on user type
      if (req.user.user_type !== 'MASTER_ADMIN') {
        // Non-master admins cannot change user_type or property_id
        delete updateData.user_type;
        delete updateData.property_id;
        delete updateData.is_active;
      }

      // Check email uniqueness if being updated
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({
          where: { email: updateData.email },
        });
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: 'User with this email already exists',
          });
          return;
        }
      }

      // Hash password if being updated
      if (updateData.password) {
        updateData.password_hash = await AuthUtils.hashPassword(
          updateData.password,
        );
        delete updateData.password;
      }

      // Don't allow updating these fields directly
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.updated_at;

      await user.update(updateData);

      // Handle role assignments if provided (Master Admin only)
      if (
        updateData.role_ids &&
        Array.isArray(updateData.role_ids) &&
        req.user.user_type === 'MASTER_ADMIN'
      ) {
        const roles = await Role.findAll({
          where: { id: updateData.role_ids },
        });
        await user.setRoles(roles);
      }

      // Fetch updated user with associations
      const updatedUser = await User.findByPk(id, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
          },
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'property_type', 'code'],
          },
        ],
        attributes: { exclude: ['password_hash', 'refresh_token'] },
      });

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating user',
      });
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(
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

      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Check permissions to delete this user
      const canDelete =
        req.user.user_type === 'MASTER_ADMIN' ||
        (req.user.user_type === 'PROPERTY_ADMIN' &&
          req.user.property_id === user.property_id &&
          user.user_type === 'STAFF');

      if (!canDelete) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to delete this user',
        });
        return;
      }

      // Prevent self-deletion
      if (req.user.id === user.id) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete your own account',
        });
        return;
      }

      await user.destroy();

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting user',
      });
    }
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(
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

      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Check permissions
      const canToggle =
        req.user.user_type === 'MASTER_ADMIN' ||
        (req.user.user_type === 'PROPERTY_ADMIN' &&
          req.user.property_id === user.property_id);

      if (!canToggle) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to change user status',
        });
        return;
      }

      // Prevent self-deactivation
      if (req.user.id === user.id) {
        res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account',
        });
        return;
      }

      await user.update({ is_active: !user.is_active });

      res.status(200).json({
        success: true,
        message: `User ${
          user.is_active ? 'activated' : 'deactivated'
        } successfully`,
        data: { user },
      });
    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while changing user status',
      });
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user || req.user.user_type !== 'MASTER_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Only Master Admin can view user statistics',
        });
        return;
      }

      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { is_active: true } });
      const masterAdmins = await User.count({
        where: { user_type: 'MASTER_ADMIN' },
      });
      const propertyAdmins = await User.count({
        where: { user_type: 'PROPERTY_ADMIN' },
      });
      const staff = await User.count({ where: { user_type: 'STAFF' } });

      // Users by property
      const usersByProperty = await User.findAll({
        attributes: [
          'property_id',
          [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count'],
        ],
        include: [
          {
            model: Property,
            as: 'property',
            attributes: ['id', 'name', 'property_type'],
          },
        ],
        group: ['property_id', 'property.id'],
        raw: false,
      });

      // Recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentUsers = await User.count({
        where: {
          created_at: {
            [Op.gte]: thirtyDaysAgo,
          },
        },
      });

      res.status(200).json({
        success: true,
        data: {
          overview: {
            total_users: totalUsers,
            active_users: activeUsers,
            inactive_users: totalUsers - activeUsers,
            master_admins: masterAdmins,
            property_admins: propertyAdmins,
            staff,
            recent_registrations: recentUsers,
          },
          users_by_property: usersByProperty,
        },
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching user statistics',
      });
    }
  }

  /**
   * Assign multiple roles to user
   */
  static async assignRolesToUser(
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

      const { userId } = req.params;
      const { roleIds } = req.body;

      if (!Array.isArray(roleIds)) {
        res.status(400).json({
          success: false,
          message: 'Role IDs must be an array',
        });
        return;
      }

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const roles = await Role.findAll({ where: { id: roleIds } });
      if (roles.length !== roleIds.length) {
        res.status(400).json({
          success: false,
          message: 'One or more roles not found',
        });
        return;
      }

      await user.setRoles(roles);

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
        message: 'Roles assigned to user successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error('Assign roles to user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while assigning roles',
      });
    }
  }
}
