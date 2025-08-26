"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const common_1 = require("../types/common");
const userSchema = new mongoose_1.Schema({
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
        enum: Object.values(common_1.UserRole),
        default: common_1.UserRole.SALES_REP,
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
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
// Indexes
userSchema.index({ email: 1 });
userSchema.index({ organizationId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isDeleted: 1 });
// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    this.passwordResetToken = bcryptjs_1.default.hashSync(resetToken, 10);
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return resetToken;
};
// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
    const verificationToken = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    this.emailVerificationToken = bcryptjs_1.default.hashSync(verificationToken, 10);
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return verificationToken;
};
// Override toJSON to remove sensitive fields
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.passwordResetToken;
    delete userObject.passwordResetExpires;
    delete userObject.emailVerificationToken;
    delete userObject.emailVerificationExpires;
    return userObject;
};
// Query middleware to exclude deleted users by default
userSchema.pre(/^find/, function () {
    this.find({ isDeleted: { $ne: true } });
});
exports.User = (0, mongoose_1.model)('User', userSchema);
