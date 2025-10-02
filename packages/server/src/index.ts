import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import hotelRoutes from './routes/hotel.js';
import propertyRoutes from './routes/properties.js';
import rolePermissionRoutes from './routes/rolePermissions.js';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: err.message }),
    });
    next();
  }
);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    console.log('🔍 Starting server...');
    console.log('🔧 Database config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    });

    // Test database connection first
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database models without forcing (preserve existing data)
    try {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    } catch (error) {
      console.error('Database sync error:', error);
      // If alter fails, try basic sync
      await sequelize.sync();
      console.log('✅ Database models synchronized (basic).');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:');
    console.error(error);
    console.error('Stack trace:');
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
