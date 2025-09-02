import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  description?: string;
  
  // Relationships
  companyId?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  
  // File metadata
  fileType: 'document' | 'image' | 'video' | 'audio' | 'other';
  isPublic: boolean;
  downloadCount: number;
  lastDownloadedAt?: Date;
  
  // Audit fields
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>({
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  path: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Relationships
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    index: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // File metadata
  fileType: {
    type: String,
    enum: ['document', 'image', 'video', 'audio', 'other'],
    required: true,
    default: 'other'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadedAt: {
    type: Date
  },
  
  // Audit fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
FileSchema.index({ organizationId: 1, isDeleted: 1 });
FileSchema.index({ companyId: 1, isDeleted: 1 });
FileSchema.index({ uploadedBy: 1, isDeleted: 1 });
FileSchema.index({ fileType: 1, isDeleted: 1 });
FileSchema.index({ createdAt: -1 });

// Virtual for download URL
FileSchema.virtual('downloadUrl').get(function() {
  return `/api/v1/files/${this._id}/download`;
});

// Virtual for preview URL
FileSchema.virtual('previewUrl').get(function() {
  return `/api/v1/files/${this._id}/preview`;
});

// Virtual for thumbnail URL
FileSchema.virtual('thumbnailUrl').get(function() {
  return `/api/v1/files/${this._id}/thumbnail`;
});

// Pre-save middleware to set file type based on mimetype
FileSchema.pre('save', function(next) {
  if (this.isModified('mimetype')) {
    const mime = this.mimetype.toLowerCase();
    
    if (mime.startsWith('image/')) {
      this.fileType = 'image';
    } else if (mime.startsWith('video/')) {
      this.fileType = 'video';
    } else if (mime.startsWith('audio/')) {
      this.fileType = 'audio';
    } else if (mime.includes('pdf') || mime.includes('document') || mime.includes('text')) {
      this.fileType = 'document';
    } else {
      this.fileType = 'other';
    }
  }
  
  next();
});

// Soft delete method
FileSchema.methods.softDelete = function(userId: string) {
  this.isDeleted = true;
  this.deletedBy = userId;
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
FileSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedBy = undefined;
  this.deletedAt = undefined;
  return this.save();
};

// Increment download count
FileSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  return this.save();
};

export const File = mongoose.model<IFile>('File', FileSchema);
