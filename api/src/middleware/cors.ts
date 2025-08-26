import cors from 'cors';
import { env, isDevelopment } from '../config/environment';

/**
 * CORS configuration
 */
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (isDevelopment()) {
      return callback(null, true);
    }

    // In production, check against allowed origins
    const allowedOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-User-Agent',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

export const corsMiddleware = cors(corsOptions);