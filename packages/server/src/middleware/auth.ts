import { Request, Response, NextFunction } from "express";
import { AuthUtils } from "../utils/auth.js";
import { User, Role, Permission } from "../models/index.js";

interface AuthenticatedRequest extends Request {
  user?: User;
  userPayload?: {
    id: number;
    email: string;
    user_type: "MASTER_ADMIN" | "PROPERTY_ADMIN" | "STAFF";
    property_id?: number;
  };
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = AuthUtils.verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    // Fetch user with roles and permissions
    const user = await User.findByPk(payload.id, {
      include: [
        {
          model: Role,
          as: "roles",
          include: [
            {
              model: Permission,
              as: "permissions",
            },
          ],
        },
      ],
    });

    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
      return;
    }

    req.user = user;
    req.userPayload = payload;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

/**
 * Middleware to check if user has specific permission
 */
export const authorize = (requiredPermission: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      // Master Admin has all permissions
      if (req.user.user_type === "MASTER_ADMIN") {
        next();
        return;
      }

      // Check if user has the required permission
      const hasPermission = req.user.roles?.some((role) =>
        role.permissions?.some(
          (permission) => permission.code === requiredPermission
        )
      );

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during authorization",
      });
    }
  };
};

/**
 * Middleware to check if user has specific role
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const hasRole = req.user.roles?.some((role) =>
        allowedRoles.includes(role.name)
      );

      if (!hasRole) {
        res.status(403).json({
          success: false,
          message: "Access denied. Insufficient role permissions",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Role authorization error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during role authorization",
      });
    }
  };
};

/**
 * Middleware to check if user is master admin
 */
export const requireMasterAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (req.user.user_type !== "MASTER_ADMIN") {
    res.status(403).json({
      success: false,
      message: "Master Admin access required",
    });
    return;
  }

  next();
};

/**
 * Middleware to ensure user can only access their own property data
 */
export const requirePropertyAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  // Master Admin can access all properties
  if (req.user.user_type === "MASTER_ADMIN") {
    next();
    return;
  }

  const requestedPropertyId = req.params.propertyId || req.body.property_id;

  if (
    requestedPropertyId &&
    req.user.property_id !== parseInt(requestedPropertyId)
  ) {
    res.status(403).json({
      success: false,
      message: "Access denied. You can only access your assigned property",
    });
    return;
  }

  next();
};

export type { AuthenticatedRequest };
