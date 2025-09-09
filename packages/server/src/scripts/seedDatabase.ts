import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import { Permission, Property, Role, User } from '../models/index.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync the database first
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');

    // Check if we already have data
    const existingRoleCount = await Role.count();
    const existingUserCount = await User.count();

    if (existingRoleCount > 0 && existingUserCount > 0) {
      console.log('✅ Database already seeded. Skipping...');
      return;
    }

    // Create default permissions
    const permissions = await Permission.bulkCreate([
      // Master Admin Permissions
      { code: 'system.admin', description: 'Full system administration' },
      { code: 'properties.create', description: 'Create new properties' },
      { code: 'properties.manage', description: 'Manage all properties' },
      { code: 'users.manage', description: 'Manage all users' },
      { code: 'roles.manage', description: 'Manage roles and permissions' },

      // Property Management
      { code: 'property.view', description: 'View property information' },
      { code: 'property.manage', description: 'Manage property settings' },

      // Hotel Management
      { code: 'hotel.rooms.view', description: 'View room information' },
      { code: 'hotel.rooms.manage', description: 'Manage rooms and bookings' },
      { code: 'hotel.guests.view', description: 'View guest information' },
      { code: 'hotel.guests.manage', description: 'Manage guest accounts' },

      // Restaurant Management
      { code: 'restaurant.menu.view', description: 'View menu items' },
      {
        code: 'restaurant.menu.manage',
        description: 'Manage menu and pricing',
      },
      { code: 'restaurant.orders.view', description: 'View orders' },
      {
        code: 'restaurant.orders.manage',
        description: 'Manage orders and kitchen',
      },

      // Staff Management
      { code: 'staff.view', description: 'View staff information' },
      { code: 'staff.manage', description: 'Manage staff accounts' },

      // Reports and Analytics
      { code: 'reports.view', description: 'View reports and analytics' },
      { code: 'reports.export', description: 'Export reports and data' },
    ]);
    console.log(`✅ Created ${permissions.length} permissions`);

    // Create default roles
    const masterAdminRole = await Role.create({
      name: 'Master Admin',
      description: 'Full system access and control',
    });

    const propertyAdminRole = await Role.create({
      name: 'Property Admin',
      description: 'Manage specific property operations',
    });

    const hotelManagerRole = await Role.create({
      name: 'Hotel Manager',
      description: 'Hotel operations management',
    });

    const restaurantManagerRole = await Role.create({
      name: 'Restaurant Manager',
      description: 'Restaurant operations management',
    });

    const frontDeskRole = await Role.create({
      name: 'Front Desk Staff',
      description: 'Guest check-in/out and service',
    });

    const waiterRole = await Role.create({
      name: 'Waiter',
      description: 'Customer service and order management',
    });

    const chefRole = await Role.create({
      name: 'Chef',
      description: 'Kitchen operations and menu management',
    });

    const housekeepingRole = await Role.create({
      name: 'Housekeeping',
      description: 'Room cleaning and maintenance',
    });

    console.log('✅ Created default roles');

    // Assign permissions to roles
    await masterAdminRole.setPermissions(permissions); // Master admin gets all permissions

    const propertyAdminPermissions = permissions.filter((p) =>
      [
        'property.view',
        'property.manage',
        'hotel.rooms.view',
        'hotel.rooms.manage',
        'hotel.guests.view',
        'hotel.guests.manage',
        'restaurant.menu.view',
        'restaurant.menu.manage',
        'restaurant.orders.view',
        'restaurant.orders.manage',
        'staff.view',
        'staff.manage',
        'reports.view',
      ].includes(p.code),
    );
    await propertyAdminRole.setPermissions(propertyAdminPermissions);

    const hotelManagerPermissions = permissions.filter((p) =>
      [
        'property.view',
        'hotel.rooms.view',
        'hotel.rooms.manage',
        'hotel.guests.view',
        'hotel.guests.manage',
        'staff.view',
        'reports.view',
      ].includes(p.code),
    );
    await hotelManagerRole.setPermissions(hotelManagerPermissions);

    const restaurantManagerPermissions = permissions.filter((p) =>
      [
        'property.view',
        'restaurant.menu.view',
        'restaurant.menu.manage',
        'restaurant.orders.view',
        'restaurant.orders.manage',
        'staff.view',
        'reports.view',
      ].includes(p.code),
    );
    await restaurantManagerRole.setPermissions(restaurantManagerPermissions);

    const frontDeskPermissions = permissions.filter((p) =>
      [
        'property.view',
        'hotel.rooms.view',
        'hotel.guests.view',
        'hotel.guests.manage',
      ].includes(p.code),
    );
    await frontDeskRole.setPermissions(frontDeskPermissions);

    const waiterPermissions = permissions.filter((p) =>
      [
        'property.view',
        'restaurant.menu.view',
        'restaurant.orders.view',
        'restaurant.orders.manage',
      ].includes(p.code),
    );
    await waiterRole.setPermissions(waiterPermissions);

    const chefPermissions = permissions.filter((p) =>
      [
        'property.view',
        'restaurant.menu.view',
        'restaurant.orders.view',
        'restaurant.orders.manage',
      ].includes(p.code),
    );
    await chefRole.setPermissions(chefPermissions);

    const housekeepingPermissions = permissions.filter((p) =>
      ['property.view', 'hotel.rooms.view'].includes(p.code),
    );
    await housekeepingRole.setPermissions(housekeepingPermissions);

    console.log('✅ Assigned permissions to roles');

    // Create sample properties
    const grandHotel = await Property.create({
      code: 'GH001',
      name: 'Grand Palace Hotel',
      property_type: 'HOTEL',
      address_line1: '123 Luxury Avenue',
      address_line2: 'Suite 100',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postal_code: '400001',
      timezone: 'Asia/Kolkata',
      gstin: '27AAACG1234B1Z5',
      phone: '+91-22-1234-5678',
      email: 'info@grandpalace.com',
      website: 'https://grandpalace.com',
      is_active: true,
    });

    const fineRestaurant = await Property.create({
      code: 'FR001',
      name: 'Fine Dining Restaurant',
      property_type: 'RESTAURANT',
      address_line1: '456 Gourmet Street',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      postal_code: '110001',
      timezone: 'Asia/Kolkata',
      gstin: '07AAACG1234B1Z5',
      phone: '+91-11-9876-5432',
      email: 'info@finedining.com',
      website: 'https://finedining.com',
      is_active: true,
    });

    console.log('✅ Created sample properties');

    // Create sample users
    const masterAdminPassword = await bcrypt.hash('Admin@123', 12);
    const masterAdmin = await User.create({
      full_name: 'Master Administrator',
      email: 'admin@admin.com',
      phone: '+91-98765-43210',
      user_type: 'MASTER_ADMIN',
      password_hash: masterAdminPassword,
      is_active: true,
    });
    await masterAdmin.addRole(masterAdminRole);

    const hotelAdminPassword = await bcrypt.hash('Hotel@123', 12);
    const hotelAdmin = await User.create({
      full_name: 'Hotel Administrator',
      email: 'hotel.admin@grandpalace.com',
      phone: '+91-98765-43211',
      user_type: 'PROPERTY_ADMIN',
      property_id: grandHotel.id,
      password_hash: hotelAdminPassword,
      is_active: true,
    });
    await hotelAdmin.addRole(propertyAdminRole);

    const restaurantAdminPassword = await bcrypt.hash('Restaurant@123', 12);
    const restaurantAdmin = await User.create({
      full_name: 'Restaurant Administrator',
      email: 'restaurant.admin@finedining.com',
      phone: '+91-98765-43212',
      user_type: 'PROPERTY_ADMIN',
      property_id: fineRestaurant.id,
      password_hash: restaurantAdminPassword,
      is_active: true,
    });
    await restaurantAdmin.addRole(propertyAdminRole);

    const hotelManagerPassword = await bcrypt.hash('Manager@123', 12);
    const hotelManager = await User.create({
      full_name: 'John Smith',
      email: 'manager@grandpalace.com',
      phone: '+91-98765-43213',
      user_type: 'STAFF',
      property_id: grandHotel.id,
      password_hash: hotelManagerPassword,
      is_active: true,
    });
    await hotelManager.addRole(hotelManagerRole);

    const restaurantManagerPassword = await bcrypt.hash('Chef@123', 12);
    const restaurantManagerUser = await User.create({
      full_name: 'Maria Garcia',
      email: 'chef@finedining.com',
      phone: '+91-98765-43214',
      user_type: 'STAFF',
      property_id: fineRestaurant.id,
      password_hash: restaurantManagerPassword,
      is_active: true,
    });
    await restaurantManagerUser.addRole(restaurantManagerRole);

    // Create more staff members
    const frontDeskPassword = await bcrypt.hash('Staff@123', 12);
    const frontDeskStaff = await User.create({
      full_name: 'Alice Johnson',
      email: 'frontdesk@grandpalace.com',
      phone: '+91-98765-43215',
      user_type: 'STAFF',
      property_id: grandHotel.id,
      password_hash: frontDeskPassword,
      is_active: true,
    });
    await frontDeskStaff.addRole(frontDeskRole);

    const waiterPassword = await bcrypt.hash('Waiter@123', 12);
    const waiterStaff = await User.create({
      full_name: 'Carlos Rodriguez',
      email: 'waiter@finedining.com',
      phone: '+91-98765-43216',
      user_type: 'STAFF',
      property_id: fineRestaurant.id,
      password_hash: waiterPassword,
      is_active: true,
    });
    await waiterStaff.addRole(waiterRole);

    console.log('✅ Created sample users with roles');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Master Admin: admin@admin.com / Admin@123');
    console.log('Hotel Admin: hotel.admin@grandpalace.com / Hotel@123');
    console.log(
      'Restaurant Admin: restaurant.admin@finedining.com / Restaurant@123',
    );
    console.log('Hotel Manager: manager@grandpalace.com / Manager@123');
    console.log('Restaurant Manager: chef@finedining.com / Chef@123');
    console.log('Front Desk: frontdesk@grandpalace.com / Staff@123');
    console.log('Waiter: waiter@finedining.com / Waiter@123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();
