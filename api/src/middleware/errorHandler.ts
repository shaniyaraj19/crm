import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { HTTP_STATUS, ERROR_CODES } from '../constants';
import { ApiResponse } from '../types/common';
import { logger } from '../utils/logger';
import { isDevelopment } from '../config/environment';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let code: string = ERROR_CODES.INTERNAL_SERVER_ERROR;
  let details: any = undefined;

  // Handle known application errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  }
  // Handle MongoDB validation errors
  else if (error.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    code = ERROR_CODES.VALIDATION_ERROR;
    
    const mongoError = error as any;
    const errors: Record<string, string[]> = {};
    
    Object.keys(mongoError.errors).forEach((key) => {
      errors[key] = [mongoError.errors[key].message];
    });
    
    details = errors;
  }
  // Handle MongoDB duplicate key errors
  else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Duplicate entry';
    code = ERROR_CODES.DUPLICATE_ENTRY;
    
    const mongoError = error as any;
    const field = Object.keys(mongoError.keyPattern)[0];
    details = { [field]: ['This value already exists'] };
  }
  // Handle MongoDB cast errors (invalid ObjectId)
  else if (error.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid ID format';
    code = ERROR_CODES.VALIDATION_ERROR;
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
    code = ERROR_CODES.AUTHENTICATION_ERROR;
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
    code = ERROR_CODES.AUTHENTICATION_ERROR;
  }
  // Handle multer file upload errors
  else if (error.name === 'MulterError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    code = ERROR_CODES.FILE_TOO_LARGE;
    
    const multerError = error as any;
    if (multerError.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if (multerError.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else {
      message = 'File upload error';
    }
  }

  // Log error
  const errorLog = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId,
    statusCode,
    code,
  };

  if (statusCode >= 500) {
    logger.error('Server Error:', errorLog);
  } else {
    logger.warn('Client Error:', errorLog);
  }

  // Prepare response
  const response: ApiResponse = {
    success: false,
    message,
    error: code,
  };

  // Add details if available
  if (details) {
    response.errors = details;
  }

  // Add stack trace in development
  if (isDevelopment() && error.stack) {
    (response as any).stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: ERROR_CODES.NOT_FOUND,
  };

  res.status(HTTP_STATUS.NOT_FOUND).json(response);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle uncaught exceptions and unhandled rejections
 */
export const setupGlobalErrorHandlers = () => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    process.exit(0);
  });
};