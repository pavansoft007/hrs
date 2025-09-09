import axios from '../utils/api';

export interface User {
  id?: number;
  property_id?: number;
  full_name: string;
  email?: string;
  phone?: string;
  user_type: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
  is_active: boolean;
  last_login?: Date;
  email_verified_at?: Date;
  created_at: Date;
  updated_at: Date;
  property?: {
    id: number;
    name: string;
    code: string;
  };
  roles?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
}

export interface CreateUserRequest {
  full_name: string;
  email?: string;
  phone?: string;
  password: string;
  user_type: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
  property_id?: number;
  role_ids?: number[];
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  user_type?: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
  property_id?: number;
  is_active?: boolean;
  role_ids?: number[];
}

export interface UpdateUserPasswordRequest {
  current_password: string;
  new_password: string;
}

class UserService {
  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    const response = await axios.get('/users');
    return response.data.data.users;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    const response = await axios.get(`/users/${id}`);
    return response.data.data.user;
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await axios.post('/users', userData);
    return response.data.data.user;
  }

  /**
   * Update user
   */
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await axios.put(`/users/${id}`, userData);
    return response.data.data.user;
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    await axios.delete(`/users/${id}`);
  }

  /**
   * Update user password
   */
  async updateUserPassword(
    id: number,
    passwordData: UpdateUserPasswordRequest,
  ): Promise<void> {
    await axios.patch(`/users/${id}/password`, passwordData);
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(id: number): Promise<User> {
    const response = await axios.patch(`/users/${id}/status`);
    return response.data.user;
  }

  /**
   * Get user roles
   */
  async getUserRoles(
    id: number,
  ): Promise<Array<{ id: number; name: string; description?: string }>> {
    const response = await axios.get(`/users/${id}/roles`);
    return response.data.roles;
  }

  /**
   * Update user roles
   */
  async updateUserRoles(id: number, roleIds: number[]): Promise<void> {
    await axios.patch(`/users/${id}/roles`, { role_ids: roleIds });
  }

  /**
   * Get users by property ID
   */
  async getUsersByProperty(propertyId: number): Promise<User[]> {
    const response = await axios.get(`/users/property/${propertyId}`);
    return response.data.users;
  }

  /**
   * Assign user to property
   */
  async assignUserToProperty(
    userId: number,
    propertyId: number,
  ): Promise<User> {
    const response = await axios.patch(`/users/${userId}/assign`, {
      property_id: propertyId,
    });
    return response.data.user;
  }

  /**
   * Remove user from property
   */
  async removeUserFromProperty(userId: number): Promise<User> {
    const response = await axios.patch(`/users/${userId}/unassign`);
    return response.data.user;
  }
}

export const userService = new UserService();
