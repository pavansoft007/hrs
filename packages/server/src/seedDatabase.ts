import bcrypt from 'bcryptjs';
import sequelize from './config/database.js';
import {
  Permission,
  Property,
  Role,
  RolePermission,
  User,
  UserRole,
} from './models/index.js';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');

    // Check if data already exists
    const existingRolesCount = await Role.count();
    if (existingRolesCount > 0) {
      console.log('🔍 Database already has data. Skipping seeding.');
      return;
    }

    // Create Roles
    console.log('📝 Creating roles...');
    const roles = await Role.bulkCreate([
      {
        name: 'Master Admin',
        description: 'Super administrator with full system access',
      },
      {
        name: 'Property Admin',
        description: 'Administrator for a specific property',
      },
      {
        name: 'Hotel Manager',
        description: 'Manager for hotel operations',
      },
      {
        name: 'Restaurant Manager',
        description: 'Manager for restaurant operations',
      },
      {
        name: 'Front Desk Staff',
        description: 'Hotel front desk operations staff',
      },
      {
        name: 'Housekeeping Staff',
        description: 'Hotel housekeeping staff',
      },
      {
        name: 'Kitchen Staff',
        description: 'Restaurant kitchen staff',
      },
      {
        name: 'Service Staff',
        description: 'Restaurant service staff',
      },
    ]);

    // Create Permissions
    console.log('🔐 Creating permissions...');
    const permissions = await Permission.bulkCreate([
      // Property Management
      {
        code: 'property.create',
        description: 'Create new properties',
      },
      {
        code: 'property.read',
        description: 'View property information',
      },
      {
        code: 'property.update',
        description: 'Update property information',
      },
      {
        code: 'property.delete',
        description: 'Delete properties',
      },
      // User Management
      {
        code: 'user.create',
        description: 'Create new users',
      },
      {
        code: 'user.read',
        description: 'View user information',
      },
      {
        code: 'user.update',
        description: 'Update user information',
      },
      {
        code: 'user.delete',
        description: 'Delete users',
      },
      // Role Management
      {
        code: 'role.create',
        description: 'Create new roles',
      },
      {
        code: 'role.read',
        description: 'View roles',
      },
      {
        code: 'role.update',
        description: 'Update roles',
      },
      {
        code: 'role.delete',
        description: 'Delete roles',
      },
      // Hotel Operations
      {
        code: 'room.manage',
        description: 'Manage hotel rooms',
      },
      {
        code: 'booking.manage',
        description: 'Manage hotel bookings',
      },
      {
        code: 'guest.manage',
        description: 'Manage guest information',
      },
      // Restaurant Operations
      {
        code: 'menu.manage',
        description: 'Manage restaurant menu',
      },
      {
        code: 'order.manage',
        description: 'Manage restaurant orders',
      },
      {
        code: 'table.manage',
        description: 'Manage restaurant tables',
      },
      // Reports and Analytics
      {
        code: 'report.view',
        description: 'View reports and analytics',
      },
    ]);

    // Create Properties
    console.log('🏨 Creating properties...');
    const properties = await Property.bulkCreate([
      {
        code: 'PALACE001',
        name: 'Grand Palace Hotel',
        property_type: 'HOTEL',
        address_line1: '123 Royal Street',
        address_line2: 'Downtown District',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '400001',
        timezone: 'Asia/Kolkata',
        phone: '+91 22 1234 5678',
        email: 'info@grandpalace.com',
        website: 'https://grandpalace.com',
        is_active: true,
      },
      {
        code: 'DINE001',
        name: 'Fine Dining Restaurant',
        property_type: 'RESTAURANT',
        address_line1: '456 Gourmet Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '400002',
        timezone: 'Asia/Kolkata',
        phone: '+91 22 9876 5432',
        email: 'info@finedining.com',
        website: 'https://finedining.com',
        is_active: true,
      },
    ]);

    // Create Users
    console.log('👥 Creating users...');
    const saltRounds = 10;
    const users = await User.bulkCreate([
      {
        full_name: 'System Administrator',
        email: 'admin@system.com',
        phone: '+91 9999999999',
        user_type: 'MASTER_ADMIN',
        password_hash: await bcrypt.hash('admin123', saltRounds),
        is_active: true,
        property_id: undefined,
      },
      {
        full_name: 'Hotel Administrator',
        email: 'admin@hotel.com',
        phone: '+91 8888888888',
        user_type: 'PROPERTY_ADMIN',
        password_hash: await bcrypt.hash('hotel123', saltRounds),
        is_active: true,
        property_id: properties[0].id,
      },
      {
        full_name: 'Restaurant Administrator',
        email: 'admin@restaurant.com',
        phone: '+91 7777777777',
        user_type: 'PROPERTY_ADMIN',
        password_hash: await bcrypt.hash('restaurant123', saltRounds),
        is_active: true,
        property_id: properties[1].id,
      },
      {
        full_name: 'John Manager',
        email: 'manager@hotel.com',
        phone: '+91 6666666666',
        user_type: 'STAFF',
        password_hash: await bcrypt.hash('manager123', saltRounds),
        is_active: true,
        property_id: properties[0].id,
      },
      {
        full_name: 'Sarah Front Desk',
        email: 'frontdesk@hotel.com',
        phone: '+91 5555555555',
        user_type: 'STAFF',
        password_hash: await bcrypt.hash('staff123', saltRounds),
        is_active: true,
        property_id: properties[0].id,
      },
      {
        full_name: 'Chef Rodriguez',
        email: 'chef@restaurant.com',
        phone: '+91 4444444444',
        user_type: 'STAFF',
        password_hash: await bcrypt.hash('chef123', saltRounds),
        is_active: true,
        property_id: properties[1].id,
      },
      {
        full_name: 'Maria Server',
        email: 'server@restaurant.com',
        phone: '+91 3333333333',
        user_type: 'STAFF',
        password_hash: await bcrypt.hash('server123', saltRounds),
        is_active: true,
        property_id: properties[1].id,
      },
    ]);

    // Assign Roles to Users
    console.log('🔗 Assigning roles to users...');

    // Master Admin - gets Master Admin role
    await UserRole.create({
      user_id: users[0].id,
      role_id: roles[0].id, // Master Admin
    });

    // Hotel Admin - gets Property Admin role
    await UserRole.create({
      user_id: users[1].id,
      role_id: roles[1].id, // Property Admin
    });

    // Restaurant Admin - gets Property Admin role
    await UserRole.create({
      user_id: users[2].id,
      role_id: roles[1].id, // Property Admin
    });

    // Hotel Manager - gets Hotel Manager role
    await UserRole.create({
      user_id: users[3].id,
      role_id: roles[2].id, // Hotel Manager
    });

    // Front Desk Staff - gets Front Desk Staff role
    await UserRole.create({
      user_id: users[4].id,
      role_id: roles[4].id, // Front Desk Staff
    });

    // Chef - gets Kitchen Staff role
    await UserRole.create({
      user_id: users[5].id,
      role_id: roles[6].id, // Kitchen Staff
    });

    // Server - gets Service Staff role
    await UserRole.create({
      user_id: users[6].id,
      role_id: roles[7].id, // Service Staff
    });

    // Assign Permissions to Roles
    console.log('🔑 Assigning permissions to roles...');

    // Master Admin gets all permissions
    for (const permission of permissions) {
      await RolePermission.create({
        role_id: roles[0].id,
        permission_id: permission.id,
      });
    }

    // Property Admin gets most permissions (except role management)
    const propertyAdminPermissions = permissions.filter(
      (p) =>
        p.code.startsWith('property.') ||
        p.code.startsWith('user.') ||
        p.code.startsWith('room.') ||
        p.code.startsWith('booking.') ||
        p.code.startsWith('guest.') ||
        p.code.startsWith('menu.') ||
        p.code.startsWith('order.') ||
        p.code.startsWith('table.') ||
        p.code === 'report.view',
    );

    for (const permission of propertyAdminPermissions) {
      await RolePermission.create({
        role_id: roles[1].id, // Property Admin
        permission_id: permission.id,
      });
    }

    // Hotel Manager gets hotel-specific permissions
    const hotelManagerPermissions = permissions.filter(
      (p) =>
        p.code.startsWith('room.') ||
        p.code.startsWith('booking.') ||
        p.code.startsWith('guest.') ||
        p.code === 'user.read' ||
        p.code === 'report.view',
    );

    for (const permission of hotelManagerPermissions) {
      await RolePermission.create({
        role_id: roles[2].id, // Hotel Manager
        permission_id: permission.id,
      });
    }

    // Restaurant Manager gets restaurant-specific permissions
    const restaurantManagerPermissions = permissions.filter(
      (p) =>
        p.code.startsWith('menu.') ||
        p.code.startsWith('order.') ||
        p.code.startsWith('table.') ||
        p.code === 'user.read' ||
        p.code === 'report.view',
    );

    for (const permission of restaurantManagerPermissions) {
      await RolePermission.create({
        role_id: roles[3].id, // Restaurant Manager
        permission_id: permission.id,
      });
    }

    // Front Desk Staff gets limited hotel permissions
    const frontDeskPermissions = permissions.filter(
      (p) =>
        p.code === 'booking.manage' ||
        p.code === 'guest.manage' ||
        p.code === 'room.manage',
    );

    for (const permission of frontDeskPermissions) {
      await RolePermission.create({
        role_id: roles[4].id, // Front Desk Staff
        permission_id: permission.id,
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log(`- Roles: ${roles.length}`);
    console.log(`- Permissions: ${permissions.length}`);
    console.log(`- Properties: ${properties.length}`);
    console.log(`- Users: ${users.length}`);
    console.log('\n🔐 Test Accounts:');
    console.log('Master Admin: admin@system.com / admin123');
    console.log('Hotel Admin: admin@hotel.com / hotel123');
    console.log('Restaurant Admin: admin@restaurant.com / restaurant123');
    console.log('Hotel Manager: manager@hotel.com / manager123');
    console.log('Front Desk: frontdesk@hotel.com / staff123');
    console.log('Chef: chef@restaurant.com / chef123');
    console.log('Server: server@restaurant.com / server123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
