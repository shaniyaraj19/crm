import 'express-async-errors';
import express from 'express';
import { Server } from 'http';

import { validateEnvironment, env } from './config/environment';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import {
  corsMiddleware,
  securityHeaders,
  compressionMiddleware,
  requestId,
  requestLogger,
  sanitizeInput,
  generalRateLimit,
  errorHandler,
  notFoundHandler,
  setupGlobalErrorHandlers,
  healthCheck,
  apiInfo,
} from './middleware';
import routes from './routes';

class App {
  public app: express.Application;
  private server?: Server;

  constructor() {
    this.app = express();
    this.setupGlobalErrorHandlers();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupGlobalErrorHandlers(): void {
    setupGlobalErrorHandlers();
  }

  private setupMiddleware(): void {
    // Trust proxy (for rate limiting and IP detection)
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(securityHeaders);
    this.app.use(corsMiddleware);
    this.app.use(compressionMiddleware);

    // Request processing middleware
    this.app.use(requestId);
    this.app.use(requestLogger);
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Security and sanitization
    this.app.use(sanitizeInput);
    
    // Rate limiting
    this.app.use(generalRateLimit);
  }

  private setupRoutes(): void {
    // Health check endpoints
    this.app.get('/health', healthCheck);
    this.app.get('/api', apiInfo);
    this.app.get('/api/v1', apiInfo);
    

    
    // API routes
    this.app.use(`/api/${env.API_VERSION}`, routes);

    // Swagger documentation (if needed)
    // this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private setupErrorHandling(): void {
    // 404 handler for undefined routes
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Validate environment variables
      validateEnvironment();

      // Connect to database
      await connectDatabase();

      // Start server
      this.server = this.app.listen(env.PORT, () => {
        logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
        logger.info(`📚 API Documentation: http://localhost:${env.PORT}/api-docs`);
        logger.info(`🏥 Health Check: http://localhost:${env.PORT}/health`);
      });

      // Handle server errors
      this.server.on('error', (error: Error) => {
        logger.error('Server error:', error);
        process.exit(1);
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          logger.info('Server stopped');
          resolve();
        });
      });
    }
  }
}

// Create and start the application
const app = new App();

// Start server if this file is run directly
if (require.main === module) {
  app.start().catch((error) => {
    logger.error('Failed to start application:', error);
    process.exit(1);
  });
}

export default app;