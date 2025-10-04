import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';

dotenv.config();

async function createUserData() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hotel_restaurant'
    });
    
    console.log('🔍 Creating test data (forcing inserts)...');
    
    // First, ensure property exists
    await connection.execute(`
      INSERT INTO properties (id, code, name, property_type, address_line1, city, state, country, phone, email, is_active, created_at, updated_at)
      VALUES (1, 'HOTEL001', 'Grand Plaza Hotel', 'HOTEL', '123 Main Street', 'Mumbai', 'Maharashtra', 'India', '+91-9876543210', 'info@grandplaza.com', 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);
    console.log('✅ Property created/updated');
    
    // Generate password hash
    const passwordHash = await bcryptjs.hash('admin123', 12);
    console.log('🔐 Generated password hash');
    
    // Create user
    await connection.execute(`
      INSERT INTO users (id, full_name, email, user_type, property_id, password_hash, is_active, created_at, updated_at)
      VALUES (1, 'Admin User', 'admin@grandplaza.com', 'PROPERTY_ADMIN', 1, ?, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), updated_at = NOW()
    `, [passwordHash]);
    console.log('✅ User created/updated');
    
    // Create roles
    await connection.execute(`
      INSERT INTO roles (id, name, description)
      VALUES (1, 'admin', 'Full administrative access')
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `);
    console.log('✅ Role created/updated');
    
    // Create permissions
    await connection.execute(`
      INSERT INTO permissions (id, code, description) VALUES
      (1, 'view_dashboard', 'View dashboard statistics'),
      (2, 'manage_rooms', 'Manage hotel rooms'),
      (3, 'view_bookings', 'View hotel bookings'),
      (4, 'manage_users', 'Manage users and staff')
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `);
    console.log('✅ Permissions created/updated');
    
    // Link user to role
    await connection.execute(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES (1, 1)
      ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)
    `);
    console.log('✅ User-role link created/updated');
    
    // Link role to permissions
    await connection.execute(`
      INSERT INTO role_permissions (role_id, permission_id) VALUES
      (1, 1), (1, 2), (1, 3), (1, 4)
      ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
    `);
    console.log('✅ Role-permission links created/updated');
    
    // Verify the user was created
    const [userRows] = await connection.execute(`
      SELECT id, full_name, email, user_type, property_id, is_active
      FROM users WHERE email = 'admin@grandplaza.com'
    `);
    
    if (Array.isArray(userRows) && userRows.length > 0) {
      const user = userRows[0];
      console.log('');
      console.log('✅ VERIFICATION SUCCESSFUL!');
      console.log('👤 User:', user.full_name);
      console.log('📧 Email:', user.email);
      console.log('🏢 Property ID:', user.property_id);
      console.log('🔑 Password: admin123');
      console.log('');
      console.log('🌐 You can now login at: http://localhost:4201');
    } else {
      console.log('❌ User verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error creating user data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createUserData();