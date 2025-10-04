import bcryptjs from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updatePasswordWithBcryptjs() {
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
    
    console.log('🔍 Updating password with bcryptjs (matching auth utils)...');
    
    // Generate proper bcryptjs hash for 'admin123' with salt rounds 12 (matching AuthUtils)
    const passwordHash = await bcryptjs.hash('admin123', 12);
    console.log('Generated bcryptjs hash:', passwordHash);
    
    // Update the user's password
    await connection.execute(`
      UPDATE users SET password_hash = ? WHERE email = 'admin@grandplaza.com'
    `, [passwordHash]);
    
    console.log('✅ Password updated successfully with bcryptjs!');
    console.log('📧 Email: admin@grandplaza.com');
    console.log('🔑 Password: admin123');
    
    // Test the hash directly
    const isValid = await bcryptjs.compare('admin123', passwordHash);
    console.log('🔍 Hash validation test:', isValid ? '✅ Valid' : '❌ Invalid');
    
  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updatePasswordWithBcryptjs();