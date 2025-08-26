import { z } from 'zod';

// Create company schema
export const createCompanySchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Company name is required')
      .max(200, 'Company name cannot exceed 200 characters')
      .trim(),
    description: z.string()
      .max(2000, 'Company description cannot exceed 2000 characters')
      .trim()
      .optional(),
    industry: z.string()
      .max(100, 'Industry cannot exceed 100 characters')
      .trim()
      .optional(),
    website: z.string()
      .url('Website must be a valid URL')
      .optional(),
    email: z.string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim()
      .optional(),
    phone: z.string().trim().optional(),
    fax: z.string().trim().optional(),
    
    // Company size and details
    employeeCount: z.number()
      .min(0, 'Employee count cannot be negative')
      .optional(),
    annualRevenue: z.number()
      .min(0, 'Annual revenue cannot be negative')
      .optional(),
    currency: z.string()
      .length(3, 'Currency code must be 3 characters')
      .toUpperCase()
      .default('USD'),
    foundedYear: z.number()
      .min(1800, 'Founded year must be after 1800')
      .max(new Date().getFullYear(), 'Founded year cannot be in the future')
      .optional(),
    companyType: z.enum(['Public', 'Private', 'Non-profit', 'Government', 'Partnership', 'Sole Proprietorship'])
      .optional(),
    
    // Address information
    address: z.object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      zipCode: z.string().trim().optional(),
      country: z.string().trim().optional(),
    }).optional(),
    
    billingAddress: z.object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      zipCode: z.string().trim().optional(),
      country: z.string().trim().optional(),
    }).optional(),
    
    // Social and web presence
    linkedinUrl: z.string().trim().optional(),
    twitterHandle: z.string().trim().optional(),
    facebookUrl: z.string().trim().optional(),
    
    // Lead information
    leadSource: z.string().trim().optional(),
    leadScore: z.number()
      .min(0, 'Lead score cannot be negative')
      .max(100, 'Lead score cannot exceed 100')
      .optional(),
    leadStatus: z.string().trim().optional(),
    
    // Parent company relationship
    parentCompanyId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent company ID format')
      .optional(),
    
    // Custom fields
    customFields: z.record(z.any()).optional(),
    
    // Tags and labels
    tags: z.array(z.string().trim()).optional(),
    labels: z.array(z.string().trim()).optional(),
    
    // Status and lifecycle
    status: z.enum(['Active', 'Inactive', 'Prospect', 'Customer', 'Partner'])
      .default('Prospect'),
    lifecycle: z.enum(['Lead', 'Prospect', 'Customer', 'Partner', 'Former Customer'])
      .default('Lead'),
    
    // Activity tracking
    nextFollowUpAt: z.string()
      .datetime()
      .transform((str) => new Date(str))
      .optional(),
  }),
});

// Update company schema
export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Company name is required')
      .max(200, 'Company name cannot exceed 200 characters')
      .trim()
      .optional(),
    description: z.string()
      .max(2000, 'Company description cannot exceed 2000 characters')
      .trim()
      .optional(),
    industry: z.string()
      .max(100, 'Industry cannot exceed 100 characters')
      .trim()
      .optional(),
    website: z.string()
      .url('Website must be a valid URL')
      .optional(),
    email: z.string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim()
      .optional(),
    phone: z.string().trim().optional(),
    fax: z.string().trim().optional(),
    
    // Company size and details
    employeeCount: z.number()
      .min(0, 'Employee count cannot be negative')
      .optional(),
    annualRevenue: z.number()
      .min(0, 'Annual revenue cannot be negative')
      .optional(),
    currency: z.string()
      .length(3, 'Currency code must be 3 characters')
      .toUpperCase()
      .optional(),
    foundedYear: z.number()
      .min(1800, 'Founded year must be after 1800')
      .max(new Date().getFullYear(), 'Founded year cannot be in the future')
      .optional(),
    companyType: z.enum(['Public', 'Private', 'Non-profit', 'Government', 'Partnership', 'Sole Proprietorship'])
      .optional(),
    
    // Address information
    address: z.object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      zipCode: z.string().trim().optional(),
      country: z.string().trim().optional(),
    }).optional(),
    
    billingAddress: z.object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      zipCode: z.string().trim().optional(),
      country: z.string().trim().optional(),
    }).optional(),
    
    // Social and web presence
    linkedinUrl: z.string().trim().optional(),
    twitterHandle: z.string().trim().optional(),
    facebookUrl: z.string().trim().optional(),
    
    // Lead information
    leadSource: z.string().trim().optional(),
    leadScore: z.number()
      .min(0, 'Lead score cannot be negative')
      .max(100, 'Lead score cannot exceed 100')
      .optional(),
    leadStatus: z.string().trim().optional(),
    
    // Parent company relationship
    parentCompanyId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent company ID format')
      .optional(),
    
    // Custom fields
    customFields: z.record(z.any()).optional(),
    
    // Tags and labels
    tags: z.array(z.string().trim()).optional(),
    labels: z.array(z.string().trim()).optional(),
    
    // Status and lifecycle
    status: z.enum(['Active', 'Inactive', 'Prospect', 'Customer', 'Partner']).optional(),
    lifecycle: z.enum(['Lead', 'Prospect', 'Customer', 'Partner', 'Former Customer']).optional(),
    
    // Activity tracking
    nextFollowUpAt: z.string()
      .datetime()
      .transform((str) => new Date(str))
      .optional(),
  }),
});

// Company query schema
export const companyQuerySchema = z.object({
  page: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string()
    .optional()
    .transform((val) => val ? Math.min(parseInt(val, 10), 100) : 20),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  industry: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Prospect', 'Customer', 'Partner']).optional(),
  lifecycle: z.enum(['Lead', 'Prospect', 'Customer', 'Partner', 'Former Customer']).optional(),
  employeeCountMin: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined),
  employeeCountMax: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : undefined),
  revenueMin: z.string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined),
  revenueMax: z.string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined),
  tags: z.union([
    z.string(),
    z.array(z.string())
  ]).optional(),
  startDate: z.string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
  endDate: z.string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
});

// Company analytics query schema
export const companyAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d']).default('30d'),
});

// Bulk import schema
export const bulkImportCompaniesSchema = z.object({
  body: z.object({
    companies: z.array(
      z.object({
        name: z.string().min(1, 'Company name is required').trim(),
        industry: z.string().optional(),
        website: z.string().url().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        employeeCount: z.number().min(0).optional(),
        annualRevenue: z.number().min(0).optional(),
        address: z.object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
        }).optional(),
        status: z.enum(['Active', 'Inactive', 'Prospect', 'Customer', 'Partner']).optional(),
        lifecycle: z.enum(['Lead', 'Prospect', 'Customer', 'Partner', 'Former Customer']).optional(),
        tags: z.array(z.string()).optional(),
      })
    ).min(1, 'At least one company is required'),
  }),
});

// Company ID param schema
export const companyIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid company ID format'),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>['body'];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>['body'];
export type CompanyQueryInput = z.infer<typeof companyQuerySchema>;
export type CompanyAnalyticsQueryInput = z.infer<typeof companyAnalyticsQuerySchema>;
export type BulkImportCompaniesInput = z.infer<typeof bulkImportCompaniesSchema>['body'];