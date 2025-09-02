import helmet from 'helmet';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import { isDevelopment } from '../config/environment';

/**
 * Security headers middleware using Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:3001", "http://127.0.0.1:5173"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Compression middleware
 */
export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req: Request, res: Response) => {
    // Don't compress if the request includes a 'x-no-compression' header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  },
});

/**
 * Request ID middleware
 */
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || 
                   Math.random().toString(36).substring(2, 15);
  
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  if (isDevelopment()) {
    console.log(`${req.method} ${req.originalUrl} - ${req.ip}`);
  }
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'],
      userId: req.user?.userId,
    };
    
    if (isDevelopment()) {
      console.log(JSON.stringify(logData, null, 2));
    }
  });
  
  next();
};

/**
 * Health check endpoint
 */
export const healthCheck = (_req: Request, res: Response) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  };
  
  res.status(200).json(healthcheck);
};

/**
 * API info endpoint
 */
export const apiInfo = (_req: Request, res: Response) => {
  const info = {
    name: 'V-Accel CRM API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'CRM Backend API similar to Zoho Bigin',
    environment: process.env.NODE_ENV,
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      pipelines: '/api/v1/pipelines',
      deals: '/api/v1/deals',
      contacts: '/api/v1/contacts',
      companies: '/api/v1/companies',
      activities: '/api/v1/activities',
    },
  };
  
  res.status(200).json(info);
};



/**
 * Sanitize user input
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  // Remove any properties that start with '$' or contain '.'
  const sanitizeObject = (obj: any): any => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};