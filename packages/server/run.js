// Simple JavaScript file to run TypeScript server without esbuild issues
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use node with typescript directly
const tsFile = join(__dirname, 'src', 'index.ts');

// Try different methods to run TypeScript
const methods = [
  // Method 1: Use tsx from global if available
  () => spawn('npx', ['tsx', tsFile], { stdio: 'inherit', shell: true }),
  
  // Method 2: Use ts-node
  () => spawn('node', ['-r', 'ts-node/register', '--loader', 'ts-node/esm', tsFile], { stdio: 'inherit' }),
  
  // Method 3: Simple transpile and run
  () => {
    console.log('🔄 Attempting to run server with fallback method...');
    // This is a fallback - you might need to install packages manually
    return spawn('node', ['--loader', '@swc-node/register/esm', tsFile], { stdio: 'inherit' });
  }
];

let currentMethod = 0;

function tryNextMethod() {
  if (currentMethod >= methods.length) {
    console.error('❌ All methods failed. Please manually install tsx or ts-node.');
    console.log('Try running:');
    console.log('  npm install -g tsx');
    console.log('  or');
    console.log('  npm install tsx ts-node');
    process.exit(1);
  }
  
  console.log(`🔄 Trying method ${currentMethod + 1}...`);
  const child = methods[currentMethod]();
  
  child.on('error', (err) => {
    console.error(`Method ${currentMethod + 1} failed:`, err.message);
    currentMethod++;
    setTimeout(tryNextMethod, 1000);
  });
  
  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Method ${currentMethod + 1} exited with code ${code}`);
      currentMethod++;
      setTimeout(tryNextMethod, 1000);
    }
  });
}

console.log('🚀 Starting server...');
tryNextMethod();