"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deal = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("../types/common");
const dealStageHistorySchema = new mongoose_1.Schema({
    stageId: {
        type: String,
        required: true,
    },
    stageName: {
        type: String,
        required: true,
    },
    enteredAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    exitedAt: {
        type: Date,
    },
    duration: {
        type: Number, // in milliseconds
    },
    reason: {
        type: String,
        trim: true,
    },
    changedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    _id: false,
    timestamps: false,
});
const dealSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Deal title is required'],
        trim: true,
        maxlength: [200, 'Deal title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Deal description cannot exceed 2000 characters'],
    },
    value: {
        type: Number,
        required: [true, 'Deal value is required'],
        min: [0, 'Deal value cannot be negative'],
        default: 0,
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'USD',
        uppercase: true,
        minlength: [3, 'Currency code must be 3 characters'],
        maxlength: [3, 'Currency code must be 3 characters'],
    },
    priority: {
        type: String,
        enum: Object.values(common_1.DealPriority),
        default: common_1.DealPriority.MEDIUM,
    },
    status: {
        type: String,
        enum: Object.values(common_1.DealStatus),
        default: common_1.DealStatus.OPEN,
    },
    probability: {
        type: Number,
        min: [0, 'Probability cannot be less than 0'],
        max: [100, 'Probability cannot be more than 100'],
        default: 50,
    },
    expectedCloseDate: {
        type: Date,
    },
    actualCloseDate: {
        type: Date,
    },
    // Relationships
    pipelineId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Pipeline',
        required: [true, 'Pipeline ID is required'],
    },
    stageId: {
        type: String,
        required: [true, 'Stage ID is required'],
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    contactId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Contact',
    },
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization ID is required'],
    },
    // Stage tracking
    stageHistory: [dealStageHistorySchema],
    currentStageEnteredAt: {
        type: Date,
        default: Date.now,
    },
    daysInCurrentStage: {
        type: Number,
        default: 0,
    },
    // Sales metrics
    source: {
        type: String,
        trim: true,
    },
    lostReason: {
        type: String,
        trim: true,
    },
    wonReason: {
        type: String,
        trim: true,
    },
    competitorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Competitor',
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
    // Activity tracking
    lastActivityAt: {
        type: Date,
    },
    lastContactedAt: {
        type: Date,
    },
    nextFollowUpAt: {
        type: Date,
    },
    // Attachments and notes
    attachments: [{
            type: String, // File URLs or IDs
        }],
    notes: [{
            content: {
                type: String,
                required: true,
                trim: true,
            },
            createdBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            isPrivate: {
                type: Boolean,
                default: false,
            },
        }],
    // Analytics
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
dealSchema.index({ organizationId: 1 });
dealSchema.index({ pipelineId: 1 });
dealSchema.index({ stageId: 1 });
dealSchema.index({ assignedTo: 1 });
dealSchema.index({ contactId: 1 });
dealSchema.index({ companyId: 1 });
dealSchema.index({ status: 1 });
dealSchema.index({ priority: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ value: 1 });
dealSchema.index({ createdAt: 1 });
dealSchema.index({ isDeleted: 1 });
// Compound indexes
dealSchema.index({ organizationId: 1, status: 1 });
dealSchema.index({ organizationId: 1, assignedTo: 1 });
dealSchema.index({ pipelineId: 1, stageId: 1 });
// Text index for search
dealSchema.index({
    title: 'text',
    description: 'text',
    'notes.content': 'text'
});
// Virtual for days since creation
dealSchema.virtual('daysSinceCreation').get(function () {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});
// Virtual for is overdue
dealSchema.virtual('isOverdue').get(function () {
    if (!this.expectedCloseDate)
        return false;
    return new Date() > this.expectedCloseDate && this.status === common_1.DealStatus.OPEN;
});
// Method to move deal to a new stage
dealSchema.methods.moveToStage = function (stageId, reason, changedBy) {
    // Close current stage history entry
    const currentHistory = this.stageHistory[this.stageHistory.length - 1];
    if (currentHistory && !currentHistory.exitedAt) {
        currentHistory.exitedAt = new Date();
        currentHistory.duration = currentHistory.exitedAt.getTime() - currentHistory.enteredAt.getTime();
    }
    // Add new stage history entry
    this.stageHistory.push({
        stageId,
        stageName: '', // This should be populated with actual stage name
        enteredAt: new Date(),
        reason,
        changedBy: changedBy || this.updatedBy,
    });
    // Update current stage
    this.stageId = stageId;
    this.currentStageEnteredAt = new Date();
    this.daysInCurrentStage = 0;
};
// Method to calculate days in current stage
dealSchema.methods.calculateDaysInStage = function () {
    const now = new Date();
    const entered = new Date(this.currentStageEnteredAt);
    const diffTime = Math.abs(now.getTime() - entered.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
// Method to check if deal is stuck
dealSchema.methods.isStuck = function (stuckDays = 7) {
    return this.calculateDaysInStage() > stuckDays && this.status === common_1.DealStatus.OPEN;
};
// Pre-save middleware to update daysInCurrentStage
dealSchema.pre('save', function (next) {
    if (this.isModified('currentStageEnteredAt') || this.isNew) {
        this.daysInCurrentStage = this.calculateDaysInStage();
    }
    next();
});
// Pre-save middleware to initialize stage history
dealSchema.pre('save', function (next) {
    if (this.isNew && this.stageHistory.length === 0) {
        this.stageHistory.push({
            stageId: this.stageId,
            stageName: '', // This should be populated with actual stage name
            enteredAt: this.currentStageEnteredAt,
            changedBy: this.createdBy,
        });
    }
    next();
});
// Query middleware to exclude deleted deals by default
dealSchema.pre(/^find/, function () {
    this.find({ isDeleted: { $ne: true } });
});
exports.Deal = (0, mongoose_1.model)('Deal', dealSchema);
