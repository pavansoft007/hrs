import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Creating test data for hotel management system...');

async function createTestData() {
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
    
    console.log('✅ Database connected successfully');
    
    // Insert test property
    await connection.execute(`
      INSERT IGNORE INTO properties (id, code, name, property_type, address_line1, city, state, country, phone, email, is_active, created_at, updated_at)
      VALUES (1, 'HOTEL001', 'Grand Plaza Hotel', 'HOTEL', '123 Main Street', 'Mumbai', 'Maharashtra', 'India', '+91-9876543210', 'info@grandplaza.com', 1, NOW(), NOW())
    `);
    
    // Insert test user (password: admin123 - pre-hashed with bcrypt)
    const passwordHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    await connection.execute(`
      INSERT IGNORE INTO users (id, full_name, email, user_type, property_id, password_hash, is_active, created_at, updated_at)
      VALUES (1, 'Admin User', 'admin@grandplaza.com', 'PROPERTY_ADMIN', 1, ?, 1, NOW(), NOW())
    `, [passwordHash]);
    
    // Insert test roles
    await connection.execute(`
      INSERT IGNORE INTO roles (id, name, description)
      VALUES 
      (1, 'admin', 'Full administrative access'),
      (2, 'manager', 'Hotel management access'),
      (3, 'staff', 'Basic staff access')
    `);
    
    // Insert test permissions
    await connection.execute(`
      INSERT IGNORE INTO permissions (id, code, description)
      VALUES 
      (1, 'view_dashboard', 'View dashboard statistics'),
      (2, 'manage_rooms', 'Manage hotel rooms'),
      (3, 'view_bookings', 'View hotel bookings'),
      (4, 'manage_users', 'Manage users and staff')
    `);
    
    // Link admin role with admin user
    await connection.execute(`
      INSERT IGNORE INTO user_roles (user_id, role_id)
      VALUES (1, 1)
    `);
    
    // Link admin role with all permissions
    await connection.execute(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      VALUES (1, 1), (1, 2), (1, 3), (1, 4)
    `);
    
    console.log('✅ Test data created successfully!');
    console.log('');
    console.log('🏨 Test Hotel: Grand Plaza Hotel');
    console.log('📧 Login Email: admin@grandplaza.com');
    console.log('🔑 Login Password: admin123');
    console.log('👤 User Type: Property Admin');
    console.log('');
    console.log('🌐 Hotel Client: http://localhost:4201');
    console.log('🚀 Server API: http://localhost:5002');
    console.log('');
    console.log('🎉 You can now test the login functionality!');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestData();