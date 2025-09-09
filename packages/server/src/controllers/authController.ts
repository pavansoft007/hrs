import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { Role, User } from '../models/index.js';
import { AuthUtils } from '../utils/auth.js';

export class AuthController {
  /**
   * Register a new user
   * - Allows public registration of first Master Admin
   * - Requires Master Admin privileges for subsequent registrations
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { full_name, email, phone, password, user_type, property_id } =
        req.body;

      // Check if any Master Admin exists
      const existingMasterAdmin = await User.findOne({
        where: { user_type: 'MASTER_ADMIN' },
      });

      // If Master Admin exists, require authentication and Master Admin privileges
      if (existingMasterAdmin) {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
          res.status(401).json({
            success: false,
            message: 'Authentication required for user registration',
            details:
              'A Master Administrator already exists in the system. Please login as a Master Admin to create new users.',
            existing_master_admin: {
              email: existingMasterAdmin.email,
              created_at: existingMasterAdmin.created_at,
            },
          });
          return;
        }

        if (authReq.user.user_type !== 'MASTER_ADMIN') {
          res.status(403).json({
            success: false,
            message: 'Only Master Admin can register new users',
          });
          return;
        }
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
        return;
      }

      // Hash password
      const password_hash = await AuthUtils.hashPassword(password);

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

      // Assign default role based on user type
      let defaultRoleId: number;
      switch (user_type || 'STAFF') {
        case 'MASTER_ADMIN':
          defaultRoleId = 1; // MASTER_ADMIN role
          break;
        case 'PROPERTY_ADMIN':
          defaultRoleId = 2; // PROPERTY_ADMIN role
          break;
        default:
          defaultRoleId = 8; // STAFF role (default to CHEF, can be changed later)
      }

      // Assign role to user
      const role = await Role.findByPk(defaultRoleId);
      if (role) {
        await user.addRole(role);
      }

      // Generate tokens
      const tokens = await AuthUtils.generateTokens(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            user_type: user.user_type,
            property_id: user.property_id,
            is_active: user.is_active,
            created_at: user.created_at,
          },
          tokens,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user with roles
      const user = await User.findOne({
        where: { email, is_active: true },
        include: [
          {
            model: Role,
            as: 'roles',
          },
        ],
      });

      if (!user || !user.password_hash) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Verify password
      const isValidPassword = await AuthUtils.comparePassword(
        password,
        user.password_hash,
      );
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Update last login
      await user.update({ last_login: new Date() });

      // Generate tokens
      const tokens = await AuthUtils.generateTokens(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            user_type: user.user_type,
            property_id: user.property_id,
            roles:
              user.roles?.map((role: Role) => ({
                id: role.id,
                name: role.name,
                description: role.description,
              })) || [],
            last_login: user.last_login,
          },
          tokens,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const payload = AuthUtils.verifyRefreshToken(refreshToken);
      if (!payload) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
        return;
      }

      // Find user and verify refresh token
      const user = await User.findOne({
        where: {
          id: payload.id,
          refresh_token: refreshToken,
          is_active: true,
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
        return;
      }

      // Generate new tokens
      const tokens = await AuthUtils.generateTokens(user);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during token refresh',
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Revoke refresh token
      await AuthUtils.revokeRefreshToken(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout',
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Fetch user with complete profile and roles
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: 'roles',
          },
        ],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            user_type: user.user_type,
            property_id: user.property_id,
            is_active: user.is_active,
            last_login: user.last_login,
            email_verified_at: user.email_verified_at,
            roles:
              user.roles?.map((role: Role) => ({
                id: role.id,
                name: role.name,
                description: role.description,
              })) || [],
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching profile',
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!req.user.password_hash) {
        res.status(400).json({
          success: false,
          message: 'User has no password set',
        });
        return;
      }

      // Verify current password
      const isValidPassword = await AuthUtils.comparePassword(
        currentPassword,
        req.user.password_hash,
      );
      if (!isValidPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
        return;
      }

      // Hash new password
      const newPasswordHash = await AuthUtils.hashPassword(newPassword);

      // Update password and revoke all refresh tokens
      await req.user.update({
        password_hash: newPasswordHash,
        refresh_token: undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while changing password',
      });
    }
  }

  /**
   * Development only: Reset system for first-time setup
   * This allows clearing existing Master Admin to enable public registration
   */
  static async resetSystem(req: Request, res: Response): Promise<void> {
    try {
      // Only allow in development environment
      if (process.env.NODE_ENV === 'production') {
        res.status(403).json({
          success: false,
          message: 'System reset is not allowed in production',
        });
        return;
      }

      const { confirm_reset } = req.body;

      if (confirm_reset !== 'YES_DELETE_ALL_USERS') {
        res.status(400).json({
          success: false,
          message: 'System reset requires explicit confirmation',
          required_confirmation: 'YES_DELETE_ALL_USERS',
        });
        return;
      }

      // Delete all users
      await User.destroy({ where: {} });

      res.status(200).json({
        success: true,
        message:
          'System reset successfully. You can now register the first Master Admin.',
      });
    } catch (error) {
      console.error('System reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during system reset',
      });
    }
  }
}
