import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('🔧 Configuration:', {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ? '***hidden***' : '(empty)',
    database: process.env.DB_NAME || 'hotel_restaurant',
  });

  try {
    console.log('📡 Step 1: Testing connection without database selection...');

    // First, test connection without specifying database
    const connectionWithoutDB = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ Successfully connected to MySQL/MariaDB server!');

    // Check server version
    const [rows] = await connectionWithoutDB.execute(
      'SELECT VERSION() as version',
    );
    console.log('🏷️  Server version:', rows[0].version);

    // List databases
    console.log('📊 Listing available databases...');
    const [databases] = await connectionWithoutDB.execute('SHOW DATABASES');
    console.log(
      '📋 Available databases:',
      databases.map((db) => db.Database),
    );

    // Check if target database exists
    const targetDB = process.env.DB_NAME || 'hotel_restaurant';
    const dbExists = databases.some((db) => db.Database === targetDB);

    if (!dbExists) {
      console.log(`⚠️  Database '${targetDB}' does not exist!`);
      console.log(`📝 Creating database '${targetDB}'...`);
      await connectionWithoutDB.execute(
        `CREATE DATABASE IF NOT EXISTS \`${targetDB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      console.log(`✅ Database '${targetDB}' created successfully!`);
    } else {
      console.log(`✅ Database '${targetDB}' exists!`);
    }

    await connectionWithoutDB.end();

    console.log('📡 Step 2: Testing connection with target database...');

    // Now test connection with the target database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: targetDB,
    });

    console.log(`✅ Successfully connected to database '${targetDB}'!`);

    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(
      '📋 Tables in database:',
      tables.length > 0
        ? tables.map((t) => Object.values(t)[0])
        : 'No tables found',
    );

    // Check if properties table exists
    const propertiesExists = tables.some(
      (t) => Object.values(t)[0] === 'properties',
    );
    if (propertiesExists) {
      const [properties] = await connection.execute(
        'SELECT COUNT(*) as count FROM properties',
      );
      console.log(`📊 Properties table has ${properties[0].count} records`);
    } else {
      console.log(
        '⚠️  Properties table does not exist. You may need to run the SQL schema.',
      );
    }

    await connection.end();
    console.log('🎉 Database connection test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔍 Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      hostname: error.hostname,
      port: error.port,
    });

    // Provide troubleshooting suggestions
    console.log('\n🛠️  Troubleshooting suggestions:');
    console.log('1. Check if MySQL/MariaDB service is running:');
    console.log('   - Windows: services.msc -> look for MySQL/MariaDB');
    console.log('   - Or run: net start mysql (or mariadb)');
    console.log('2. Verify connection settings in .env file');
    console.log('3. Check if port 3306 is accessible:');
    console.log('   - Run: telnet 127.0.0.1 3306');
    console.log('4. Check firewall settings');
    console.log('5. Verify username/password credentials');
  }
}

testConnection().catch(console.error);
