import { Schema, model, Types } from 'mongoose';
import { BaseDocument, ActivityType, ActivityStatus } from '../types/common';

// export interface IActivity extends BaseDocument {
//   type: ActivityType;
//   title: string;
//   description?: string;
  
//   // Relationships
//   userId: Types.ObjectId; // Assigned user
//   contactId?: Types.ObjectId;
//   dealId?: Types.ObjectId;
//   companyId?: Types.ObjectId;
//   organizationId: Types.ObjectId;
  
//   // Scheduling
//   scheduledAt?: Date;
//   dueDate?: Date;
//   completedAt?: Date;
//   duration?: number; // in minutes
  
//   // Status and priority
//   status: ActivityStatus;
//   priority: 'low' | 'medium' | 'high' | 'urgent';
  
//   // Location and meeting details
//   location?: string;
//   meetingUrl?: string;
//   meetingType?: 'in-person' | 'video-call' | 'phone-call';
  
//   // Communication details
//   outcome?: string;
//   followUpRequired?: boolean;
//   followUpDate?: Date;
  
//   // Attachments and notes
//   attachments?: string[];
//   notes?: string;
  
//   // Reminders
//   reminders?: {
//     time: Date;
//     sent: boolean;
//   }[];
  
//   // Custom fields
//   customFields?: Record<string, any>;
  
//   // Tags
//   tags?: string[];
  
//   // Analytics
//   timeSpent?: number; // in minutes
//   responseReceived?: boolean;
  
//   // Methods
//   markComplete(): void;
//   addReminder(time: Date): void;
//   isOverdue(): boolean;
// }
export interface IActivity extends BaseDocument {
  type: ActivityType;
  title: string;
  description?: string;

  // Relationships
  userId: Types.ObjectId;
  contactId?: Types.ObjectId;
  dealId?: Types.ObjectId;
  companyId?: Types.ObjectId;
  organizationId: Types.ObjectId;

  // Scheduling
  scheduledAt?: Date;
  dueDate?: Date;
  completedAt?: Date;
  duration?: number;

  // Status and priority
  status: ActivityStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Location and meeting details
  location?: string;
  meetingUrl?: string;
  meetingType?: 'in-person' | 'video-call' | 'phone-call';

  // Communication details
  outcome?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;

  // Attachments and notes
  attachments?: string[];
  notes?: string;

  // Reminders
  reminders?: {
    time: Date;
    sent: boolean;
  }[];

  // Custom fields
  customFields?: Record<string, any>;

  // Tags
  tags?: string[];

  // Analytics
  timeSpent?: number;
  responseReceived?: boolean;

  // Virtuals
  isOverdue?: boolean;       // <-- now just a property
  daysUntilDue?: number | null;

  // Methods
  markComplete(): void;
  addReminder(time: Date): void;
}

const activitySchema = new Schema<IActivity>({
  type: {
    type: String,
    enum: Object.values(ActivityType),
    required: [true, 'Activity type is required']
  },
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Relationships
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User assignment is required']
  },
  contactId: {
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  dealId: {
    type: Schema.Types.ObjectId,
    ref: 'Deal'
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required']
  },
  
  // Scheduling
  scheduledAt: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    min: [1, 'Duration must be at least 1 minute'],
    max: [1440, 'Duration cannot exceed 24 hours']
  },
  
  // Status and priority
  status: {
    type: String,
    enum: Object.values(ActivityStatus),
    default: ActivityStatus.PENDING
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Location and meeting details
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  meetingUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Meeting URL must be a valid URL'
    }
  },
  meetingType: {
    type: String,
    enum: ['in-person', 'video-call', 'phone-call']
  },
  
  // Communication details
  outcome: {
    type: String,
    trim: true,
    maxlength: [1000, 'Outcome cannot exceed 1000 characters']
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  
  // Attachments and notes
  attachments: [{
    type: String // File URLs or IDs
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Notes cannot exceed 5000 characters']
  },
  
  // Reminders
  reminders: [{
    time: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  
  // Custom fields
  customFields: {
    type: Schema.Types.Mixed
  },
  
  // Tags
  tags: [{
    type: String,
    trim: true
  }],
  
  // Analytics
  timeSpent: {
    type: Number, // in minutes
    min: 0
  },
  responseReceived: {
    type: Boolean,
    default: false
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
activitySchema.index({ organizationId: 1 });
activitySchema.index({ userId: 1 });
activitySchema.index({ contactId: 1 });
activitySchema.index({ dealId: 1 });
activitySchema.index({ companyId: 1 });
activitySchema.index({ status: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ dueDate: 1 });
activitySchema.index({ scheduledAt: 1 });
activitySchema.index({ priority: 1 });
activitySchema.index({ createdAt: 1 });
activitySchema.index({ isDeleted: 1 });

// Compound indexes
activitySchema.index({ organizationId: 1, status: 1 });
activitySchema.index({ organizationId: 1, userId: 1 });
activitySchema.index({ userId: 1, status: 1 });
activitySchema.index({ dueDate: 1, status: 1 });

// Text index for search
activitySchema.index({ 
  title: 'text', 
  description: 'text',
  notes: 'text'
});

// Virtual for is overdue
activitySchema.virtual('isOverdue').get(function(this: IActivity) {
  if (!this.dueDate || this.status === ActivityStatus.COMPLETED || this.status === ActivityStatus.CANCELLED) {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for days until due
activitySchema.virtual('daysUntilDue').get(function(this: IActivity) {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to mark activity as complete
activitySchema.methods.markComplete = function() {
  this.status = ActivityStatus.COMPLETED;
  this.completedAt = new Date();
};

// Method to add reminder
activitySchema.methods.addReminder = function(time: Date) {
  if (!this.reminders) {
    this.reminders = [];
  }
  this.reminders.push({ time, sent: false });
};



// Pre-save middleware to set status based on dates
activitySchema.pre('save', function(next) {
  // Auto-set status to overdue if past due date
  if (this.dueDate && new Date() > this.dueDate && 
      this.status === ActivityStatus.PENDING) {
    this.status = ActivityStatus.OVERDUE;
  }
  
  // Set completed status if completedAt is set
  if (this.completedAt && this.status !== ActivityStatus.COMPLETED) {
    this.status = ActivityStatus.COMPLETED;
  }
  
  next();
});

// Query middleware to exclude deleted activities by default
activitySchema.pre(/^find/, function(this: any) {
  this.find({ isDeleted: { $ne: true } });
});

export const Activity = model<IActivity>('Activity', activitySchema);