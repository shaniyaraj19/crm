import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User } from '../models/User';
import { JWTService } from '../utils/jwt';
import { 
  AuthenticationError, 
  ConflictError, 
  NotFoundError,
  ValidationError 
} from '../errors';
import { HTTP_STATUS } from '../constants';
import { 
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  VerifyEmailInput,
  RefreshTokenInput,
  UpdateProfileInput
} from '../schemas/auth.schemas';
import { ApiResponse } from '../types/common';
import { logger } from '../utils/logger';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: RegisterInput = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Create new user
      const user = new User(userData);
      
      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      
      await user.save();
      
      // Set organizationId to user's own _id if not provided (for single-user setups)
      if (!user.organizationId) {
        user.organizationId = user._id.toString();
        logger.info(`Setting organizationId for new user ${user.email} to their own _id`);
        await user.save();
      }

      // Generate JWT tokens
      const tokens = JWTService.generateTokenPair(user);

      // TODO: Send verification email
      logger.info(`New user registered: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully. Please verify your email.',
        data: {
          user: user.toJSON(),
          tokens,
          verificationToken, // In production, don't send this in response
        },
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password }: LoginInput = req.body;

      // Find user with password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Your account has been deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Set organizationId to user's own _id if not already set (for single-user setups)
      if (!user.organizationId) {
        user.organizationId = user._id.toString();
        logger.info(`Setting organizationId for user ${user.email} to their own _id`);
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT tokens
      const tokens = JWTService.generateTokenPair(user);

      logger.info(`User logged in: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          tokens,
        },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken }: RefreshTokenInput = req.body;

      // Verify refresh token
      const decoded = JWTService.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AuthenticationError('User not found or inactive');
      }

      // Set organizationId to user's own _id if not already set (for single-user setups)
      if (!user.organizationId) {
        user.organizationId = user._id.toString();
        logger.info(`Setting organizationId for user ${user.email} to their own _id`);
        await user.save();
      }

      // Generate new tokens
      const tokens = JWTService.generateTokenPair(user);

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Set organizationId to user's own _id if not already set (for single-user setups)
      if (!user.organizationId) {
        user.organizationId = user._id.toString();
        logger.info(`Setting organizationId for user ${user.email} to their own _id`);
        await user.save();
      }

      const response: ApiResponse = {
        success: true,
        data: { user: user.toJSON() },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updateData: UpdateProfileInput = req.body;

      const user = await User.findById(req.user?.userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Update user fields
      Object.assign(user, updateData);
      if (req.user?.userId) {
        user.updatedBy = new Types.ObjectId(req.user.userId);
      }

      await user.save();

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: { user: user.toJSON() },
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword }: ChangePasswordInput = req.body;

      const user = await User.findById(req.user?.userId).select('+password');
      if (!user) {
        throw new NotFoundError('User');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new ValidationError('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password - send reset email
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email }: ForgotPasswordInput = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists or not
        const response: ApiResponse = {
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
        };
        res.status(HTTP_STATUS.OK).json(response);
        return;
      }

      // Generate reset token
      const resetToken = JWTService.generatePasswordResetToken(user._id.toString(), user.email);

      // TODO: Send password reset email
      logger.info(`Password reset requested for user: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        data: { resetToken }, // In production, don't send this in response
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password }: ResetPasswordInput = req.body;

      // Verify reset token
      const decoded = JWTService.verifyPasswordResetToken(token);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      // Update password
      user.password = password;
      await user.save();

      logger.info(`Password reset completed for user: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset successfully',
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token }: VerifyEmailInput = req.body;

      // Verify email token
      const decoded = JWTService.verifyEmailVerificationToken(token);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AuthenticationError('Invalid or expired verification token');
      }

      // Update email verification status
      user.isEmailVerified = true;
      user.emailVerificationToken = null as any;
      user.emailVerificationExpires = null as any;
      await user.save();

      logger.info(`Email verified for user: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Email verified successfully',
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        const response: ApiResponse = {
          success: true,
          message: 'If an account with that email exists, a verification email has been sent.',
        };
        res.status(HTTP_STATUS.OK).json(response);
        return;
      }

      if (user.isEmailVerified) {
        throw new ValidationError('Email is already verified');
      }

      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // TODO: Send verification email
      logger.info(`Verification email resent for user: ${user.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'If an account with that email exists, a verification email has been sent.',
        data: { verificationToken }, // In production, don't send this in response
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user (invalidate token)
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real application, you would add the token to a blacklist
      // For now, we'll just return success
      
      logger.info(`User logged out: ${req.user?.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}