import { User } from './auth';

export type Permission =
  | 'view_rooms'
  | 'create_room'
  | 'edit_room'
  | 'delete_room'
  | 'view_bookings'
  | 'create_booking'
  | 'edit_booking'
  | 'cancel_booking'
  | 'check_in'
  | 'check_out'
  | 'view_reports'
  | 'manage_staff'
  | 'view_property_settings'
  | 'edit_property_settings'
  | 'view_financial_data';

export type RoleName =
  | 'PROPERTY_ADMIN'
  | 'FRONT_DESK_MANAGER'
  | 'FRONT_DESK_STAFF'
  | 'HOUSEKEEPING_MANAGER'
  | 'HOUSEKEEPING_STAFF'
  | 'MAINTENANCE'
  | 'ACCOUNTANT';

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  PROPERTY_ADMIN: [
    'view_rooms',
    'create_room',
    'edit_room',
    'delete_room',
    'view_bookings',
    'create_booking',
    'edit_booking',
    'cancel_booking',
    'check_in',
    'check_out',
    'view_reports',
    'manage_staff',
    'view_property_settings',
    'edit_property_settings',
    'view_financial_data',
  ],
  FRONT_DESK_MANAGER: [
    'view_rooms',
    'edit_room',
    'view_bookings',
    'create_booking',
    'edit_booking',
    'cancel_booking',
    'check_in',
    'check_out',
    'view_reports',
    'view_financial_data',
  ],
  FRONT_DESK_STAFF: [
    'view_rooms',
    'view_bookings',
    'create_booking',
    'edit_booking',
    'check_in',
    'check_out',
  ],
  HOUSEKEEPING_MANAGER: [
    'view_rooms',
    'edit_room',
    'view_bookings',
    'view_reports',
  ],
  HOUSEKEEPING_STAFF: ['view_rooms', 'view_bookings'],
  MAINTENANCE: ['view_rooms', 'edit_room'],
  ACCOUNTANT: ['view_bookings', 'view_reports', 'view_financial_data'],
};

// User type permissions (fallback if no specific role)
const USER_TYPE_PERMISSIONS: Record<string, Permission[]> = {
  PROPERTY_ADMIN: ROLE_PERMISSIONS.PROPERTY_ADMIN,
  STAFF: ['view_rooms', 'view_bookings'], // Basic staff permissions
};

export class PermissionService {
  /**
   * Get all permissions for a user based on their roles and user type
   */
  static getUserPermissions(user: User): Permission[] {
    const permissions = new Set<Permission>();

    // Add permissions based on roles
    if (user.roles && user.roles.length > 0) {
      user.roles.forEach((role) => {
        const roleName = role.name.toUpperCase() as RoleName;
        const rolePermissions = ROLE_PERMISSIONS[roleName];
        if (rolePermissions) {
          rolePermissions.forEach((permission) => permissions.add(permission));
        }
      });
    }

    // Add fallback permissions based on user type
    const userTypePermissions = USER_TYPE_PERMISSIONS[user.user_type];
    if (userTypePermissions) {
      userTypePermissions.forEach((permission) => permissions.add(permission));
    }

    return Array.from(permissions);
  }

  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: User, permission: Permission): boolean {
    const userPermissions = this.getUserPermissions(user);
    return userPermissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(user, permission)
    );
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(user: User, permissions: Permission[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(user, permission)
    );
  }

  /**
   * Get user's role display information
   */
  static getUserRoleInfo(user: User): {
    primaryRole: string;
    allRoles: string[];
    accessLevel: 'Admin' | 'Manager' | 'Staff' | 'Basic';
  } {
    const roles = user.roles?.map((role) => role.name) || [];

    // Determine primary role (highest level)
    let primaryRole = user.user_type;
    let accessLevel: 'Admin' | 'Manager' | 'Staff' | 'Basic' = 'Basic';

    if (
      roles.includes('PROPERTY_ADMIN') ||
      user.user_type === 'PROPERTY_ADMIN'
    ) {
      primaryRole = 'Property Administrator';
      accessLevel = 'Admin';
    } else if (roles.some((role) => role.includes('MANAGER'))) {
      primaryRole =
        roles.find((role) => role.includes('MANAGER')) || primaryRole;
      accessLevel = 'Manager';
    } else if (roles.length > 0) {
      primaryRole = roles[0];
      accessLevel = 'Staff';
    }

    return {
      primaryRole,
      allRoles: roles,
      accessLevel,
    };
  }

  /**
   * Get permission-based navigation items
   */
  static getNavigationItems(user: User): Array<{
    id: string;
    title: string;
    icon: string;
    path: string;
    permissions: Permission[];
    enabled: boolean;
  }> {
    const navItems = [
      {
        id: 'dashboard',
        title: 'Dashboard',
        icon: '📊',
        path: '/dashboard',
        permissions: [] as Permission[], // Always visible
        enabled: true,
      },
      {
        id: 'rooms',
        title: 'Room Management',
        icon: '🏠',
        path: '/rooms',
        permissions: ['view_rooms'] as Permission[],
        enabled: this.hasPermission(user, 'view_rooms'),
      },
      {
        id: 'bookings',
        title: 'Bookings',
        icon: '📅',
        path: '/bookings',
        permissions: ['view_bookings'] as Permission[],
        enabled: this.hasPermission(user, 'view_bookings'),
      },
      {
        id: 'reports',
        title: 'Reports',
        icon: '📈',
        path: '/reports',
        permissions: ['view_reports'] as Permission[],
        enabled: this.hasPermission(user, 'view_reports'),
      },
      {
        id: 'staff',
        title: 'Staff Management',
        icon: '👥',
        path: '/staff',
        permissions: ['manage_staff'] as Permission[],
        enabled: this.hasPermission(user, 'manage_staff'),
      },
      {
        id: 'settings',
        title: 'Property Settings',
        icon: '⚙️',
        path: '/settings',
        permissions: ['view_property_settings'] as Permission[],
        enabled: this.hasPermission(user, 'view_property_settings'),
      },
    ];

    return navItems;
  }

  /**
   * Check if user can perform room operations
   */
  static canManageRooms(user: User): {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  } {
    return {
      canView: this.hasPermission(user, 'view_rooms'),
      canCreate: this.hasPermission(user, 'create_room'),
      canEdit: this.hasPermission(user, 'edit_room'),
      canDelete: this.hasPermission(user, 'delete_room'),
    };
  }

  /**
   * Check if user can perform booking operations
   */
  static canManageBookings(user: User): {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canCancel: boolean;
    canCheckIn: boolean;
    canCheckOut: boolean;
  } {
    return {
      canView: this.hasPermission(user, 'view_bookings'),
      canCreate: this.hasPermission(user, 'create_booking'),
      canEdit: this.hasPermission(user, 'edit_booking'),
      canCancel: this.hasPermission(user, 'cancel_booking'),
      canCheckIn: this.hasPermission(user, 'check_in'),
      canCheckOut: this.hasPermission(user, 'check_out'),
    };
  }
}
