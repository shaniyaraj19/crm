#!/bin/bash

# V-Accel CRM Backend Quick Setup Script
# This script provides a quick way to set up the basic environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 V-Accel CRM Backend Quick Setup${NC}"
echo -e "${BLUE}===================================${NC}"
echo

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists.${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}❌ Setup cancelled.${NC}"
        exit 0
    fi
fi

# Check if template exists
if [ ! -f "environment.template" ]; then
    echo -e "${RED}❌ environment.template not found. Please ensure it exists.${NC}"
    exit 1
fi

echo -e "${GREEN}📝 Creating .env file from template...${NC}"

# Copy template to .env
cp environment.template .env

# Generate secure JWT secrets
echo -e "${GREEN}🔐 Generating secure JWT secrets...${NC}"

# Check if Node.js is available for secret generation
if command -v node >/dev/null 2>&1; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
    WEBHOOK_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Replace placeholders in .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=your-super-secret-jwt-key-that-should-be-at-least-32-characters-long/JWT_SECRET=$JWT_SECRET/" .env
        sed -i '' "s/JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-that-should-be-at-least-32-characters-long/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" .env
        sed -i '' "s/SESSION_SECRET=your-session-secret-key/SESSION_SECRET=$SESSION_SECRET/" .env
        sed -i '' "s/ENCRYPTION_KEY=your-32-character-encryption-key/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
        sed -i '' "s/WEBHOOK_SECRET=your-webhook-secret-key/WEBHOOK_SECRET=$WEBHOOK_SECRET/" .env
    else
        # Linux
        sed -i "s/JWT_SECRET=your-super-secret-jwt-key-that-should-be-at-least-32-characters-long/JWT_SECRET=$JWT_SECRET/" .env
        sed -i "s/JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-that-should-be-at-least-32-characters-long/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" .env
        sed -i "s/SESSION_SECRET=your-session-secret-key/SESSION_SECRET=$SESSION_SECRET/" .env
        sed -i "s/ENCRYPTION_KEY=your-32-character-encryption-key/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
        sed -i "s/WEBHOOK_SECRET=your-webhook-secret-key/WEBHOOK_SECRET=$WEBHOOK_SECRET/" .env
    fi
    
    echo -e "${GREEN}✅ JWT secrets generated and configured!${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js not found. Please manually update JWT secrets in .env file.${NC}"
fi

echo
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo -e "${GREEN}📁 Created: .env${NC}"
echo

echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "${BLUE}1. Review and customize your .env file${NC}"
echo -e "${BLUE}2. Install dependencies: npm install${NC}"
echo -e "${BLUE}3. Start MongoDB service${NC}"
echo -e "${BLUE}4. Run the application: npm run dev${NC}"
echo

echo -e "${YELLOW}🔧 Additional Configuration:${NC}"
echo -e "${YELLOW}- Update MONGODB_URI if needed${NC}"
echo -e "${YELLOW}- Configure SMTP settings for email functionality${NC}"
echo -e "${YELLOW}- Set up AWS credentials for file uploads${NC}"
echo -e "${YELLOW}- Configure CORS_ORIGIN for your frontend${NC}"
echo

echo -e "${YELLOW}🔒 Security Reminders:${NC}"
echo -e "${YELLOW}- Never commit your .env file to version control${NC}"
echo -e "${YELLOW}- Use strong, unique secrets in production${NC}"
echo -e "${YELLOW}- Regularly rotate your JWT secrets${NC}"
echo

echo -e "${GREEN}🚀 Happy coding!${NC}"