import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

async function testSequelizeConnection() {
  console.log('🔍 Testing Sequelize connection...');
  console.log('🔧 Configuration:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? '***hidden***' : '(empty)',
  });

  const sequelize = new Sequelize({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'hotel_restaurant',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    pool: {
      max: 2,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  try {
    console.log('📡 Testing Sequelize authentication...');
    await sequelize.authenticate();
    console.log('✅ Sequelize connection established successfully!');

    // Test a simple query
    const [results] = await sequelize.query(
      'SELECT COUNT(*) as count FROM properties',
    );
    console.log('📊 Properties count:', results[0].count);

    await sequelize.close();
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Sequelize connection failed:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      original: error.original || 'No original error',
    });
  }
}

testSequelizeConnection().catch(console.error);
