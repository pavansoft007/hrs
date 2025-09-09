import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface UserAttributes {
  id: number;
  property_id?: number;
  full_name: string;
  email?: string;
  phone?: string;
  user_type: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
  password_hash?: string;
  is_active: boolean;
  last_login?: Date;
  email_verified_at?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  refresh_token?: string;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public property_id!: number;
  public full_name!: string;
  public email!: string;
  public phone!: string;
  public user_type!: 'MASTER_ADMIN' | 'PROPERTY_ADMIN' | 'STAFF';
  public password_hash!: string;
  public is_active!: boolean;
  public last_login!: Date;
  public email_verified_at!: Date;
  public password_reset_token!: string;
  public password_reset_expires!: Date;
  public refresh_token!: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public roles?: Role[];
  public property?: Property;

  // Association methods
  public addRole!: (role: Role) => Promise<void>;
  public addRoles!: (roles: Role[]) => Promise<void>;
  public setRoles!: (roles: Role[]) => Promise<void>;
  public removeRole!: (role: Role) => Promise<void>;
  public removeRoles!: (roles: Role[]) => Promise<void>;
  public hasRole!: (role: Role) => Promise<boolean>;
  public hasRoles!: (roles: Role[]) => Promise<boolean>;
  public countRoles!: () => Promise<number>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: true,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    user_type: {
      type: DataTypes.ENUM('MASTER_ADMIN', 'PROPERTY_ADMIN', 'STAFF'),
      defaultValue: 'STAFF',
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
  },
);

// Property Model
interface PropertyAttributes {
  id: number;
  code: string;
  name: string;
  property_type: 'HOTEL' | 'RESTAURANT';
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  timezone: string;
  gstin?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface PropertyCreationAttributes
  extends Optional<PropertyAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Property
  extends Model<PropertyAttributes, PropertyCreationAttributes>
  implements PropertyAttributes
{
  public id!: number;
  public code!: string;
  public name!: string;
  public property_type!: 'HOTEL' | 'RESTAURANT';
  public address_line1!: string;
  public address_line2!: string;
  public city!: string;
  public state!: string;
  public country!: string;
  public postal_code!: string;
  public timezone!: string;
  public gstin!: string;
  public phone!: string;
  public email!: string;
  public website!: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public users?: User[];
}

Property.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    property_type: {
      type: DataTypes.ENUM('HOTEL', 'RESTAURANT'),
      allowNull: false,
    },
    address_line1: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    address_line2: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING(64),
      defaultValue: 'Asia/Kolkata',
    },
    gstin: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'properties',
    underscored: true,
  },
);

// Role Model
interface RoleAttributes {
  id: number;
  name: string;
  description?: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id'> {}

class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;

  // Associations
  public permissions?: Permission[];
  public users?: User[];

  // Association methods
  public setPermissions!: (permissions: Permission[]) => Promise<void>;
  public addPermission!: (permission: Permission) => Promise<void>;
  public removePermission!: (permission: Permission) => Promise<void>;
  public removePermissions!: (permissions: Permission[]) => Promise<void>;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'roles',
    timestamps: false,
  },
);

// Permission Model
interface PermissionAttributes {
  id: number;
  code: string;
  description?: string;
}

interface PermissionCreationAttributes
  extends Optional<PermissionAttributes, 'id'> {}

class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  public id!: number;
  public code!: string;
  public description!: string;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'permissions',
    timestamps: false,
  },
);

// Define associations
User.belongsToMany(Role, {
  through: 'user_roles',
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles',
  timestamps: false,
});

Role.belongsToMany(User, {
  through: 'user_roles',
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users',
  timestamps: false,
});

Role.belongsToMany(Permission, {
  through: 'role_permissions',
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
  timestamps: false,
});

Permission.belongsToMany(Role, {
  through: 'role_permissions',
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
  timestamps: false,
});

User.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });
Property.hasMany(User, { foreignKey: 'property_id', as: 'users' });

// Junction table models for manual creation
class UserRole extends Model {
  public user_id!: number;
  public role_id!: number;
}

UserRole.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Role,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    timestamps: false,
  },
);

class RolePermission extends Model {
  public role_id!: number;
  public permission_id!: number;
}

RolePermission.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Role,
        key: 'id',
      },
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Permission,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    timestamps: false,
  },
);

export { Permission, Property, Role, RolePermission, User, UserRole };
