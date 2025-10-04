import axios from 'axios';

// Role and Permission interfaces
export interface Permission {
  id: number;
  code: string;
  description: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions?: Permission[];
  users?: User[];
}

export interface User {
  id: number;
  property_id: number;
  full_name: string;
  email: string;
  phone: string;
  user_type: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
  is_active: boolean;
  last_login: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  roles?: Role[];
  property?: {
    id: number;
    name: string;
    property_type: string;
    code: string;
  };
}

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  items?: T[];
  users?: T[];
  roles?: Role[];
  permissions?: Permission[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// Staff role definitions for hotels
export const STAFF_ROLES = {
  HOTEL: [
    {
      name: 'Front Desk Manager',
      description:
        'Manages front desk operations, check-ins, and guest services',
      permissions: [
        'hotel.view',
        'hotel.rooms.view',
        'hotel.rooms.manage',
        'hotel.guests.view',
        'hotel.guests.manage',
        'reports.view',
      ],
    },
    {
      name: 'Front Desk Agent',
      description: 'Handles guest check-ins, check-outs, and basic inquiries',
      permissions: [
        'hotel.view',
        'hotel.rooms.view',
        'hotel.guests.view',
        'hotel.guests.manage',
      ],
    },
    {
      name: 'Housekeeping Manager',
      description: 'Oversees housekeeping operations and room maintenance',
      permissions: [
        'hotel.view',
        'hotel.rooms.view',
        'hotel.rooms.manage',
        'staff.view',
      ],
    },
    {
      name: 'Housekeeping Staff',
      description: 'Responsible for cleaning and maintaining guest rooms',
      permissions: ['hotel.view', 'hotel.rooms.view'],
    },
    {
      name: 'Maintenance Staff',
      description: 'Handles hotel maintenance and technical issues',
      permissions: ['hotel.view', 'hotel.rooms.view'],
    },
    {
      name: 'Guest Services',
      description: 'Provides concierge and guest assistance services',
      permissions: ['hotel.view', 'hotel.guests.view', 'hotel.guests.manage'],
    },
  ],
  RESTAURANT: [
    {
      name: 'Restaurant Manager',
      description: 'Manages restaurant operations, staff, and customer service',
      permissions: [
        'restaurant.view',
        'restaurant.manage',
        'restaurant.menu.view',
        'restaurant.menu.manage',
        'restaurant.orders.view',
        'restaurant.orders.manage',
        'staff.view',
        'staff.manage',
        'reports.view',
      ],
    },
    {
      name: 'Chef',
      description: 'Manages kitchen operations and food preparation',
      permissions: [
        'restaurant.view',
        'restaurant.menu.view',
        'restaurant.orders.view',
        'restaurant.orders.manage',
      ],
    },
    {
      name: 'Kitchen Staff',
      description: 'Assists in food preparation and kitchen operations',
      permissions: ['restaurant.view', 'restaurant.orders.view'],
    },
    {
      name: 'Waiter/Waitress',
      description: 'Serves customers and takes orders',
      permissions: [
        'restaurant.view',
        'restaurant.menu.view',
        'restaurant.orders.view',
        'restaurant.orders.manage',
      ],
    },
    {
      name: 'Cashier',
      description: 'Handles billing and payment processing',
      permissions: ['restaurant.view', 'restaurant.orders.view'],
    },
    {
      name: 'Host/Hostess',
      description: 'Greets customers and manages table reservations',
      permissions: ['restaurant.view', 'restaurant.orders.view'],
    },
  ],
};

export class RoleService {
  // Role Management
  /**
   * Get all roles with their permissions and users
   */
  static async getRoles(): Promise<Role[]> {
    const response = await axios.get<ApiResponse<{ roles: Role[] }>>(
      '/role-permissions/roles'
    );
    if (response.data.success) {
      return response.data.data.roles;
    }
    throw new Error(response.data.message || 'Failed to fetch roles');
  }

  /**
   * Get role by ID
   */
  static async getRoleById(roleId: number): Promise<Role> {
    const response = await axios.get<ApiResponse<{ role: Role }>>(
      `/role-permissions/roles/${roleId}`
    );
    if (response.data.success) {
      return response.data.data.role;
    }
    throw new Error(response.data.message || 'Failed to fetch role');
  }

  /**
   * Create new role
   */
  static async createRole(roleData: {
    name: string;
    description: string;
  }): Promise<Role> {
    const response = await axios.post<ApiResponse<{ role: Role }>>(
      '/role-permissions/roles',
      roleData
    );
    if (response.data.success) {
      return response.data.data.role;
    }
    throw new Error(response.data.message || 'Failed to create role');
  }

  /**
   * Update role
   */
  static async updateRole(
    roleId: number,
    roleData: { name?: string; description?: string }
  ): Promise<Role> {
    const response = await axios.put<ApiResponse<{ role: Role }>>(
      `/role-permissions/roles/${roleId}`,
      roleData
    );
    if (response.data.success) {
      return response.data.data.role;
    }
    throw new Error(response.data.message || 'Failed to update role');
  }

  /**
   * Delete role
   */
  static async deleteRole(roleId: number): Promise<void> {
    const response = await axios.delete<ApiResponse<null>>(
      `/role-permissions/roles/${roleId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete role');
    }
  }

  // Permission Management
  /**
   * Get all permissions
   */
  static async getPermissions(): Promise<Permission[]> {
    const response = await axios.get<
      ApiResponse<{ permissions: Permission[] }>
    >('/role-permissions/permissions');
    if (response.data.success) {
      return response.data.data.permissions;
    }
    throw new Error(response.data.message || 'Failed to fetch permissions');
  }

  /**
   * Create new permission
   */
  static async createPermission(permissionData: {
    code: string;
    description: string;
  }): Promise<Permission> {
    const response = await axios.post<ApiResponse<{ permission: Permission }>>(
      '/role-permissions/permissions',
      permissionData
    );
    if (response.data.success) {
      return response.data.data.permission;
    }
    throw new Error(response.data.message || 'Failed to create permission');
  }

  /**
   * Initialize default permissions for hotel/restaurant management
   */
  static async initializeDefaultPermissions(): Promise<{
    created_permissions: Permission[];
    total_permissions: number;
  }> {
    const response = await axios.post<
      ApiResponse<{
        created_permissions: Permission[];
        total_permissions: number;
      }>
    >('/role-permissions/permissions/initialize');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(
      response.data.message || 'Failed to initialize permissions'
    );
  }

  // Role-Permission Management
  /**
   * Assign permissions to role
   */
  static async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[]
  ): Promise<Role> {
    const response = await axios.post<ApiResponse<{ role: Role }>>(
      `/role-permissions/roles/${roleId}/permissions`,
      { permissionIds }
    );
    if (response.data.success) {
      return response.data.data.role;
    }
    throw new Error(response.data.message || 'Failed to assign permissions');
  }

  /**
   * Remove permissions from role
   */
  static async removePermissionsFromRole(
    roleId: number,
    permissionIds: number[]
  ): Promise<Role> {
    const response = await axios.delete<ApiResponse<{ role: Role }>>(
      `/role-permissions/roles/${roleId}/permissions`,
      { data: { permissionIds } }
    );
    if (response.data.success) {
      return response.data.data.role;
    }
    throw new Error(response.data.message || 'Failed to remove permissions');
  }

  // User Management
  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    user_type?: string;
    property_id?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await axios.get<ApiResponse<PaginatedResponse<User>>>(
      `/users?${queryParams.toString()}`
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch users');
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: number): Promise<User> {
    const response = await axios.get<ApiResponse<{ user: User }>>(
      `/users/${userId}`
    );
    if (response.data.success) {
      return response.data.data.user;
    }
    throw new Error(response.data.message || 'Failed to fetch user');
  }

  /**
   * Create new user
   */
  static async createUser(userData: {
    full_name: string;
    email?: string;
    phone?: string;
    password?: string;
    user_type?: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
    property_id?: number;
    role_ids?: number[];
  }): Promise<User> {
    const response = await axios.post<ApiResponse<{ user: User }>>(
      '/users',
      userData
    );
    if (response.data.success) {
      return response.data.data.user;
    }
    throw new Error(response.data.message || 'Failed to create user');
  }

  /**
   * Update user
   */
  static async updateUser(
    userId: number,
    userData: Partial<User> & { role_ids?: number[] }
  ): Promise<User> {
    const response = await axios.put<ApiResponse<{ user: User }>>(
      `/users/${userId}`,
      userData
    );
    if (response.data.success) {
      return response.data.data.user;
    }
    throw new Error(response.data.message || 'Failed to update user');
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: number): Promise<void> {
    const response = await axios.delete<ApiResponse<null>>(`/users/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete user');
    }
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(userId: number): Promise<User> {
    const response = await axios.patch<ApiResponse<{ user: User }>>(
      `/users/${userId}/toggle-status`
    );
    if (response.data.success) {
      return response.data.data.user;
    }
    throw new Error(response.data.message || 'Failed to update user status');
  }

  // User-Role Management
  /**
   * Assign role to user
   */
  static async assignRoleToUser(userId: number, roleId: number): Promise<User> {
    const response = await axios.post<ApiResponse<{ user: User }>>(
      `/role-permissions/users/${userId}/roles/${roleId}`
    );
    if (response.data.success) {
      return response.data.data.user;
    }
    throw new Error(response.data.message || 'Failed to assign role');
  }

  /**
   * Remove role from user
   */
  static async removeRoleFromUser(
    userId: number,
    roleId: number
  ): Promise<User> {
    const response = await axios.delete<ApiResponse<{ user: User }>>(
      `/role-permissions/users/${userId}/roles/${roleId}`
    );
    if (response.data.success) {
      return response.data.data.user;
    }
    throw new Error(response.data.message || 'Failed to remove role');
  }

  /**
   * Assign multiple roles to user
   */
  static async assignRolesToUser(
    userId: number,
    roleIds: number[]
  ): Promise<User> {
    const response = await axios.post<ApiResponse<{ user: User }>>(
      `/users/${userId}/roles`,
      { roleIds }
    );
    if (response.data.success) {
      return response.data.data.user;
    }
    throw new Error(response.data.message || 'Failed to assign roles');
  }

  // User Statistics
  /**
   * Get user statistics (Master Admin only)
   */
  static async getUserStats(): Promise<{
    overview: {
      total_users: number;
      active_users: number;
      inactive_users: number;
      master_admins: number;
      property_admins: number;
      staff: number;
      recent_registrations: number;
    };
    users_by_property: Array<{
      property_id: number;
      count: number;
      property: {
        id: number;
        name: string;
        property_type: string;
      };
    }>;
  }> {
    const response = await axios.get<
      ApiResponse<{
        overview: {
          total_users: number;
          active_users: number;
          inactive_users: number;
          master_admins: number;
          property_admins: number;
          staff: number;
          recent_registrations: number;
        };
        users_by_property: Array<{
          property_id: number;
          count: number;
          property: {
            id: number;
            name: string;
            property_type: string;
          };
        }>;
      }>
    >('/users/stats');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch user statistics');
  }

  // Utility Methods
  /**
   * Get suggested roles based on property type
   */
  static getSuggestedRoles(
    propertyType: 'HOTEL' | 'RESTAURANT'
  ): typeof STAFF_ROLES.HOTEL {
    return STAFF_ROLES[propertyType] || [];
  }

  /**
   * Create roles for property type
   */
  static async createRolesForProperty(
    propertyType: 'HOTEL' | 'RESTAURANT'
  ): Promise<Role[]> {
    const suggestedRoles = this.getSuggestedRoles(propertyType);
    const createdRoles: Role[] = [];

    for (const roleTemplate of suggestedRoles) {
      try {
        const role = await this.createRole({
          name: roleTemplate.name,
          description: roleTemplate.description,
        });

        // Get permissions that match the template
        const permissions = await this.getPermissions();
        const matchingPermissions = permissions.filter((p) =>
          roleTemplate.permissions.includes(p.code)
        );

        if (matchingPermissions.length > 0) {
          await this.assignPermissionsToRole(
            role.id,
            matchingPermissions.map((p) => p.id)
          );
        }

        createdRoles.push(role);
      } catch (error) {
        console.warn(`Failed to create role ${roleTemplate.name}:`, error);
      }
    }

    return createdRoles;
  }
}
