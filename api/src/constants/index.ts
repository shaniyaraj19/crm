// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Default pagination settings
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// JWT Token settings
export const JWT = {
  ACCESS_TOKEN_EXPIRES: '15m',
  REFRESH_TOKEN_EXPIRES: '7d',
  RESET_TOKEN_EXPIRES: '1h',
  VERIFY_TOKEN_EXPIRES: '24h',
} as const;

// File upload settings
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
} as const;

// Email settings
export const EMAIL = {
  FROM_NAME: 'V-Accel CRM',
  TEMPLATES: {
    WELCOME: 'welcome',
    RESET_PASSWORD: 'reset-password',
    VERIFY_EMAIL: 'verify-email',
    TEAM_INVITE: 'team-invite',
    DEAL_ASSIGNED: 'deal-assigned',
    ACTIVITY_REMINDER: 'activity-reminder',
  },
} as const;

// Rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 5, // 5 login attempts per 15 minutes
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  PIPELINE_DATA: 600, // 10 minutes
  DASHBOARD_DATA: 180, // 3 minutes
  REPORTS: 900, // 15 minutes
} as const;

// Notification settings
export const NOTIFICATIONS = {
  BATCH_SIZE: 50,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 seconds
} as const;

// Activity reminder settings
export const ACTIVITY_REMINDERS = {
  DEFAULT_REMINDER_MINUTES: [15, 60, 1440], // 15 min, 1 hour, 1 day
  MAX_REMINDERS: 5,
} as const;

// Deal settings
export const DEAL_SETTINGS = {
  DEFAULT_CURRENCY: 'USD',
  MIN_VALUE: 0,
  MAX_VALUE: 999999999.99,
  DEFAULT_PROBABILITY: 50,
} as const;

// Pipeline settings
export const PIPELINE_SETTINGS = {
  DEFAULT_STAGES: [
    { name: 'Lead', probability: 10, color: '#6B7280' },
    { name: 'Qualified', probability: 25, color: '#3B82F6' },
    { name: 'Proposal', probability: 50, color: '#F59E0B' },
    { name: 'Negotiation', probability: 75, color: '#EF4444' },
    { name: 'Closed Won', probability: 100, color: '#10B981' },
    { name: 'Closed Lost', probability: 0, color: '#6B7280' },
  ],
  MAX_STAGES: 10,
  MIN_STAGES: 2,
} as const;

// Search settings
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 50,
  DEBOUNCE_MS: 300,
} as const;

// WebSocket events
export const WEBSOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Deal events
  DEAL_CREATED: 'deal:created',
  DEAL_UPDATED: 'deal:updated',
  DEAL_DELETED: 'deal:deleted',
  DEAL_STAGE_CHANGED: 'deal:stage_changed',
  
  // Activity events
  ACTIVITY_CREATED: 'activity:created',
  ACTIVITY_UPDATED: 'activity:updated',
  ACTIVITY_COMPLETED: 'activity:completed',
  ACTIVITY_DUE: 'activity:due',
  
  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  
  // User events
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  
  // System events
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_UPDATE: 'system:update',
} as const;

// Audit log actions
export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PERMISSION_CHANGE: 'permission_change',
  EXPORT: 'export',
  IMPORT: 'import',
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export * from './permissions';