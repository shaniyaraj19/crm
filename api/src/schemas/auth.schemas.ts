import { z } from 'zod';
import { UserRole } from '../types/common';

// User registration schema
export const registerSchema = z.object({
  body: z.object({
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters')
      .trim(),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters')
      .trim(),
    email: z.string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    role: z.nativeEnum(UserRole).optional().default(UserRole.SALES_REP),
    phone: z.string().optional(),
    timezone: z.string().optional().default('UTC'),
  }),
});

// User login schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    password: z.string()
      .min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
  }),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
  }),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
});

// Change password schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
});

// Email verification schema
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
});

// Resend verification email schema
export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
  }),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Update profile schema
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters')
      .trim()
      .optional(),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters')
      .trim()
      .optional(),
    phone: z.string().optional(),
    timezone: z.string().optional(),
    profilePicture: z.string().url().optional(),
    preferences: z.object({
      notifications: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        dealAssigned: z.boolean().optional(),
        activityDue: z.boolean().optional(),
        teamUpdates: z.boolean().optional(),
      }).optional(),
      dashboard: z.object({
        defaultView: z.string().optional(),
        widgets: z.array(z.string()).optional(),
      }).optional(),
    }).optional(),
  }),
});

// Team invite schema
export const teamInviteSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    role: z.nativeEnum(UserRole),
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters')
      .trim()
      .optional(),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters')
      .trim()
      .optional(),
    message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
  }),
});

// Accept team invite schema
export const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Invite token is required'),
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters')
      .trim(),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters')
      .trim(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>['body'];
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type TeamInviteInput = z.infer<typeof teamInviteSchema>['body'];
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>['body'];