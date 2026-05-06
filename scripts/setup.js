#!/usr/bin/env node
/**
 * Setup Script
 * One-command initialization for the SEO Intelligence Suite.
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function setup() {
  console.log('🔧 SEO Intelligence Suite Setup');
  console.log('================================\n');

  // Check Node version
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.match(/v(\d+)/)?.[1]);
  if (major < 18) {
    console.error('❌ Node.js 18+ required. Current:', nodeVersion);
    process.exit(1);
  }
  console.log('✅ Node.js version:', nodeVersion);

  // Create directories
  const dirs = ['seo-output', 'logs', 'data', 'tmp'];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }

  // Check .env
  try {
    await fs.access('.env');
    console.log('✅ .env file exists');
  } catch {
    console.log('⚠️  .env not found. Copying from .env.example...');
    try {
      await fs.copyFile('.env.example', '.env');
      console.log('✅ Created .env from example. Please edit with your API keys.');
    } catch {
      console.log('❌ .env.example not found. Please create .env manually.');
    }
  }

  // Install dependencies
  console.log('\n📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  } catch (err) {
    console.error('❌ npm install failed:', err.message);
    process.exit(1);
  }

  // Verify CLI
  console.log('\n🚀 Verifying CLI tools...');
  try {
    const version = execSync('node cli/seo-agent.js --version', { encoding: 'utf8' });
    console.log('✅ CLI ready:', version.trim());
  } catch (err) {
    console.error('❌ CLI verification failed');
  }

  console.log('\n✨ Setup complete!');
  console.log('\nNext steps:');
  console.log('  1. Edit .env with your API keys');
  console.log('  2. Run: node cli/seo-agent.js generate "your topic"');
  console.log('  3. Or start server: node cli/seo-agent.js server');
}

setup().catch(console.error);
