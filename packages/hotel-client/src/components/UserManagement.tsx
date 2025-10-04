import React, { useState, useEffect, useCallback } from 'react';
import { RoleService, User, Role } from '../services/roleService';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from './Layout';
import './UserManagement.css';

interface CreateUserFormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  user_type: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
  property_id: number;
  role_ids: number[];
}

interface UserManagementState {
  users: User[];
  roles: Role[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  successMessage: string | null;
  showCreateForm: boolean;
  editingUser: User | null;
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  searchTerm: string;
  filterUserType: string;
  filterActive: string;
}

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [state, setState] = useState<UserManagementState>({
    users: [],
    roles: [],
    loading: true,
    creating: false,
    error: null,
    successMessage: null,
    showCreateForm: false,
    editingUser: null,
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    searchTerm: '',
    filterUserType: '',
    filterActive: 'all',
  });

  const [formData, setFormData] = useState<CreateUserFormData>({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    user_type: 'STAFF',
    property_id: currentUser?.property_id || 0,
    role_ids: [],
  });

  const loadData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const [usersResponse, rolesResponse] = await Promise.all([
        RoleService.getUsers({
          page: state.currentPage,
          limit: 10,
          search: state.searchTerm || undefined,
          user_type: state.filterUserType || undefined,
          is_active:
            state.filterActive === 'all'
              ? undefined
              : state.filterActive === 'true',
          property_id:
            currentUser?.user_type === 'MASTER_ADMIN'
              ? undefined
              : currentUser?.property_id,
        }),
        RoleService.getRoles(),
      ]);

      setState((prev) => ({
        ...prev,
        users: usersResponse.users || [],
        roles: rolesResponse,
        totalPages: usersResponse.pagination?.total_pages || 1,
        totalUsers: usersResponse.pagination?.total_items || 0,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false,
      }));
    }
  }, [
    state.currentPage,
    state.searchTerm,
    state.filterUserType,
    state.filterActive,
    currentUser,
  ]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setState((prev) => ({ ...prev, error: 'Passwords do not match' }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, creating: true, error: null }));

      await RoleService.createUser({
        full_name: formData.full_name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password || undefined,
        user_type: formData.user_type,
        property_id: formData.property_id || undefined,
        role_ids: formData.role_ids.length > 0 ? formData.role_ids : undefined,
      });

      setState((prev) => ({
        ...prev,
        creating: false,
        showCreateForm: false,
        successMessage: 'User created successfully!',
      }));

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        user_type: 'STAFF',
        property_id: currentUser?.property_id || 0,
        role_ids: [],
      });

      // Reload data
      loadData();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, successMessage: null }));
      }, 3000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        creating: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      }));
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      await RoleService.toggleUserStatus(userId);
      setState((prev) => ({
        ...prev,
        successMessage: 'User status updated successfully!',
      }));
      loadData();

      setTimeout(() => {
        setState((prev) => ({ ...prev, successMessage: null }));
      }, 3000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update user status',
      }));
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await RoleService.deleteUser(userId);
      setState((prev) => ({
        ...prev,
        successMessage: 'User deleted successfully!',
      }));
      loadData();

      setTimeout(() => {
        setState((prev) => ({ ...prev, successMessage: null }));
      }, 3000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      }));
    }
  };

  const handleSearch = (searchTerm: string) => {
    setState((prev) => ({
      ...prev,
      searchTerm,
      currentPage: 1, // Reset to first page when searching
    }));
  };

  const handleFilterChange = (
    filterType: 'userType' | 'active',
    value: string
  ) => {
    setState((prev) => ({
      ...prev,
      [filterType === 'userType' ? 'filterUserType' : 'filterActive']: value,
      currentPage: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  // Permission checks
  const canCreateUsers =
    currentUser?.user_type === 'MASTER_ADMIN' ||
    currentUser?.user_type === 'PROPERTY_ADMIN';
  const canManageAllUsers = currentUser?.user_type === 'MASTER_ADMIN';

  if (state.loading && state.users.length === 0) {
    return (
      <Layout title="User Management">
        <div className="user-management-loading">
          <div className="spinner"></div>
          <p>Loading users and roles...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
      <div className="user-management">
        {/* Header Section */}
        <div className="user-management-header">
          <div className="header-content">
            <h1>Staff & User Management</h1>
            <p>
              Manage staff accounts, roles, and permissions for your property
            </p>
          </div>

          {canCreateUsers && (
            <button
              className="btn btn-primary create-user-btn"
              onClick={() =>
                setState((prev) => ({ ...prev, showCreateForm: true }))
              }
            >
              <span className="icon">👤</span>
              Add New User
            </button>
          )}
        </div>

        {/* Alert Messages */}
        {state.error && (
          <div className="alert alert-error">
            <span className="icon">⚠️</span>
            {state.error}
            <button
              className="alert-close"
              onClick={() => setState((prev) => ({ ...prev, error: null }))}
            >
              ×
            </button>
          </div>
        )}

        {state.successMessage && (
          <div className="alert alert-success">
            <span className="icon">✅</span>
            {state.successMessage}
          </div>
        )}

        {/* Search and Filters */}
        <div className="user-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={state.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filters">
            <select
              value={state.filterUserType}
              onChange={(e) => handleFilterChange('userType', e.target.value)}
              className="filter-select"
            >
              <option value="">All User Types</option>
              <option value="MASTER_ADMIN">Master Admin</option>
              <option value="PROPERTY_ADMIN">Property Admin</option>
              <option value="STAFF">Staff</option>
            </select>

            <select
              value={state.filterActive}
              onChange={(e) => handleFilterChange('active', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Users Summary */}
        <div className="users-summary">
          <div className="summary-card">
            <span className="summary-number">{state.totalUsers}</span>
            <span className="summary-label">Total Users</span>
          </div>
          <div className="summary-card">
            <span className="summary-number">
              {state.users.filter((u) => u.is_active).length}
            </span>
            <span className="summary-label">Active Users</span>
          </div>
          <div className="summary-card">
            <span className="summary-number">
              {state.users.filter((u) => u.user_type === 'STAFF').length}
            </span>
            <span className="summary-label">Staff Members</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role & Type</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map((user) => (
                <tr key={user.id} className={!user.is_active ? 'inactive' : ''}>
                  <td className="user-info">
                    <div className="user-avatar">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.full_name}</div>
                      <div className="user-id">ID: {user.id}</div>
                    </div>
                  </td>

                  <td className="contact-info">
                    {user.email && (
                      <div className="contact-item">
                        <span className="contact-icon">📧</span>
                        {user.email}
                      </div>
                    )}
                    {user.phone && (
                      <div className="contact-item">
                        <span className="contact-icon">📞</span>
                        {user.phone}
                      </div>
                    )}
                  </td>

                  <td className="role-info">
                    <div
                      className={`user-type-badge ${user.user_type.toLowerCase()}`}
                    >
                      {user.user_type.replace('_', ' ')}
                    </div>
                    {user.roles && user.roles.length > 0 ? (
                      <div className="user-roles">
                        {user.roles.slice(0, 2).map((role) => (
                          <span key={role.id} className="role-badge">
                            {role.name}
                          </span>
                        ))}
                        {user.roles.length > 2 && (
                          <span className="role-badge more">
                            +{user.roles.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="no-roles">No roles assigned</div>
                    )}
                  </td>

                  <td className="status-info">
                    <span
                      className={`status-badge ${
                        user.is_active ? 'active' : 'inactive'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="last-login">
                    {user.last_login ? (
                      <div className="login-info">
                        <div className="login-date">
                          {new Date(user.last_login).toLocaleDateString()}
                        </div>
                        <div className="login-time">
                          {new Date(user.last_login).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <span className="never-logged-in">Never logged in</span>
                    )}
                  </td>

                  <td className="user-actions">
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline view-btn"
                        title="View Details"
                      >
                        👁️
                      </button>

                      {(canManageAllUsers ||
                        (currentUser?.user_type === 'PROPERTY_ADMIN' &&
                          user.property_id === currentUser.property_id)) && (
                        <>
                          <button
                            className="btn btn-sm btn-outline edit-btn"
                            title="Edit User"
                          >
                            ✏️
                          </button>

                          <button
                            className={`btn btn-sm btn-outline status-btn ${
                              user.is_active ? 'deactivate' : 'activate'
                            }`}
                            title={
                              user.is_active
                                ? 'Deactivate User'
                                : 'Activate User'
                            }
                            onClick={() => handleToggleUserStatus(user.id)}
                          >
                            {user.is_active ? '🔒' : '🔓'}
                          </button>

                          {user.id !== currentUser?.id && (
                            <button
                              className="btn btn-sm btn-outline delete-btn"
                              title="Delete User"
                              onClick={() =>
                                handleDeleteUser(user.id, user.full_name)
                              }
                            >
                              🗑️
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {state.users.length === 0 && !state.loading && (
            <div className="no-users">
              <div className="no-users-icon">👥</div>
              <h3>No Users Found</h3>
              <p>
                {state.searchTerm ||
                state.filterUserType ||
                state.filterActive !== 'all'
                  ? 'No users match your search criteria.'
                  : 'No users have been created yet.'}
              </p>
              {canCreateUsers && (
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setState((prev) => ({ ...prev, showCreateForm: true }))
                  }
                >
                  Create First User
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {state.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-sm"
              disabled={state.currentPage === 1}
              onClick={() => handlePageChange(state.currentPage - 1)}
            >
              Previous
            </button>

            <div className="page-numbers">
              {Array.from({ length: Math.min(5, state.totalPages) }, (_, i) => {
                const page = Math.max(1, state.currentPage - 2) + i;
                if (page <= state.totalPages) {
                  return (
                    <button
                      key={page}
                      className={`btn btn-sm page-btn ${
                        page === state.currentPage ? 'active' : ''
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <button
              className="btn btn-sm"
              disabled={state.currentPage === state.totalPages}
              onClick={() => handlePageChange(state.currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}

        {/* Create User Modal */}
        {state.showCreateForm && (
          <div className="modal-overlay">
            <div className="modal create-user-modal">
              <div className="modal-header">
                <h2>Create New User</h2>
                <button
                  className="modal-close"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      showCreateForm: false,
                      error: null,
                    }))
                  }
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="create-user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>User Type *</label>
                    <select
                      required
                      value={formData.user_type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          user_type: e.target.value as
                            | 'MASTER_ADMIN'
                            | 'PROPERTY_ADMIN'
                            | 'STAFF',
                        }))
                      }
                    >
                      {canManageAllUsers && (
                        <option value="MASTER_ADMIN">Master Admin</option>
                      )}
                      {canManageAllUsers && (
                        <option value="PROPERTY_ADMIN">Property Admin</option>
                      )}
                      <option value="STAFF">Staff</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Enter password"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                {state.roles.length > 0 && (
                  <div className="form-group roles-group">
                    <label>Assign Roles (Optional)</label>
                    <div className="roles-grid">
                      {state.roles.map((role) => (
                        <label key={role.id} className="role-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.role_ids.includes(role.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  role_ids: [...prev.role_ids, role.id],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  role_ids: prev.role_ids.filter(
                                    (id) => id !== role.id
                                  ),
                                }));
                              }
                            }}
                          />
                          <span className="role-info">
                            <span className="role-name">{role.name}</span>
                            <span className="role-description">
                              {role.description}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        showCreateForm: false,
                        error: null,
                      }))
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={state.creating}
                  >
                    {state.creating ? (
                      <>
                        <span className="spinner-small"></span>
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
