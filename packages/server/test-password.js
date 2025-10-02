import bcryptjs from 'bcryptjs';

async function testPassword() {
  const storedHash = '$2b$12$1ofBia.T6q8jDBd1u/2p.eM2HmdoYjZwYjubjfYT0KCCutYFb8LCG';
  
  const commonPasswords = [
    'admin',
    'password', 
    '123456',
    'admin123',
    'password123',
    'pavan',
    'Pavan',
    'test',
    'test123'
  ];
  
  console.log('🔍 Testing common passwords against stored hash...');
  
  for (const password of commonPasswords) {
    const isValid = await bcryptjs.compare(password, storedHash);
    if (isValid) {
      console.log(`✅ Found password: "${password}"`);
      return password;
    }
  }
  
  console.log('❌ No common password matches found');
  return null;
}

testPassword();