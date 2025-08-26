import { Permission, UserRole } from '../types/common';

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // All permissions for admin
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.PIPELINE_CREATE,
    Permission.PIPELINE_READ,
    Permission.PIPELINE_UPDATE,
    Permission.PIPELINE_DELETE,
    Permission.DEAL_CREATE,
    Permission.DEAL_READ,
    Permission.DEAL_UPDATE,
    Permission.DEAL_DELETE,
    Permission.DEAL_ASSIGN,
    Permission.CONTACT_CREATE,
    Permission.CONTACT_READ,
    Permission.CONTACT_UPDATE,
    Permission.CONTACT_DELETE,
    Permission.COMPANY_CREATE,
    Permission.COMPANY_READ,
    Permission.COMPANY_UPDATE,
    Permission.COMPANY_DELETE,
    Permission.ACTIVITY_CREATE,
    Permission.ACTIVITY_READ,
    Permission.ACTIVITY_UPDATE,
    Permission.ACTIVITY_DELETE,
    Permission.REPORT_READ,
    Permission.REPORT_CREATE,
    Permission.ADMIN_ACCESS,
    Permission.SYSTEM_SETTINGS,
  ],
  
  [UserRole.MANAGER]: [
    // Manager permissions - can manage team and view reports
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.PIPELINE_CREATE,
    Permission.PIPELINE_READ,
    Permission.PIPELINE_UPDATE,
    Permission.PIPELINE_DELETE,
    Permission.DEAL_CREATE,
    Permission.DEAL_READ,
    Permission.DEAL_UPDATE,
    Permission.DEAL_DELETE,
    Permission.DEAL_ASSIGN,
    Permission.CONTACT_CREATE,
    Permission.CONTACT_READ,
    Permission.CONTACT_UPDATE,
    Permission.CONTACT_DELETE,
    Permission.COMPANY_CREATE,
    Permission.COMPANY_READ,
    Permission.COMPANY_UPDATE,
    Permission.COMPANY_DELETE,
    Permission.ACTIVITY_CREATE,
    Permission.ACTIVITY_READ,
    Permission.ACTIVITY_UPDATE,
    Permission.ACTIVITY_DELETE,
    Permission.REPORT_READ,
    Permission.REPORT_CREATE,
  ],
  
  [UserRole.SALES_REP]: [
    // Sales rep permissions - limited to own data and basic operations
    Permission.USER_READ,
    Permission.PIPELINE_READ,
    Permission.DEAL_CREATE,
    Permission.DEAL_READ,
    Permission.DEAL_UPDATE,
    Permission.CONTACT_CREATE,
    Permission.CONTACT_READ,
    Permission.CONTACT_UPDATE,
    Permission.COMPANY_CREATE,
    Permission.COMPANY_READ,
    Permission.COMPANY_UPDATE,
    Permission.ACTIVITY_CREATE,
    Permission.ACTIVITY_READ,
    Permission.ACTIVITY_UPDATE,
    Permission.ACTIVITY_DELETE,
    Permission.REPORT_READ,
  ],
};

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [Permission.USER_CREATE]: 'Create new users',
  [Permission.USER_READ]: 'View user information',
  [Permission.USER_UPDATE]: 'Update user information',
  [Permission.USER_DELETE]: 'Delete users',
  
  [Permission.PIPELINE_CREATE]: 'Create new pipelines',
  [Permission.PIPELINE_READ]: 'View pipelines',
  [Permission.PIPELINE_UPDATE]: 'Update pipelines',
  [Permission.PIPELINE_DELETE]: 'Delete pipelines',
  
  [Permission.DEAL_CREATE]: 'Create new deals',
  [Permission.DEAL_READ]: 'View deals',
  [Permission.DEAL_UPDATE]: 'Update deals',
  [Permission.DEAL_DELETE]: 'Delete deals',
  [Permission.DEAL_ASSIGN]: 'Assign deals to team members',
  
  [Permission.CONTACT_CREATE]: 'Create new contacts',
  [Permission.CONTACT_READ]: 'View contacts',
  [Permission.CONTACT_UPDATE]: 'Update contacts',
  [Permission.CONTACT_DELETE]: 'Delete contacts',
  
  [Permission.COMPANY_CREATE]: 'Create new companies',
  [Permission.COMPANY_READ]: 'View companies',
  [Permission.COMPANY_UPDATE]: 'Update companies',
  [Permission.COMPANY_DELETE]: 'Delete companies',
  
  [Permission.ACTIVITY_CREATE]: 'Create new activities',
  [Permission.ACTIVITY_READ]: 'View activities',
  [Permission.ACTIVITY_UPDATE]: 'Update activities',
  [Permission.ACTIVITY_DELETE]: 'Delete activities',
  
  [Permission.REPORT_READ]: 'View reports and dashboards',
  [Permission.REPORT_CREATE]: 'Create custom reports',
  
  [Permission.ADMIN_ACCESS]: 'Access admin panel',
  [Permission.SYSTEM_SETTINGS]: 'Manage system settings',
};

// Helper function to get permissions for a role
export const getPermissionsForRole = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

// Helper function to check if role has permission
export const roleHasPermission = (role: UserRole, permission: Permission): boolean => {
  const rolePermissions = getPermissionsForRole(role);
  return rolePermissions.includes(permission);
};