import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updatePassword() {
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
    
    console.log('🔍 Updating password for test user...');
    
    // Generate proper bcrypt hash for 'admin123'
    const passwordHash = await bcrypt.hash('admin123', 10);
    console.log('Generated hash:', passwordHash);
    
    // Update the user's password
    await connection.execute(`
      UPDATE users SET password_hash = ? WHERE email = 'admin@grandplaza.com'
    `, [passwordHash]);
    
    console.log('✅ Password updated successfully!');
    console.log('📧 Email: admin@grandplaza.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updatePassword();