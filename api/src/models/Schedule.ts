import { model, Schema, Types } from "mongoose";

export interface ISchedule {
  meetingTitle: string;
  date: Date;
  time: string;
  duration: 10 | 30 | 45 | 60;
  attendees: string;
  notes?: string;
  companyId: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const scheduleSchema = new Schema<ISchedule>({
  meetingTitle: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    enum: [10, 30, 45, 60],
    default: 30,
    required: true
  },
  attendees: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    required: false
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, { 
  timestamps: true 
});

export const Schedule = model<ISchedule>('Schedule', scheduleSchema); 