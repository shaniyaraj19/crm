import { Schema, model, Types } from 'mongoose';
import { BaseDocument, DealPriority, DealStatus } from '../types/common';

export interface IDealStageHistory {
  stageId: string;
  stageName: string;
  enteredAt: Date;
  exitedAt?: Date;
  duration?: number; // in milliseconds
  reason?: string;
  changedBy: Types.ObjectId;
}

export interface IDeal extends BaseDocument {
  title: string;
  description?: string;
  value: number;
  currency: string;
  priority: DealPriority;
  status: DealStatus;
  probability: number; // 0-100
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  
  // Relationships
  pipelineId: Types.ObjectId;
  stageId: string;
  assignedTo?: Types.ObjectId;
  contactId?: Types.ObjectId;
  companyId?: Types.ObjectId;
  organizationId: Types.ObjectId;
  
  // Stage tracking
  stageHistory: IDealStageHistory[];
  currentStageEnteredAt: Date;
  daysInCurrentStage: number;
  
  // Sales metrics
  source?: string;
  lostReason?: string;
  wonReason?: string;
  competitorId?: string;
  
  // Custom fields
  customFields?: Record<string, any>;
  
  // Tags and labels
  tags?: string[];
  labels?: string[];
  
  // Activity tracking
  lastActivityAt?: Date;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
  
  // Attachments and notes
  attachments?: string[];
  notes?: {
    content: string;
    createdBy: string;
    createdAt: Date;
    isPrivate?: boolean;
  }[];
  
  // Analytics
  totalActivities?: number;
  totalEmails?: number;
  totalCalls?: number;
  totalMeetings?: number;
  
  // Methods
  moveToStage(stageId: string, reason?: string, changedBy?: string): void;
  calculateDaysInStage(): number;
  isOverdue(): boolean;
  isStuck(stuckDays?: number): boolean;
}

const dealStageHistorySchema = new Schema<IDealStageHistory>({
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  _id: false,
  timestamps: false,
});

const dealSchema = new Schema<IDeal>({
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
    enum: Object.values(DealPriority),
    default: DealPriority.MEDIUM,
  },
  status: {
    type: String,
    enum: Object.values(DealStatus),
    default: DealStatus.OPEN,
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
    type: Schema.Types.ObjectId,
    ref: 'Pipeline',
    required: [true, 'Pipeline ID is required'],
  },
  stageId: {
    type: String,
    required: [true, 'Stage ID is required'],
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  contactId: {
    type: Schema.Types.ObjectId,
    ref: 'Contact',
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
  },
  organizationId: {
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
    ref: 'Competitor',
  },
  
  // Custom fields
  customFields: {
    type: Schema.Types.Mixed,
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
      type: Schema.Types.ObjectId,
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required'],
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
dealSchema.virtual('daysSinceCreation').get(function(this: IDeal) {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
dealSchema.virtual('isOverdue').get(function(this: IDeal) {
  if (!this.expectedCloseDate) return false;
  return new Date() > this.expectedCloseDate && this.status === DealStatus.OPEN;
});

// Method to move deal to a new stage
dealSchema.methods.moveToStage = function(stageId: string, reason?: string, changedBy?: string) {
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
dealSchema.methods.calculateDaysInStage = function(): number {
  const now = new Date();
  const entered = new Date(this.currentStageEnteredAt);
  const diffTime = Math.abs(now.getTime() - entered.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Method to check if deal is stuck
dealSchema.methods.isStuck = function(stuckDays: number = 7): boolean {
  return this.calculateDaysInStage() > stuckDays && this.status === DealStatus.OPEN;
};

// Pre-save middleware to update daysInCurrentStage
dealSchema.pre('save', function(next) {
  if (this.isModified('currentStageEnteredAt') || this.isNew) {
    this.daysInCurrentStage = this.calculateDaysInStage();
  }
  next();
});

// Pre-save middleware to initialize stage history
dealSchema.pre('save', function(next) {
  if (this.isNew && this.stageHistory.length === 0) {
    this.stageHistory.push({
      stageId: this.stageId,
      stageName: '', // This should be populated with actual stage name
      enteredAt: this.currentStageEnteredAt,
      changedBy: this.createdBy!,
    });
  }
  next();
});

// Query middleware to exclude deleted deals by default
dealSchema.pre(/^find/, function(this: any) {
  this.find({ isDeleted: { $ne: true } });
});

export const Deal = model<IDeal>('Deal', dealSchema);