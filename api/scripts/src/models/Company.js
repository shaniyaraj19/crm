"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const mongoose_1 = require("mongoose");
const addressSchema = new mongoose_1.Schema({
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
}, { _id: false });
const companySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Company description cannot exceed 2000 characters'],
    },
    industry: {
        type: String,
        trim: true,
        maxlength: [100, 'Industry cannot exceed 100 characters'],
    },
    website: {
        type: String,
        trim: true,
        match: [/^https?:\/\//, 'Website must be a valid URL starting with http:// or https://'],
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    phone: {
        type: String,
        trim: true,
    },
    fax: {
        type: String,
        trim: true,
    },
    // Company size and details
    employeeCount: {
        type: Number,
        min: [0, 'Employee count cannot be negative'],
    },
    annualRevenue: {
        type: Number,
        min: [0, 'Annual revenue cannot be negative'],
    },
    currency: {
        type: String,
        uppercase: true,
        minlength: [3, 'Currency code must be 3 characters'],
        maxlength: [3, 'Currency code must be 3 characters'],
        default: 'USD',
    },
    foundedYear: {
        type: Number,
        min: [1800, 'Founded year must be after 1800'],
        max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
    },
    companyType: {
        type: String,
        enum: ['Public', 'Private', 'Non-profit', 'Government', 'Partnership', 'Sole Proprietorship'],
    },
    // Address information
    address: addressSchema,
    billingAddress: addressSchema,
    // Social and web presence
    linkedinUrl: {
        type: String,
        trim: true,
    },
    twitterHandle: {
        type: String,
        trim: true,
    },
    facebookUrl: {
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
    // Parent company relationship
    parentCompanyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
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
    // Status and lifecycle
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Prospect', 'Customer', 'Partner'],
        default: 'Prospect',
    },
    lifecycle: {
        type: String,
        enum: ['Lead', 'Prospect', 'Customer', 'Partner', 'Former Customer'],
        default: 'Lead',
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
    totalContacts: {
        type: Number,
        default: 0,
    },
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
companySchema.index({ organizationId: 1 });
companySchema.index({ name: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ status: 1 });
companySchema.index({ lifecycle: 1 });
companySchema.index({ leadSource: 1 });
companySchema.index({ createdAt: 1 });
companySchema.index({ isDeleted: 1 });
companySchema.index({ parentCompanyId: 1 });
// Compound indexes
companySchema.index({ organizationId: 1, name: 1 });
companySchema.index({ organizationId: 1, industry: 1 });
companySchema.index({ organizationId: 1, status: 1 });
// Text index for search
companySchema.index({
    name: 'text',
    description: 'text',
    industry: 'text',
    'address.city': 'text',
    'address.state': 'text',
    'address.country': 'text'
});
// Unique company name per organization
companySchema.index({ organizationId: 1, name: 1 }, {
    unique: true,
    partialFilterExpression: { isDeleted: { $ne: true } }
});
// Virtual for full address
companySchema.virtual('fullAddress').get(function () {
    if (!this.address)
        return '';
    const parts = [
        this.address.street,
        this.address.city,
        this.address.state,
        this.address.zipCode,
        this.address.country
    ].filter(Boolean);
    return parts.join(', ');
});
// Virtual for company size category
companySchema.virtual('sizeCategory').get(function () {
    if (!this.employeeCount)
        return 'Unknown';
    if (this.employeeCount <= 10)
        return 'Startup';
    if (this.employeeCount <= 50)
        return 'Small';
    if (this.employeeCount <= 200)
        return 'Medium';
    if (this.employeeCount <= 1000)
        return 'Large';
    return 'Enterprise';
});
// Virtual for revenue category
companySchema.virtual('revenueCategory').get(function () {
    if (!this.annualRevenue)
        return 'Unknown';
    if (this.annualRevenue <= 100000)
        return 'Micro';
    if (this.annualRevenue <= 1000000)
        return 'Small';
    if (this.annualRevenue <= 10000000)
        return 'Medium';
    if (this.annualRevenue <= 100000000)
        return 'Large';
    return 'Enterprise';
});
// Pre-save middleware to update lastActivityAt
companySchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.lastActivityAt = new Date();
    }
    next();
});
// Method to calculate company score based on various factors
companySchema.methods.calculateCompanyScore = function () {
    let score = 0;
    // Base score for having complete information
    if (this.website)
        score += 10;
    if (this.email)
        score += 10;
    if (this.phone)
        score += 10;
    if (this.industry)
        score += 10;
    if (this.employeeCount)
        score += 10;
    if (this.annualRevenue)
        score += 15;
    // Activity-based scoring
    score += Math.min(this.totalContacts * 5, 20);
    score += Math.min(this.totalDeals * 3, 15);
    score += Math.min(this.totalActivities * 1, 10);
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
// Method to get subsidiary companies
companySchema.methods.getSubsidiaries = async function () {
    return await this.constructor.find({
        parentCompanyId: this._id,
        organizationId: this.organizationId
    });
};
// Method to get company hierarchy
companySchema.methods.getHierarchy = async function () {
    const subsidiaries = await this.getSubsidiaries();
    const parent = this.parentCompanyId ?
        await this.constructor.findById(this.parentCompanyId) : null;
    return {
        parent,
        current: this,
        subsidiaries,
    };
};
// Query middleware to exclude deleted companies by default
companySchema.pre(/^find/, function () {
    this.find({ isDeleted: { $ne: true } });
});
exports.Company = (0, mongoose_1.model)('Company', companySchema);
