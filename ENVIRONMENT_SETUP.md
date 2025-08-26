# Environment Setup Guide

## Backend Environment (.env)

Create/update `api/.env` with the following configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/v-accel-crm
MONGODB_TEST_URI=mongodb://localhost:27017/v-accel-crm-test

# JWT Configuration (REQUIRED - Generate secure keys)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-security
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long-for-security
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Optional - for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS Configuration (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Frontend Environment (.env.local)

**IMPORTANT**: Update `client/.env.local` to use port 3001:

```env
# API Configuration (REQUIRED)
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Application Settings
VITE_APP_NAME=V-Accel CRM
VITE_NODE_ENV=development
VITE_DEBUG_MODE=true

# Performance Settings
VITE_API_TIMEOUT=30000
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_FILE_SIZE=10

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REAL_TIME=true

# Theme Configuration
VITE_DEFAULT_THEME=light
VITE_BRAND_COLOR=#3B82F6

# Development Settings
VITE_SHOW_MOCK_DATA=false
VITE_ENABLE_DEVTOOLS=true
```

## Quick Setup Commands

### Backend Setup:
```bash
cd api
# Environment is already configured
npm run dev  # Server runs on port 3001
```

### Frontend Setup:
```bash
cd client
# Update .env.local to change port from 5000 to 3001
# Change: VITE_API_BASE_URL=http://localhost:5000/api/v1
# To: VITE_API_BASE_URL=http://localhost:3001/api/v1
npm run dev  # Frontend runs on port 3000
```

## Current Status:
- ✅ Backend: Running on port 3001
- ⚠️ Frontend: Needs port update in .env.local (5000 → 3001)
- ✅ Database: MongoDB connected and seeded
- ✅ All components: Created and functional

## Manual Environment File Updates Needed:

1. **Update `client/.env.local`**: Change port from 5000 to 3001
2. **Update `client/.env`**: Change port from 5000 to 3001 (if it exists)

This will ensure the frontend connects to the backend on the correct port.