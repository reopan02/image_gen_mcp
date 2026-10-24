#!/usr/bin/env node
/**
 * Quick test to verify the MCP server can start
 * This doesn't actually connect to the API, just verifies the structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('='.repeat(60));
console.log('Image Generation MCP Server - Structure Test');
console.log('='.repeat(60));
console.log();

// Check required files
const requiredFiles = [
  'dist/index.js',
  'dist/client.js',
  'dist/types.js',
  'package.json',
  'README.md',
  '.env.example'
];

console.log('Checking required files:');
let allFilesPresent = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesPresent = false;
});

console.log();

if (!allFilesPresent) {
  console.log('❌ Some required files are missing. Please run: npm run build');
  process.exit(1);
}

console.log('Checking MCP server structure:');

// Set dummy env vars for structure testing only
process.env.IMAGE_API_URL = 'http://test-api.example.com';
process.env.USER_OPENID = 'test-openid';

try {
  // Load the built server to verify it compiles
  await import('./dist/index.js');
  console.log('  ✅ Server module loads successfully');
} catch (error) {
  console.log(`  ❌ Server module failed to load: ${error.message}`);
  process.exit(1);
}

try {
  await import('./dist/client.js');
  console.log('  ✅ Client module loads successfully');
} catch (error) {
  console.log(`  ❌ Client module failed to load: ${error.message}`);
  process.exit(1);
}

console.log();
console.log('='.repeat(60));
console.log('✨ All structure tests passed!');
console.log('='.repeat(60));
console.log();
console.log('Next steps:');
console.log('1. Copy .env.example to .env and fill in your API credentials');
console.log('2. Add this server to your MCP client configuration');
console.log('3. See README.md for detailed setup instructions');
console.log();
