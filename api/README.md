# V-Accel CRM API

A comprehensive CRM backend API similar to Zoho Bigin, built with Node.js, TypeScript, Express, and MongoDB.

## Features

### Core Functionality
- **User Management**: JWT-based authentication with role-based access control (Admin, Manager, Sales Rep)
- **Pipeline Management**: Custom pipelines with drag-and-drop stages and workflows
- **Deal Management**: Complete deal lifecycle management with assignments, values, and priorities
- **Contact Management**: Lead scoring, contact types, and relationship tracking
- **Company Management**: Company profiles with hierarchy and analytics
- **Activity Management**: Tasks, calls, meetings, and email tracking with scheduling

### Technical Features
- **Authentication**: JWT tokens with refresh token support
- **Authorization**: Role-based permissions system
- **Validation**: Comprehensive input validation with Zod schemas
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Error Handling**: Centralized error handling with detailed logging
- **Database**: MongoDB with Mongoose ODM and optimized indexes
- **API Documentation**: Swagger/OpenAPI documentation
- **Docker Support**: Complete containerization setup

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd v-accel-crm/api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   
   # Or use your local MongoDB installation
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

### Using Docker

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f api
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Pipelines
- `GET /api/v1/pipelines` - Get all pipelines
- `POST /api/v1/pipelines` - Create pipeline
- `GET /api/v1/pipelines/:id` - Get pipeline by ID
- `PUT /api/v1/pipelines/:id` - Update pipeline
- `DELETE /api/v1/pipelines/:id` - Delete pipeline
- `POST /api/v1/pipelines/:id/stages` - Add stage
- `PUT /api/v1/pipelines/:id/stages/:stageId` - Update stage
- `DELETE /api/v1/pipelines/:id/stages/:stageId` - Remove stage

### Deals
- `GET /api/v1/deals` - Get all deals (with filtering)
- `POST /api/v1/deals` - Create deal
- `GET /api/v1/deals/:id` - Get deal by ID
- `PUT /api/v1/deals/:id` - Update deal
- `DELETE /api/v1/deals/:id` - Delete deal
- `PUT /api/v1/deals/:id/move` - Move deal to stage
- `POST /api/v1/deals/:id/notes` - Add note to deal
- `GET /api/v1/deals/analytics` - Get deal analytics
- `GET /api/v1/deals/pipeline/:pipelineId/kanban` - Get Kanban view

### Contacts (Coming Soon)
- Contact CRUD operations
- Lead scoring and conversion
- Contact analytics
- Bulk import/export

### Companies (Coming Soon)
- Company CRUD operations
- Company hierarchy
- Company analytics

### Activities (Coming Soon)
- Activity CRUD operations
- Calendar integration
- Recurring activities
- Activity reminders

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/v-accel-crm

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=v-accel-crm-files
```

## Database Schema

### Collections
- **users**: User accounts and authentication
- **pipelines**: Sales pipelines with custom stages
- **deals**: Deal records with stage tracking
- **contacts**: Contact information and lead scoring
- **companies**: Company profiles and relationships
- **activities**: Tasks, calls, meetings, and notes

### Key Features
- Soft deletion for all entities
- Audit trails with created/updated timestamps
- Organization-based data isolation
- Optimized indexes for performance
- Data validation at schema level

## Security

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Permission-based route protection
- Password hashing with bcrypt

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting by IP and user
- Input sanitization and validation

### Data Protection
- MongoDB injection prevention
- XSS protection
- CSRF protection
- Secure cookie settings

## Performance

### Database Optimization
- Strategic indexing for query performance
- Aggregation pipelines for analytics
- Connection pooling
- Query optimization

### Caching (Planned)
- Redis for session storage
- API response caching
- Database query caching

### Monitoring (Planned)
- Health check endpoints
- Performance metrics
- Error tracking with Sentry
- Request logging

## Development

### Project Structure
```
api/
├── src/
│   ├── config/          # Configuration files
│   ├── constants/       # Application constants
│   ├── controllers/     # Route controllers
│   ├── errors/          # Custom error classes
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── schemas/         # Validation schemas
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── scripts/             # Database and deployment scripts
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── package.json         # Dependencies and scripts
```

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests (coming soon)

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks (planned)

## API Documentation

Once the server is running, visit:
- API Documentation: `http://localhost:5000/api-docs`
- Health Check: `http://localhost:5000/health`
- API Info: `http://localhost:5000/api`

## Testing (Planned)

- Unit tests with Jest
- Integration tests for API endpoints
- Database testing with in-memory MongoDB
- Test coverage reporting

## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale api=3
```

### Production Considerations
- Use environment-specific configuration
- Set up proper logging and monitoring
- Configure SSL/TLS certificates
- Set up database backups
- Use a process manager like PM2

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the environment setup guide

---

Built with ❤️ using Node.js, TypeScript, Express, and MongoDB.