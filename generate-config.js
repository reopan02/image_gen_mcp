#!/usr/bin/env node
/**
 * Configuration helper for MCP clients
 * Generates the correct configuration based on current directory
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                                                              ║');
console.log('║          Image Generation MCP - Config Generator             ║');
console.log('║                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log();

const projectDir = __dirname;

// Check if .env exists
const hasEnv = fs.existsSync(path.join(projectDir, '.env'));
if (!hasEnv) {
  console.log('⚠️  Warning: .env file not found');
  console.log('   Please copy .env.example to .env and configure it first:');
  console.log('   cp .env.example .env');
  console.log();
}

// Check if built
const hasBuilt = fs.existsSync(path.join(projectDir, 'dist/index.js'));
if (!hasBuilt) {
  console.log('⚠️  Warning: Project not built');
  console.log('   Run: npm run build');
  console.log();
}

console.log('📍 Project Directory:');
console.log(`   ${projectDir}`);
console.log();

console.log('═'.repeat(62));
console.log('Configuration Options:');
console.log('═'.repeat(62));
console.log();

console.log('💡 Environment Variables:');
console.log('   ✅ USER_OPENID - Required (必填)');
console.log('   ❌ IMAGE_API_URL - Optional (可选, 默认: https://api.example.com)');
console.log();
console.log('═'.repeat(62));
console.log();

// Option 1: npm script
console.log('🔸 Option 1: Using npm script (Recommended)');
console.log();
console.log(JSON.stringify({
  mcpServers: {
    "image-generation": {
      command: "npm",
      args: ["run", "start"],
      cwd: projectDir,
      env: {
        USER_OPENID: "your-user-openid",
        IMAGE_API_URL: "https://your-api-url.com"  // Optional
      }
    }
  }
}, null, 2));
console.log();
console.log('   ✅ No build required if .env is configured');
console.log('   ✅ Portable across environments');
console.log('   💡 IMAGE_API_URL is optional in env (可省略)');
console.log();

// Option 2: node with cwd
console.log('─'.repeat(62));
console.log();
console.log('🔸 Option 2: Using node with cwd');
console.log();
console.log(JSON.stringify({
  mcpServers: {
    "image-generation": {
      command: "node",
      args: ["dist/index.js"],
      cwd: projectDir,
      env: {
        USER_OPENID: "your-user-openid",
        IMAGE_API_URL: "https://your-api-url.com"  // Optional
      }
    }
  }
}, null, 2));
console.log();
console.log('   ✅ Faster startup');
console.log('   ⚠️  Requires: npm run build');
console.log('   💡 IMAGE_API_URL is optional (可省略)');
console.log();

// Option 3: npx tsx
console.log('─'.repeat(62));
console.log();
console.log('🔸 Option 3: Using npx + tsx (Development)');
console.log();
console.log(JSON.stringify({
  mcpServers: {
    "image-generation": {
      command: "npx",
      args: ["-y", "tsx", "src/index.ts"],
      cwd: projectDir,
      env: {
        USER_OPENID: "your-user-openid",
        IMAGE_API_URL: "https://your-api-url.com"  // Optional
      }
    }
  }
}, null, 2));
console.log();
console.log('   ✅ No build required');
console.log('   ⚠️  Slower startup (TypeScript compilation)');
console.log('   💡 IMAGE_API_URL is optional (可省略)');
console.log();

console.log('═'.repeat(62));
console.log();
console.log('📝 Instructions:');
console.log();
console.log('1. Copy one of the configurations above');
console.log('2. Replace IMAGE_API_URL and USER_OPENID with actual values');
console.log('3. Add to your MCP client config file:');
console.log();
console.log('   macOS: ~/Library/Application Support/Claude/claude_desktop_config.json');
console.log('   Windows: %APPDATA%\\Claude\\claude_desktop_config.json');
console.log('   Cline: VS Code settings → Extensions → Cline → MCP Settings');
console.log();
console.log('4. Restart your MCP client');
console.log();
console.log('💡 Tip: Use Option 1 (npm script) for best portability');
console.log();
