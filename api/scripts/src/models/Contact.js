"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("../types/common");
const addressSchema = new mongoose_1.Schema({
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
}, { _id: false });
const contactSchema = new mongoose_1.Schema({
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
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        sparse: true, // Allow multiple null values but unique non-null values
    },
    phone: {
        type: String,
        trim: true,
    },
    mobile: {
        type: String,
        trim: true,
    },
    jobTitle: {
        type: String,
        trim: true,
        maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department cannot exceed 100 characters'],
    },
    type: {
        type: String,
        enum: Object.values(common_1.ContactType),
        default: common_1.ContactType.LEAD,
    },
    // Company relationship
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
    },
    // Address information
    address: addressSchema,
    // Social and web presence
    website: {
        type: String,
        trim: true,
    },
    linkedinUrl: {
        type: String,
        trim: true,
    },
    twitterHandle: {
        type: String,
        trim: true,
    },
    // Lead information
    leadSource: {
        type: String,
        trim: true,
    },
    leadScore: {
        type: Number,
        min: [0, 'Lead score cannot be negative'],
        max: [100, 'Lead score cannot exceed 100'],
    },
    leadStatus: {
        type: String,
        trim: true,
    },
    // Custom fields
    customFields: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    // Tags and labels
    tags: [{
            type: String,
            trim: true,
        }],
    labels: [{
            type: String,
            trim: true,
        }],
    // Communication preferences
    preferences: {
        emailOptIn: { type: Boolean, default: true },
        smsOptIn: { type: Boolean, default: false },
        callOptIn: { type: Boolean, default: true },
        preferredContactMethod: {
            type: String,
            enum: ['email', 'phone', 'sms', 'in_person'],
            default: 'email'
        },
        timezone: { type: String, default: 'UTC' },
    },
    // Activity tracking
    lastContactedAt: {
        type: Date,
    },
    lastActivityAt: {
        type: Date,
    },
    nextFollowUpAt: {
        type: Date,
    },
    // Analytics
    totalDeals: {
        type: Number,
        default: 0,
    },
    totalDealValue: {
        type: Number,
        default: 0,
    },
    totalActivities: {
        type: Number,
        default: 0,
    },
    totalEmails: {
        type: Number,
        default: 0,
    },
    totalCalls: {
        type: Number,
        default: 0,
    },
    totalMeetings: {
        type: Number,
        default: 0,
    },
    // Organization
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization ID is required'],
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by is required'],
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
// Indexes
contactSchema.index({ organizationId: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ companyId: 1 });
contactSchema.index({ type: 1 });
contactSchema.index({ leadSource: 1 });
contactSchema.index({ createdAt: 1 });
contactSchema.index({ isDeleted: 1 });
// Compound indexes
contactSchema.index({ organizationId: 1, email: 1 });
contactSchema.index({ organizationId: 1, type: 1 });
contactSchema.index({ firstName: 1, lastName: 1 });
// Text index for search
contactSchema.index({
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    jobTitle: 'text',
    department: 'text'
});
// Unique email per organization (sparse index allows multiple null values)
contactSchema.index({ organizationId: 1, email: 1 }, {
    unique: true,
    partialFilterExpression: {
        email: { $exists: true, $ne: null },
        isDeleted: { $ne: true }
    }
});
// Virtual for full name
contactSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});
// Virtual for display name (includes company if available)
contactSchema.virtual('displayName').get(function () {
    let name = this.fullName;
    if (this.companyId && this.companyId.name) {
        name += ` (${this.companyId.name})`;
    }
    return name;
});
// Pre-save middleware to update lastActivityAt
contactSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.lastActivityAt = new Date();
    }
    next();
});
// Method to calculate lead score based on activities and engagement
contactSchema.methods.calculateLeadScore = function () {
    let score = 0;
    // Base score for having complete information
    if (this.email)
        score += 10;
    if (this.phone || this.mobile)
        score += 10;
    if (this.companyId)
        score += 15;
    if (this.jobTitle)
        score += 10;
    // Activity-based scoring
    score += Math.min(this.totalEmails * 2, 20);
    score += Math.min(this.totalCalls * 5, 25);
    score += Math.min(this.totalMeetings * 10, 30);
    // Recent activity bonus
    if (this.lastActivityAt) {
        const daysSinceActivity = Math.floor((Date.now() - this.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceActivity <= 7)
            score += 10;
        else if (daysSinceActivity <= 30)
            score += 5;
    }
    return Math.min(score, 100);
};
// Method to get contact's communication timeline
contactSchema.methods.getCommunicationTimeline = async function () {
    // This would typically aggregate activities, emails, calls, etc.
    // For now, return a placeholder
    return [];
};
// Query middleware to exclude deleted contacts by default
contactSchema.pre(/^find/, function () {
    this.find({ isDeleted: { $ne: true } });
});
exports.Contact = (0, mongoose_1.model)('Contact', contactSchema);
