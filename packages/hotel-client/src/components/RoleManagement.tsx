import React, { useState, useEffect, useCallback } from 'react';
import {
  RoleService,
  Role,
  Permission,
  STAFF_ROLES,
} from '../services/roleService';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from './Layout';
import './RoleManagement.css';

interface RoleFormData {
  name: string;
  description: string;
  permission_ids: number[];
}

interface RoleManagementState {
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  successMessage: string | null;
  showCreateForm: boolean;
  showPermissionModal: boolean;
  editingRole: Role | null;
  selectedRole: Role | null;
}

export const RoleManagement: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [state, setState] = useState<RoleManagementState>({
    roles: [],
    permissions: [],
    loading: true,
    creating: false,
    error: null,
    successMessage: null,
    showCreateForm: false,
    showPermissionModal: false,
    editingRole: null,
    selectedRole: null,
  });

  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permission_ids: [],
  });

  const loadData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const [rolesResponse, permissionsResponse] = await Promise.all([
        RoleService.getRoles(),
        RoleService.getPermissions(),
      ]);

      setState((prev) => ({
        ...prev,
        roles: rolesResponse,
        permissions: permissionsResponse,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setState((prev) => ({ ...prev, creating: true, error: null }));

      const role = await RoleService.createRole({
        name: formData.name,
        description: formData.description,
      });

      // Assign permissions if selected
      if (formData.permission_ids.length > 0) {
        await RoleService.assignPermissionsToRole(
          role.id,
          formData.permission_ids
        );
      }

      setState((prev) => ({
        ...prev,
        creating: false,
        showCreateForm: false,
        successMessage: 'Role created successfully!',
      }));

      // Reset form
      setFormData({
        name: '',
        description: '',
        permission_ids: [],
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
        error: error instanceof Error ? error.message : 'Failed to create role',
      }));
    }
  };

  const handleDeleteRole = async (roleId: number, roleName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete role "${roleName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await RoleService.deleteRole(roleId);
      setState((prev) => ({
        ...prev,
        successMessage: 'Role deleted successfully!',
      }));
      loadData();

      setTimeout(() => {
        setState((prev) => ({ ...prev, successMessage: null }));
      }, 3000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete role',
      }));
    }
  };

  const handleManagePermissions = (role: Role) => {
    setState((prev) => ({
      ...prev,
      selectedRole: role,
      showPermissionModal: true,
    }));
  };

  const handlePermissionToggle = async (
    permissionId: number,
    isAssigned: boolean
  ) => {
    if (!state.selectedRole) return;

    try {
      if (isAssigned) {
        await RoleService.removePermissionsFromRole(state.selectedRole.id, [
          permissionId,
        ]);
      } else {
        await RoleService.assignPermissionsToRole(state.selectedRole.id, [
          permissionId,
        ]);
      }

      // Reload data to reflect changes
      loadData();

      setState((prev) => ({
        ...prev,
        successMessage: `Permission ${
          isAssigned ? 'removed from' : 'assigned to'
        } role successfully!`,
      }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, successMessage: null }));
      }, 3000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update permissions',
      }));
    }
  };

  const handleInitializePermissions = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const result = await RoleService.initializeDefaultPermissions();

      setState((prev) => ({
        ...prev,
        loading: false,
        successMessage: `Permissions initialized! ${result.created_permissions.length} new permissions created.`,
      }));

      loadData();

      setTimeout(() => {
        setState((prev) => ({ ...prev, successMessage: null }));
      }, 3000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initialize permissions',
      }));
    }
  };

  const handleCreateSuggestedRoles = async (
    propertyType: 'HOTEL' | 'RESTAURANT'
  ) => {
    try {
      setState((prev) => ({ ...prev, creating: true }));

      const createdRoles = await RoleService.createRolesForProperty(
        propertyType
      );

      setState((prev) => ({
        ...prev,
        creating: false,
        successMessage: `Created ${
          createdRoles.length
        } ${propertyType.toLowerCase()} roles successfully!`,
      }));

      loadData();

      setTimeout(() => {
        setState((prev) => ({ ...prev, successMessage: null }));
      }, 3000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        creating: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create suggested roles',
      }));
    }
  };

  // Permission checks
  const canManageRoles = currentUser?.user_type === 'MASTER_ADMIN';

  if (!canManageRoles) {
    return (
      <Layout title="Role Management">
        <div className="access-denied">
          <div className="access-denied-content">
            <span
              className="access-denied-icon"
              role="img"
              aria-label="Access Denied"
            >
              🚫
            </span>
            <h2>Access Denied</h2>
            <p>Only Master Administrators can manage roles and permissions.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (state.loading && state.roles.length === 0) {
    return (
      <Layout title="Role Management">
        <div className="role-management-loading">
          <div className="spinner"></div>
          <p>Loading roles and permissions...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Role Management">
      <div className="role-management">
        {/* Header Section */}
        <div className="role-management-header">
          <div className="header-content">
            <h1>Roles & Permissions Management</h1>
            <p>Define staff roles and control access to system features</p>
          </div>

          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={handleInitializePermissions}
              disabled={state.loading}
            >
              <span role="img" aria-label="Initialize">
                ⚙️
              </span>
              Initialize Permissions
            </button>

            <button
              className="btn btn-primary"
              onClick={() =>
                setState((prev) => ({ ...prev, showCreateForm: true }))
              }
            >
              <span role="img" aria-label="Add">
                ➕
              </span>
              Create Role
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {state.error && (
          <div className="alert alert-error">
            <span role="img" aria-label="Error">
              ⚠️
            </span>
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
            <span role="img" aria-label="Success">
              ✅
            </span>
            {state.successMessage}
          </div>
        )}

        {/* Quick Setup Section */}
        {state.permissions.length === 0 && (
          <div className="setup-section">
            <div className="setup-card">
              <h3>Quick Setup</h3>
              <p>
                Get started quickly by initializing default permissions and
                creating pre-defined roles for your property type.
              </p>

              <div className="setup-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleInitializePermissions}
                  disabled={state.loading}
                >
                  Initialize Default Permissions
                </button>
              </div>
            </div>
          </div>
        )}

        {state.permissions.length > 0 && (
          <>
            {/* Suggested Roles Section */}
            <div className="suggested-roles-section">
              <h2>Quick Role Setup</h2>
              <p>
                Create pre-defined roles for your property type with appropriate
                permissions.
              </p>

              <div className="suggested-roles-grid">
                <div className="suggestion-card">
                  <div className="suggestion-header">
                    <span
                      className="suggestion-icon"
                      role="img"
                      aria-label="Hotel"
                    >
                      🏨
                    </span>
                    <h3>Hotel Roles</h3>
                  </div>
                  <div className="suggestion-content">
                    <p>
                      Create roles for hotel operations including front desk,
                      housekeeping, and management positions.
                    </p>
                    <div className="suggested-list">
                      {STAFF_ROLES.HOTEL.slice(0, 3).map((role, index) => (
                        <div key={index} className="suggested-item">
                          <span className="suggested-name">{role.name}</span>
                        </div>
                      ))}
                      {STAFF_ROLES.HOTEL.length > 3 && (
                        <div className="suggested-item more">
                          +{STAFF_ROLES.HOTEL.length - 3} more roles
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-outline suggestion-btn"
                    onClick={() => handleCreateSuggestedRoles('HOTEL')}
                    disabled={state.creating}
                  >
                    Create Hotel Roles
                  </button>
                </div>

                <div className="suggestion-card">
                  <div className="suggestion-header">
                    <span
                      className="suggestion-icon"
                      role="img"
                      aria-label="Restaurant"
                    >
                      🍽️
                    </span>
                    <h3>Restaurant Roles</h3>
                  </div>
                  <div className="suggestion-content">
                    <p>
                      Create roles for restaurant operations including kitchen
                      staff, waiters, and management positions.
                    </p>
                    <div className="suggested-list">
                      {STAFF_ROLES.RESTAURANT.slice(0, 3).map((role, index) => (
                        <div key={index} className="suggested-item">
                          <span className="suggested-name">{role.name}</span>
                        </div>
                      ))}
                      {STAFF_ROLES.RESTAURANT.length > 3 && (
                        <div className="suggested-item more">
                          +{STAFF_ROLES.RESTAURANT.length - 3} more roles
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-outline suggestion-btn"
                    onClick={() => handleCreateSuggestedRoles('RESTAURANT')}
                    disabled={state.creating}
                  >
                    Create Restaurant Roles
                  </button>
                </div>
              </div>
            </div>

            {/* Roles Grid */}
            <div className="roles-section">
              <h2>Current Roles ({state.roles.length})</h2>

              {state.roles.length === 0 ? (
                <div className="no-roles">
                  <div
                    className="no-roles-icon"
                    role="img"
                    aria-label="No Roles"
                  >
                    👥
                  </div>
                  <h3>No Roles Created</h3>
                  <p>
                    Create your first role to start managing staff permissions.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      setState((prev) => ({ ...prev, showCreateForm: true }))
                    }
                  >
                    Create First Role
                  </button>
                </div>
              ) : (
                <div className="roles-grid">
                  {state.roles.map((role) => (
                    <div key={role.id} className="role-card">
                      <div className="role-card-header">
                        <div className="role-info">
                          <h3 className="role-name">{role.name}</h3>
                          <p className="role-description">{role.description}</p>
                        </div>

                        <div className="role-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleManagePermissions(role)}
                            title="Manage Permissions"
                          >
                            <span role="img" aria-label="Permissions">
                              🔐
                            </span>
                          </button>

                          <button
                            className="btn btn-sm btn-outline delete-btn"
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            title="Delete Role"
                          >
                            <span role="img" aria-label="Delete">
                              🗑️
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="role-stats">
                        <div className="stat-item">
                          <span className="stat-number">
                            {role.permissions?.length || 0}
                          </span>
                          <span className="stat-label">Permissions</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-number">
                            {role.users?.length || 0}
                          </span>
                          <span className="stat-label">Users</span>
                        </div>
                      </div>

                      {role.permissions && role.permissions.length > 0 && (
                        <div className="role-permissions-preview">
                          <h4>Permissions:</h4>
                          <div className="permissions-tags">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <span
                                key={permission.id}
                                className="permission-tag"
                              >
                                {permission.code}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="permission-tag more">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Create Role Modal */}
        {state.showCreateForm && (
          <div className="modal-overlay">
            <div className="modal create-role-modal">
              <div className="modal-header">
                <h2>Create New Role</h2>
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

              <form onSubmit={handleCreateRole} className="create-role-form">
                <div className="form-group">
                  <label>Role Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Front Desk Agent, Housekeeping Manager"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the role responsibilities and duties"
                    rows={3}
                  />
                </div>

                {state.permissions.length > 0 && (
                  <div className="form-group permissions-group">
                    <label>Assign Permissions (Optional)</label>
                    <div className="permissions-grid">
                      {state.permissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="permission-checkbox"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permission_ids.includes(
                              permission.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  permission_ids: [
                                    ...prev.permission_ids,
                                    permission.id,
                                  ],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  permission_ids: prev.permission_ids.filter(
                                    (id) => id !== permission.id
                                  ),
                                }));
                              }
                            }}
                          />
                          <div className="permission-info">
                            <span className="permission-code">
                              {permission.code}
                            </span>
                            <span className="permission-description">
                              {permission.description}
                            </span>
                          </div>
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
                      'Create Role'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Permissions Management Modal */}
        {state.showPermissionModal && state.selectedRole && (
          <div className="modal-overlay">
            <div className="modal permissions-modal">
              <div className="modal-header">
                <h2>Manage Permissions: {state.selectedRole.name}</h2>
                <button
                  className="modal-close"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      showPermissionModal: false,
                      selectedRole: null,
                    }))
                  }
                >
                  ×
                </button>
              </div>

              <div className="permissions-management">
                <div className="permissions-list">
                  {state.permissions.map((permission) => {
                    const isAssigned =
                      state.selectedRole?.permissions?.some(
                        (p) => p.id === permission.id
                      ) || false;

                    return (
                      <div
                        key={permission.id}
                        className={`permission-item ${
                          isAssigned ? 'assigned' : ''
                        }`}
                      >
                        <div className="permission-details">
                          <span className="permission-code">
                            {permission.code}
                          </span>
                          <span className="permission-description">
                            {permission.description}
                          </span>
                        </div>

                        <button
                          className={`btn btn-sm ${
                            isAssigned ? 'btn-secondary' : 'btn-primary'
                          }`}
                          onClick={() =>
                            handlePermissionToggle(permission.id, isAssigned)
                          }
                        >
                          {isAssigned ? 'Remove' : 'Assign'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      showPermissionModal: false,
                      selectedRole: null,
                    }))
                  }
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
