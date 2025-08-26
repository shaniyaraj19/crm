import { Schema, model, Types } from 'mongoose';
import { BaseDocument } from '../types/common';

export interface IPipelineStage {
  _id?: string;
  name: string;
  description?: string;
  probability: number; // Percentage (0-100)
  color: string; // Hex color code
  order: number;
  isActive: boolean;
  isClosedWon: boolean;
  isClosedLost: boolean;
}

export interface IPipeline extends BaseDocument {
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  organizationId: Types.ObjectId;
  stages: IPipelineStage[];
  
  // Analytics fields
  totalDeals?: number;
  totalValue?: number;
  conversionRate?: number;
  averageDealSize?: number;
  averageSalescycle?: number; // in days
  
  // Settings
  settings?: {
    requireStageReason?: boolean;
    autoRotateDeals?: boolean;
    rotationCriteria?: {
      field: string;
      value: any;
    }[];
    notifications?: {
      stageChange?: boolean;
      dealStuck?: boolean;
      stuckDays?: number;
    };
  };
}

const pipelineStageSchema = new Schema<IPipelineStage>({
  name: {
    type: String,
    required: [true, 'Stage name is required'],
    trim: true,
    maxlength: [100, 'Stage name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Stage description cannot exceed 500 characters'],
  },
  probability: {
    type: Number,
    required: [true, 'Stage probability is required'],
    min: [0, 'Probability cannot be less than 0'],
    max: [100, 'Probability cannot be more than 100'],
  },
  color: {
    type: String,
    required: [true, 'Stage color is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color'],
  },
  order: {
    type: Number,
    required: [true, 'Stage order is required'],
    min: [0, 'Order cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isClosedWon: {
    type: Boolean,
    default: false,
  },
  isClosedLost: {
    type: Boolean,
    default: false,
  },
}, {
  _id: true,
  timestamps: false,
});

const pipelineSchema = new Schema<IPipeline>({
  name: {
    type: String,
    required: [true, 'Pipeline name is required'],
    trim: true,
    maxlength: [100, 'Pipeline name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Pipeline description cannot exceed 500 characters'],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required'],
  },
  stages: {
    type: [pipelineStageSchema],
    validate: {
      validator: function(stages: IPipelineStage[]) {
        return stages.length >= 2; // At least 2 stages required
      },
      message: 'Pipeline must have at least 2 stages',
    },
  },
  totalDeals: {
    type: Number,
    default: 0,
  },
  totalValue: {
    type: Number,
    default: 0,
  },
  conversionRate: {
    type: Number,
    default: 0,
  },
  averageDealSize: {
    type: Number,
    default: 0,
  },
  averageSalescycle: {
    type: Number,
    default: 0,
  },
  settings: {
    requireStageReason: { type: Boolean, default: false },
    autoRotateDeals: { type: Boolean, default: false },
    rotationCriteria: [{
      field: { type: String },
      value: { type: Schema.Types.Mixed },
    }],
    notifications: {
      stageChange: { type: Boolean, default: true },
      dealStuck: { type: Boolean, default: true },
      stuckDays: { type: Number, default: 7 },
    },
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
pipelineSchema.index({ organizationId: 1 });
pipelineSchema.index({ isDefault: 1 });
pipelineSchema.index({ isActive: 1 });
pipelineSchema.index({ isDeleted: 1 });
pipelineSchema.index({ 'stages.order': 1 });

// Ensure only one default pipeline per organization
pipelineSchema.index(
  { organizationId: 1, isDefault: 1 },
  { 
    unique: true, 
    partialFilterExpression: { isDefault: true, isDeleted: { $ne: true } } 
  }
);

// Pre-save middleware to sort stages by order
pipelineSchema.pre('save', function(next) {
  if (this.isModified('stages')) {
    this.stages.sort((a, b) => a.order - b.order);
  }
  next();
});

// Pre-save middleware to ensure stage orders are sequential
pipelineSchema.pre('save', function(next) {
  if (this.isModified('stages')) {
    this.stages.forEach((stage, index) => {
      stage.order = index;
    });
  }
  next();
});

// Virtual for active stages
pipelineSchema.virtual('activeStages').get(function(this: IPipeline) {
  return this.stages.filter(stage => stage.isActive);
});

// Virtual for closed won stages
pipelineSchema.virtual('closedWonStages').get(function(this: IPipeline) {
  return this.stages.filter(stage => stage.isClosedWon);
});

// Virtual for closed lost stages
pipelineSchema.virtual('closedLostStages').get(function(this: IPipeline) {
  return this.stages.filter(stage => stage.isClosedLost);
});

// Method to get stage by ID
pipelineSchema.methods.getStageById = function(stageId: string): IPipelineStage | undefined {
  return this.stages.find((stage: IPipelineStage) => stage._id?.toString() === stageId);
};

// Method to get next stage
pipelineSchema.methods.getNextStage = function(currentStageId: string): IPipelineStage | undefined {
  const currentStage = this.getStageById(currentStageId);
  if (!currentStage) return undefined;
  
  const nextStage = this.stages.find((stage: IPipelineStage) => 
    stage.order === currentStage.order + 1 && stage.isActive
  );
  
  return nextStage;
};

// Method to get previous stage
pipelineSchema.methods.getPreviousStage = function(currentStageId: string): IPipelineStage | undefined {
  const currentStage = this.getStageById(currentStageId);
  if (!currentStage) return undefined;
  
  const previousStage = this.stages.find((stage: IPipelineStage) => 
    stage.order === currentStage.order - 1 && stage.isActive
  );
  
  return previousStage;
};

// Method to validate stage transition
pipelineSchema.methods.canTransitionToStage = function(fromStageId: string, toStageId: string): boolean {
  const fromStage = this.getStageById(fromStageId);
  const toStage = this.getStageById(toStageId);
  
  if (!fromStage || !toStage) return false;
  if (!toStage.isActive) return false;
  
  // Allow transitions to any active stage (business rule can be customized)
  return true;
};

// Query middleware to exclude deleted pipelines by default
pipelineSchema.pre(/^find/, function(this: any) {
  this.find({ isDeleted: { $ne: true } });
});

export const Pipeline = model<IPipeline>('Pipeline', pipelineSchema);