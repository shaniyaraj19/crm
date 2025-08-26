// Common types for the CRM application

// Base Document interface
export interface BaseDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

// Contact Types
export interface Contact extends BaseDocument {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  type: 'lead' | 'prospect' | 'customer' | 'partner';
  
  // Company relationship
  companyId?: string;
  company?: Company; // Populated field
  
  // Address information
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  
  // Social and web presence
  website?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  
  // Lead information
  leadSource?: string;
  leadScore?: number;
  leadStatus?: string;
  
  // Assignment and organization
  assignedTo?: string;
  organizationId: string;
  
  // Custom fields and tags
  customFields?: Record<string, any>;
  tags?: string[];
  labels?: string[];
  
  // Communication preferences
  preferences?: {
    emailOptIn?: boolean;
    smsOptIn?: boolean;
    callOptIn?: boolean;
    preferredContactMethod?: string;
    timezone?: string;
  };
  
  // Activity tracking
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  
  // Notes and attachments
  notes?: string;
  attachments?: string[];
  
  // Virtual fields
  fullName: string;
}

// Company Types
export interface Company extends BaseDocument {
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  fax?: string;
  
  // Company size and details
  employeeCount?: number;
  annualRevenue?: number;
  currency?: string;
  foundedYear?: number;
  companyType?: string;
  
  // Address information
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  
  // Billing address
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  
  // Social presence
  linkedinUrl?: string;
  twitterHandle?: string;
  facebookUrl?: string;
  
  // Lead information
  leadSource?: string;
  leadScore?: number;
  leadStatus?: string;
  
  // Relationships
  parentCompanyId?: string;
  assignedTo?: string;
  organizationId: string;
  
  // Custom fields and tags
  customFields?: Record<string, any>;
  tags?: string[];
  labels?: string[];
  
  // Notes
  notes?: string;
}

// Deal Types
export interface Deal extends BaseDocument {
  title: string;
  description?: string;
  value: number;
  currency: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'won' | 'lost' | 'pending';
  probability: number; // 0-100
  expectedCloseDate?: string;
  actualCloseDate?: string;
  
  // Relationships
  pipelineId: string;
  stageId: string;
  assignedTo?: string;
  contactId?: string;
  dealId?: string;
  organizationId: string;
  
  // Stage tracking
  stageHistory: {
    stageId: string;
    stageName: string;
    enteredAt: string;
    exitedAt?: string;
    duration?: number;
    reason?: string;
    changedBy: string;
  }[];
  currentStageEnteredAt: string;
  daysInCurrentStage: number;
  
  // Sales metrics
  source?: string;
  lostReason?: string;
  wonReason?: string;
  competitorId?: string;
  
  // Custom fields and tags
  customFields?: Record<string, any>;
  tags?: string[];
  labels?: string[];
  
  // Activity tracking
  lastActivityAt?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  
  // Attachments and notes
  attachments?: string[];
  notes?: {
    content: string;
    createdBy: string;
    createdAt: string;
    isPrivate?: boolean;
  }[];
  
  // Analytics
  totalActivities?: number;
  totalEmails?: number;
  totalCalls?: number;
  totalMeetings?: number;
}

// Activity Types
export interface Activity extends BaseDocument {
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  title: string;
  description?: string;
  
  // Relationships
  userId: string; // Assigned user
  contactId?: string;
  dealId?: string;
  companyId?: string;
  organizationId: string;
  
  // Scheduling
  scheduledAt?: string;
  dueDate?: string;
  completedAt?: string;
  duration?: number; // in minutes
  
  // Status and priority
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Location and meeting details
  location?: string;
  meetingUrl?: string;
  meetingType?: 'in-person' | 'video-call' | 'phone-call';
  
  // Communication details
  outcome?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  
  // Attachments and notes
  attachments?: string[];
  notes?: string;
  
  // Reminders
  reminders?: {
    time: string;
    sent: boolean;
  }[];
  
  // Custom fields and tags
  customFields?: Record<string, any>;
  tags?: string[];
  
  // Analytics
  timeSpent?: number; // in minutes
  responseReceived?: boolean;
}

// Pipeline Types
export interface PipelineStage {
  _id: string;
  name: string;
  description?: string;
  order: number;
  probability: number;
  color: string;
  isActive: boolean;
  dealCount?: number;
  totalValue?: number;
}

export interface Pipeline extends BaseDocument {
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  organizationId: string;
  stages: PipelineStage[];
  settings?: {
    autoProgressDeals?: boolean;
    requireStageReason?: boolean;
    enableProbabilityCalculation?: boolean;
  };
}

// User Types  
export interface User extends BaseDocument {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'sales_rep';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  profilePicture?: string;
  phone?: string;
  timezone: string;
  organizationId?: string;
  permissions: string[];
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      dealAssigned?: boolean;
      activityDue?: boolean;
      teamUpdates?: boolean;
    };
    dashboard?: {
      defaultView?: string;
      widgets?: string[];
    };
  };
  fullName: string;
}

// Analytics Types
export interface KPIData {
  title: string;
  value: string | number;
  change: string | number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: 'success' | 'primary' | 'warning' | 'accent';
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface FilterOptions {
  dateRange?: {
    from: string;
    to: string;
  };
  status?: string[];
  assignee?: string[];
  tags?: string[];
}

// Form related types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface SelectOption {
  value: string;
  label: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  iconName?: string;
  iconPosition?: 'left' | 'right';
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}