import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { User } from '../models/User';
import { AuthenticationError, AuthorizationError } from '../errors';
import { Permission, UserRole } from '../types/common';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        permissions: Permission[];
        organizationId?: string;
      };
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = JWTService.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    // Verify token
    const decoded = JWTService.verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('+isActive');
    if (!user || !user.isActive) {
      throw new AuthenticationError('User account is inactive or does not exist');
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
      ...(decoded.organizationId && { organizationId: decoded.organizationId }),
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware - doesn't throw error if no token
 */
export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = JWTService.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = JWTService.verifyAccessToken(token);
      
      const user = await User.findById(decoded.userId).select('+isActive');
      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions,
          ...(decoded.organizationId && { organizationId: decoded.organizationId }),
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};

/**
 * Authorization middleware - checks if user has required permission
 */
export const authorize = (requiredPermission: Permission) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!JWTService.hasPermission(req.user.permissions, requiredPermission)) {
        throw new AuthorizationError(`Permission ${requiredPermission} is required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Authorization middleware - checks if user has any of the required permissions
 */
export const authorizeAny = (requiredPermissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!JWTService.hasAnyPermission(req.user.permissions, requiredPermissions)) {
        throw new AuthorizationError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Authorization middleware - checks if user has all required permissions
 */
export const authorizeAll = (requiredPermissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!JWTService.hasAllPermissions(req.user.permissions, requiredPermissions)) {
        throw new AuthorizationError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const authorizeRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError('Access denied for your role');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Resource ownership middleware - checks if user owns the resource
 */
export const authorizeOwnership = (resourceUserField: string = 'userId') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // For admin users, allow access to all resources
      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      // Check if the resource belongs to the user
      const resourceUserId = req.params[resourceUserField] || req.body[resourceUserField];
      
      if (resourceUserId && resourceUserId !== req.user.userId) {
        throw new AuthorizationError('Access denied - you can only access your own resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Organization-based authorization middleware
 */
export const authorizeOrganization = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!req.user.organizationId) {
      throw new AuthorizationError('User must belong to an organization');
    }

    // Add organization filter to query if needed
    if (req.method === 'GET' && !req.query.organizationId) {
      req.query.organizationId = req.user.organizationId;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin only middleware
 */
export const adminOnly = authorizeRoles([UserRole.ADMIN]);

/**
 * Manager and Admin middleware
 */
export const managerOrAdmin = authorizeRoles([UserRole.MANAGER, UserRole.ADMIN]);

/**
 * All authenticated users middleware
 */
export const authenticated = authenticate;