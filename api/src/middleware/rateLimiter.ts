import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { env } from '../config/environment';
import { HTTP_STATUS, RATE_LIMIT } from '../constants';
import { ApiResponse } from '../types/common';

/**
 * General rate limiter
 */
export const generalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error: 'RATE_LIMIT_EXCEEDED',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'Too many requests from this IP, please try again later',
      error: 'RATE_LIMIT_EXCEEDED',
    };
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(response);
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: 'RATE_LIMIT_EXCEEDED',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      message: 'Too many authentication attempts, please try again later',
      error: 'RATE_LIMIT_EXCEEDED',
    };
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(response);
  },
});

/**
 * Lenient rate limiter for read operations
 */
export const readRateLimit = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS * 2, // Allow more read requests
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error: 'RATE_LIMIT_EXCEEDED',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for write operations
 */
export const writeRateLimit = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: Math.floor(RATE_LIMIT.MAX_REQUESTS / 2), // Allow fewer write requests
  message: {
    success: false,
    message: 'Too many write requests from this IP, please try again later',
    error: 'RATE_LIMIT_EXCEEDED',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API key based rate limiter (for future API key implementation)
 */
export const createApiKeyRateLimit = (maxRequests: number, windowMs: number = RATE_LIMIT.WINDOW_MS) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req: Request): string => {
      // Use API key if available, otherwise fall back to IP
      return (req.headers['x-api-key'] as string) || req.ip || 'unknown';
    },
    message: {
      success: false,
      message: 'API rate limit exceeded',
      error: 'RATE_LIMIT_EXCEEDED',
    } as ApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

/**
 * User-based rate limiter (requires authentication)
 */
export const createUserRateLimit = (maxRequests: number, windowMs: number = RATE_LIMIT.WINDOW_MS) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req: Request): string => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.userId || req.ip || 'unknown';
    },
    message: {
      success: false,
      message: 'User rate limit exceeded',
      error: 'RATE_LIMIT_EXCEEDED',
    } as ApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      // Skip rate limiting for admin users
      return req.user?.role === 'admin';
    },
  });
};