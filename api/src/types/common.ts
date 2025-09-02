import { Document, Types } from 'mongoose';

// Base interface for all documents
export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

// User roles
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES_REP = 'sales_rep',
}

// Permission types
export enum Permission {
  // User permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Pipeline permissions
  PIPELINE_CREATE = 'pipeline:create',
  PIPELINE_READ = 'pipeline:read',
  PIPELINE_UPDATE = 'pipeline:update',
  PIPELINE_DELETE = 'pipeline:delete',
  
  // Deal permissions
  DEAL_CREATE = 'deal:create',
  DEAL_READ = 'deal:read',
  DEAL_UPDATE = 'deal:update',
  DEAL_DELETE = 'deal:delete',
  DEAL_ASSIGN = 'deal:assign',
  
  // Contact permissions
  CONTACT_CREATE = 'contact:create',
  CONTACT_READ = 'contact:read',
  CONTACT_UPDATE = 'contact:update',
  CONTACT_DELETE = 'contact:delete',
  
  // Company permissions
  COMPANY_CREATE = 'company:create',
  COMPANY_READ = 'company:read',
  COMPANY_UPDATE = 'company:update',
  COMPANY_DELETE = 'company:delete',
  
  // Activity permissions
  ACTIVITY_CREATE = 'activity:create',
  ACTIVITY_READ = 'activity:read',
  ACTIVITY_UPDATE = 'activity:update',
  ACTIVITY_DELETE = 'activity:delete',
  

  
  // Report permissions
  REPORT_READ = 'report:read',
  REPORT_CREATE = 'report:create',
  
  // Admin permissions
  ADMIN_ACCESS = 'admin:access',
  SYSTEM_SETTINGS = 'system:settings',
}

// Activity types
export enum ActivityType {
  TASK = 'task',
  CALL = 'call',
  MEETING = 'meeting',
  EMAIL = 'email',
  NOTE = 'note',
}

// Activity status
export enum ActivityStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

// Deal priority
export enum DealPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Deal status
export enum DealStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
  PENDING = 'pending',
}

// Contact type
export enum ContactType {
  LEAD = 'lead',
  PROSPECT = 'prospect',
  CUSTOMER = 'customer',
  PARTNER = 'partner',
}

// Communication channel
export enum CommunicationChannel {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call',
}

// Notification types
export enum NotificationType {
  DEAL_ASSIGNED = 'deal_assigned',
  DEAL_UPDATED = 'deal_updated',
  DEAL_WON = 'deal_won',
  DEAL_LOST = 'deal_lost',
  ACTIVITY_DUE = 'activity_due',
  ACTIVITY_OVERDUE = 'activity_overdue',
  TEAM_INVITE = 'team_invite',
  SYSTEM_ALERT = 'system_alert',
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Filter parameters
export interface FilterParams {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  assignedTo?: string;
  createdBy?: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string; // String for JWT serialization
  email: string;
  role: UserRole;
  permissions: Permission[];
  organizationId?: string;
  iat?: number;
  exp?: number;
}

// Request with user
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}



// Email template types
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
  variables?: Record<string, any>;
}

// Webhook payload
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: Date;
  organizationId: string;
}

// Search result
export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Audit log entry
export interface AuditLogEntry {
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userEmail: string;
  timestamp: Date;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}