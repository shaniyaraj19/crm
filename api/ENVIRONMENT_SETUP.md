# 🌍 V-Accel CRM Backend Environment Setup

This guide will help you set up the environment variables for the V-Accel CRM backend application.

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Run the interactive setup script
node scripts/setup-env.js
```

### Option 2: Manual Setup
```bash
# Copy the template and edit manually
cp environment.template .env
# Edit .env with your preferred editor
nano .env
```

## 📋 Environment Variables Reference

### 🔧 Application Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✅ | `development` | Application environment (development/production/test) |
| `PORT` | ✅ | `5000` | Port number for the server |
| `API_VERSION` | ✅ | `v1` | API version for routing |

### 💾 Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ | `mongodb://localhost:27017/v-accel-crm` | MongoDB connection string |
| `MONGODB_TEST_URI` | ❌ | `mongodb://localhost:27017/v-accel-crm-test` | Test database connection |

### 🔐 JWT Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ | - | Secret key for access tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | ✅ | `15m` | Access token expiration time |
| `JWT_REFRESH_SECRET` | ✅ | - | Secret key for refresh tokens (min 32 chars) |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | `7d` | Refresh token expiration time |

### 📧 Email Configuration (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | ❌ | - | SMTP server hostname |
| `SMTP_PORT` | ❌ | `587` | SMTP server port |
| `SMTP_USER` | ❌ | - | SMTP username/email |
| `SMTP_PASS` | ❌ | - | SMTP password/API key |

#### Email Provider Examples:

**Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Not your regular password!
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### ☁️ AWS Services (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | ❌ | - | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | ❌ | - | AWS secret key for S3 |
| `AWS_REGION` | ❌ | `us-east-1` | AWS region |
| `AWS_S3_BUCKET` | ❌ | - | S3 bucket name for file storage |

### 📱 Twilio SMS (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TWILIO_ACCOUNT_SID` | ❌ | - | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | ❌ | - | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | ❌ | - | Twilio phone number |

### 🔴 Redis Cache (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | ❌ | `redis://localhost:6379` | Redis connection URL |

### 🚦 Rate Limiting

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RATE_LIMIT_WINDOW_MS` | ❌ | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | `100` | Max requests per window |

### 🌐 CORS Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ORIGIN` | ❌ | `http://localhost:3000` | Allowed origins (comma-separated) |

### 🔑 OAuth Providers (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | ❌ | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ❌ | - | Google OAuth client secret |
| `MICROSOFT_CLIENT_ID` | ❌ | - | Microsoft OAuth client ID |
| `MICROSOFT_CLIENT_SECRET` | ❌ | - | Microsoft OAuth client secret |

### 📊 Logging & Monitoring

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LOG_LEVEL` | ❌ | `info` | Logging level (error/warn/info/debug) |
| `WEBHOOK_SECRET` | ❌ | - | Secret for webhook endpoints |

## 🔒 Security Best Practices

### JWT Secrets Generation
Generate secure secrets using Node.js crypto:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Gmail App Password Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings > Security
3. Under "Signing in to Google", select "App passwords"
4. Generate a new app password for "Mail"
5. Use this app password in `SMTP_PASS`, not your regular password

### Production Security Checklist
- [ ] Use strong, unique JWT secrets (64+ characters)
- [ ] Never commit `.env` file to version control
- [ ] Use environment-specific databases
- [ ] Enable HTTPS in production
- [ ] Regularly rotate secrets
- [ ] Use proper CORS origins (not wildcards)
- [ ] Enable rate limiting
- [ ] Set `NODE_ENV=production`

## 🐳 Docker Environment

If using Docker, you can also set environment variables in `docker-compose.yml`:

```yaml
services:
  api:
    environment:
      - NODE_ENV=development
      - PORT=5000
      - MONGODB_URI=mongodb://mongo:27017/v-accel-crm
      - JWT_SECRET=your-secret-here
```

## 📝 Development vs Production

### Development Environment
```env
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
MONGODB_URI=mongodb://localhost:27017/v-accel-crm
```

### Production Environment
```env
NODE_ENV=production
PORT=80
LOG_LEVEL=warn
CORS_ORIGIN=https://your-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/v-accel-crm
```

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
- Ensure MongoDB is running
- Check connection string format
- Verify network access and authentication

**JWT Token Errors:**
- Ensure JWT secrets are at least 32 characters
- Check for proper base64 encoding if needed
- Verify token expiration settings

**Email Not Sending:**
- Verify SMTP credentials
- Check firewall/network restrictions
- For Gmail, ensure app password is used

**CORS Errors:**
- Add your frontend URL to `CORS_ORIGIN`
- Use exact URLs (no trailing slashes)
- Check for proper protocol (http/https)

### Getting Help

If you encounter issues:
1. Check the application logs
2. Verify all required environment variables are set
3. Test database connectivity
4. Check firewall and network settings

## 📚 Related Documentation

- [API Documentation](./README.md)
- [Database Schema](./docs/database.md)
- [Authentication Guide](./docs/authentication.md)
- [Deployment Guide](./docs/deployment.md)