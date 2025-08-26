import * as jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { JWTPayload, UserRole, Permission } from '../types/common';
import { getPermissionsForRole } from '../constants/permissions';
import { AuthenticationError } from '../errors';

export class JWTService {
  private static readonly ACCESS_TOKEN_SECRET = env.JWT_SECRET;
  private static readonly REFRESH_TOKEN_SECRET = env.JWT_REFRESH_SECRET;
  private static readonly ACCESS_TOKEN_EXPIRES_IN = env.JWT_EXPIRES_IN;
  private static readonly REFRESH_TOKEN_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(
      payload as any,
      this.ACCESS_TOKEN_SECRET,
      {
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
        issuer: 'v-accel-crm',
        audience: 'v-accel-crm-users',
      } as any
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' } as any,
      this.REFRESH_TOKEN_SECRET,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'v-accel-crm',
        audience: 'v-accel-crm-users',
      } as any
    );
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(user: {
    _id: any; // Can be ObjectId or string
    email: string;
    role: UserRole;
    organizationId?: any; // Can be ObjectId or string
  }) {
    const permissions = getPermissionsForRole(user.role);
    
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions,
      ...(user.organizationId && { organizationId: user.organizationId.toString() }),
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(user._id.toString());

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid access token');
      }
      throw new AuthenticationError('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { userId: string; type: string } {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as any;
      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid token type');
      }
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw new AuthenticationError('Token verification failed');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: 'password-reset' },
      this.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1h',
        issuer: 'v-accel-crm',
        audience: 'v-accel-crm-users',
      }
    );
  }

  /**
   * Verify password reset token
   */
  static verifyPasswordResetToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as any;
      if (decoded.type !== 'password-reset') {
        throw new AuthenticationError('Invalid token type');
      }
      return { userId: decoded.userId, email: decoded.email };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Password reset token has expired');
      }
      throw new AuthenticationError('Invalid password reset token');
    }
  }

  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: 'email-verification' },
      this.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '24h',
        issuer: 'v-accel-crm',
        audience: 'v-accel-crm-users',
      }
    );
  }

  /**
   * Verify email verification token
   */
  static verifyEmailVerificationToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as any;
      if (decoded.type !== 'email-verification') {
        throw new AuthenticationError('Invalid token type');
      }
      return { userId: decoded.userId, email: decoded.email };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Email verification token has expired');
      }
      throw new AuthenticationError('Invalid email verification token');
    }
  }

  /**
   * Check if user has permission
   */
  static hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
    return userPermissions.includes(requiredPermission);
  }

  /**
   * Check if user has any of the required permissions
   */
  static hasAnyPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has all required permissions
   */
  static hasAllPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }
}