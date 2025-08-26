#!/usr/bin/env node

/**
 * V-Accel CRM Environment Setup Script
 * This script helps you set up your environment variables with secure defaults
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateRandomPort() {
  return Math.floor(Math.random() * (9999 - 5000) + 5000);
}

async function promptUser(question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue 
      ? `${question} (${defaultValue}): `
      : `${question}: `;
    
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function setupEnvironment() {
  log('\n🚀 V-Accel CRM Backend Environment Setup', colors.bold + colors.blue);
  log('=====================================\n', colors.blue);

  const templatePath = path.join(__dirname, '../environment.template');
  const envPath = path.join(__dirname, '../.env');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await promptUser('⚠️  .env file already exists. Overwrite? (y/N)', 'N');
    if (overwrite.toLowerCase() !== 'y') {
      log('❌ Setup cancelled.', colors.yellow);
      rl.close();
      return;
    }
  }

  // Read template
  if (!fs.existsSync(templatePath)) {
    log('❌ Template file not found. Please ensure environment.template exists.', colors.red);
    rl.close();
    return;
  }

  let envContent = fs.readFileSync(templatePath, 'utf8');

  log('📝 Setting up your environment variables...\n', colors.green);

  // Application Settings
  log('🔧 Application Settings', colors.bold);
  const nodeEnv = await promptUser('Environment (development/production)', 'development');
  const port = await promptUser('Port', '5000');
  const apiVersion = await promptUser('API Version', 'v1');

  // Database
  log('\n💾 Database Configuration', colors.bold);
  const dbName = await promptUser('Database name', 'v-accel-crm');
  const mongoUri = await promptUser('MongoDB URI', `mongodb://localhost:27017/${dbName}`);

  // JWT Secrets
  log('\n🔐 JWT Configuration', colors.bold);
  log('Generating secure JWT secrets...', colors.green);
  const jwtSecret = generateSecureSecret(64);
  const jwtRefreshSecret = generateSecureSecret(64);
  const jwtExpires = await promptUser('Access token expiry', '15m');
  const jwtRefreshExpires = await promptUser('Refresh token expiry', '7d');

  // Email Configuration
  log('\n📧 Email Configuration (Optional)', colors.bold);
  const useEmail = await promptUser('Configure email? (y/N)', 'N');
  let smtpHost = '', smtpPort = '', smtpUser = '', smtpPass = '';
  
  if (useEmail.toLowerCase() === 'y') {
    const emailProvider = await promptUser('Email provider (gmail/sendgrid/custom)', 'gmail');
    
    if (emailProvider === 'gmail') {
      smtpHost = 'smtp.gmail.com';
      smtpPort = '587';
      smtpUser = await promptUser('Gmail address');
      smtpPass = await promptUser('Gmail app password (not your regular password)');
    } else if (emailProvider === 'sendgrid') {
      smtpHost = 'smtp.sendgrid.net';
      smtpPort = '587';
      smtpUser = 'apikey';
      smtpPass = await promptUser('SendGrid API key');
    } else {
      smtpHost = await promptUser('SMTP Host');
      smtpPort = await promptUser('SMTP Port', '587');
      smtpUser = await promptUser('SMTP Username');
      smtpPass = await promptUser('SMTP Password');
    }
  }

  // CORS Configuration
  log('\n🌐 CORS Configuration', colors.bold);
  const corsOrigin = await promptUser('Allowed origins (comma-separated)', 'http://localhost:3000');

  // Generate additional secrets
  log('\n🔒 Generating additional security keys...', colors.green);
  const sessionSecret = generateSecureSecret(32);
  const encryptionKey = generateSecureSecret(16);
  const webhookSecret = generateSecureSecret(32);

  // Replace placeholders in template
  envContent = envContent
    .replace(/NODE_ENV=development/, `NODE_ENV=${nodeEnv}`)
    .replace(/PORT=5000/, `PORT=${port}`)
    .replace(/API_VERSION=v1/, `API_VERSION=${apiVersion}`)
    .replace(/MONGODB_URI=mongodb:\/\/localhost:27017\/v-accel-crm/, `MONGODB_URI=${mongoUri}`)
    .replace(/MONGODB_TEST_URI=mongodb:\/\/localhost:27017\/v-accel-crm-test/, `MONGODB_TEST_URI=${mongoUri}-test`)
    .replace(/JWT_SECRET=your-super-secret-jwt-key-that-should-be-at-least-32-characters-long/, `JWT_SECRET=${jwtSecret}`)
    .replace(/JWT_EXPIRES_IN=15m/, `JWT_EXPIRES_IN=${jwtExpires}`)
    .replace(/JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-that-should-be-at-least-32-characters-long/, `JWT_REFRESH_SECRET=${jwtRefreshSecret}`)
    .replace(/JWT_REFRESH_EXPIRES_IN=7d/, `JWT_REFRESH_EXPIRES_IN=${jwtRefreshExpires}`)
    .replace(/SMTP_HOST=smtp.gmail.com/, `SMTP_HOST=${smtpHost}`)
    .replace(/SMTP_PORT=587/, `SMTP_PORT=${smtpPort}`)
    .replace(/SMTP_USER=your-email@gmail.com/, `SMTP_USER=${smtpUser}`)
    .replace(/SMTP_PASS=your-app-password/, `SMTP_PASS=${smtpPass}`)
    .replace(/CORS_ORIGIN=http:\/\/localhost:3000,http:\/\/localhost:3001/, `CORS_ORIGIN=${corsOrigin}`)
    .replace(/SESSION_SECRET=your-session-secret-key/, `SESSION_SECRET=${sessionSecret}`)
    .replace(/ENCRYPTION_KEY=your-32-character-encryption-key/, `ENCRYPTION_KEY=${encryptionKey}`)
    .replace(/WEBHOOK_SECRET=your-webhook-secret-key/, `WEBHOOK_SECRET=${webhookSecret}`);

  // Write .env file
  fs.writeFileSync(envPath, envContent);

  log('\n✅ Environment setup complete!', colors.bold + colors.green);
  log('📁 Created: .env', colors.green);
  
  // Show next steps
  log('\n📋 Next Steps:', colors.bold + colors.blue);
  log('1. Review and customize your .env file', colors.blue);
  log('2. Install dependencies: npm install', colors.blue);
  log('3. Start MongoDB service', colors.blue);
  log('4. Run the application: npm run dev', colors.blue);
  
  if (useEmail.toLowerCase() === 'y') {
    log('\n📧 Email Setup Notes:', colors.bold + colors.yellow);
    if (smtpUser.includes('gmail')) {
      log('- For Gmail: Enable 2FA and generate an App Password', colors.yellow);
      log('- Don\'t use your regular Gmail password', colors.yellow);
    }
  }

  log('\n🔒 Security Reminders:', colors.bold + colors.yellow);
  log('- Never commit your .env file to version control', colors.yellow);
  log('- Use strong, unique secrets in production', colors.yellow);
  log('- Regularly rotate your JWT secrets', colors.yellow);
  
  rl.close();
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`❌ Error: ${error.message}`, colors.red);
  rl.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  log('\n❌ Setup cancelled by user.', colors.yellow);
  rl.close();
  process.exit(0);
});

// Run setup
setupEnvironment().catch((error) => {
  log(`❌ Setup failed: ${error.message}`, colors.red);
  rl.close();
  process.exit(1);
});