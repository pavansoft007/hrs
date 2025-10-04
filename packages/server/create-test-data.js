import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import sequelize from './src/config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Creating test data for hotel management system...');

try {
  // Change to server directory
  process.chdir(__dirname);
  
  // Load environment variables
  dotenv.config();
  
  async function createTestData() {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connected successfully');
      
      // Execute raw SQL queries
      await sequelize.query(`
        INSERT IGNORE INTO properties (id, code, name, property_type, address_line1, city, state, country, phone, email, is_active, created_at, updated_at)
        VALUES (1, 'HOTEL001', 'Grand Plaza Hotel', 'HOTEL', '123 Main Street', 'Mumbai', 'Maharashtra', 'India', '+91-9876543210', 'info@grandplaza.com', 1, NOW(), NOW())
      `);
      
      // Password hash for 'admin123'
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await sequelize.query(`
        INSERT IGNORE INTO users (id, full_name, email, user_type, property_id, password_hash, is_active, created_at, updated_at)
        VALUES (1, 'Admin User', 'admin@grandplaza.com', 'PROPERTY_ADMIN', 1, '${passwordHash}', 1, NOW(), NOW())
      `);
      
      await sequelize.query(`
        INSERT IGNORE INTO roles (id, name, description)
        VALUES 
        (1, 'admin', 'Full administrative access'),
        (2, 'manager', 'Hotel management access'),
        (3, 'staff', 'Basic staff access')
      `);
      
      await sequelize.query(`
        INSERT IGNORE INTO permissions (id, code, description)
        VALUES 
        (1, 'view_dashboard', 'View dashboard statistics'),
        (2, 'manage_rooms', 'Manage hotel rooms'),
        (3, 'view_bookings', 'View hotel bookings'),
        (4, 'manage_users', 'Manage users and staff')
      `);
      
      await sequelize.query(`
        INSERT IGNORE INTO user_roles (user_id, role_id)
        VALUES (1, 1)
      `);
      
      await sequelize.query(`
        INSERT IGNORE INTO role_permissions (role_id, permission_id)
        VALUES 
        (1, 1), (1, 2), (1, 3), (1, 4)
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
      
      await sequelize.close();
      
    } catch (error) {
      console.error('❌ Error creating test data:', error);
      process.exit(1);
    }
  }
  
  createTestData();
  
} catch (error) {
  console.error('❌ Setup error:', error);
  process.exit(1);
}