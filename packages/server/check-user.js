import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';

dotenv.config();

async function checkUserData() {
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
    
    console.log('🔍 Checking user data in database...');
    
    // Get user data
    const [rows] = await connection.execute(`
      SELECT id, full_name, email, user_type, property_id, password_hash, is_active
      FROM users WHERE email = 'admin@grandplaza.com'
    `);
    
    console.log('User data:', rows);
    
    if (Array.isArray(rows) && rows.length > 0) {
      const user = rows[0];
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.full_name);
      console.log('🏢 Property ID:', user.property_id);
      console.log('🔐 Has password hash:', !!user.password_hash);
      console.log('✅ Is active:', user.is_active);
      
      if (user.password_hash) {
        // Test password comparison
        const testPassword = 'admin123';
        const isValid = await bcryptjs.compare(testPassword, user.password_hash);
        console.log('🔑 Password test (admin123):', isValid ? '✅ Valid' : '❌ Invalid');
        console.log('📝 Hash (first 50 chars):', user.password_hash.substring(0, 50));
      }
    } else {
      console.log('❌ User not found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking user data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUserData();