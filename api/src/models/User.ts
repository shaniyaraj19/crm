import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BaseDocument, UserRole } from '../types/common';

export interface IUser extends BaseDocument {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  profilePicture?: string;
  phone?: string;
  timezone?: string;
  organizationId?: string;
  permissions?: string[];
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      dealAssigned?: boolean;
      activityDue?: boolean;
      teamUpdates?: boolean;
    };
    dashboard?: {
      defaultView?: string;
      widgets?: string[];
    };
  };
  
  // Virtual fields
  fullName: string;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
  toJSON(): any;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.SALES_REP,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  lastLogin: {
    type: Date,
  },
  profilePicture: {
    type: String,
  },
  phone: {
    type: String,
    trim: true,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
  },
  permissions: [{
    type: String,
  }],
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      dealAssigned: { type: Boolean, default: true },
      activityDue: { type: Boolean, default: true },
      teamUpdates: { type: Boolean, default: true },
    },
    dashboard: {
      defaultView: { type: String, default: 'pipeline' },
      widgets: [{ type: String }],
    },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for full name
userSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ organizationId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isDeleted: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
  
  this.passwordResetToken = bcrypt.hashSync(resetToken, 10);
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function(): string {
  const verificationToken = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
  
  this.emailVerificationToken = bcrypt.hashSync(verificationToken, 10);
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return verificationToken;
};

// Override toJSON to remove sensitive fields
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  return userObject;
};

// Query middleware to exclude deleted users by default
userSchema.pre(/^find/, function(this: any) {
  this.find({ isDeleted: { $ne: true } });
});

export const User = model<IUser>('User', userSchema);