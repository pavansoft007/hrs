console.log('Testing basic imports...');

try {
  console.log('1. Testing database import...');
  const sequelize = await import('./config/database.js');
  console.log('✅ Database import successful');

  console.log('2. Testing models import...');
  const models = await import('./models/index.js');
  console.log('✅ Models import successful');

  console.log('3. Testing auth middleware...');
  const auth = await import('./middleware/auth.js');
  console.log('✅ Auth middleware import successful');

  console.log('4. Testing validation utils...');
  const validation = await import('./utils/validation.js');
  console.log('✅ Validation utils import successful');

  console.log('5. Testing controllers...');
  const userController = await import('./controllers/userController.js');
  console.log('✅ User controller import successful');

  console.log('✅ All imports successful!');
} catch (error) {
  console.error('❌ Import error:', error);
}
