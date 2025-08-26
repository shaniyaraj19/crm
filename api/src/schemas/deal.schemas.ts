import { z } from 'zod';
import { DealPriority, DealStatus } from '../types/common';

// Create deal schema
export const createDealSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, 'Deal title is required')
      .max(200, 'Deal title cannot exceed 200 characters')
      .trim(),
    description: z.string()
      .max(2000, 'Deal description cannot exceed 2000 characters')
      .trim()
      .optional(),
    value: z.number()
      .min(0, 'Deal value cannot be negative')
      .default(0),
    currency: z.string()
      .length(3, 'Currency code must be 3 characters')
      .toUpperCase()
      .default('USD'),
    priority: z.nativeEnum(DealPriority).default(DealPriority.MEDIUM),
    probability: z.number()
      .min(0, 'Probability cannot be less than 0')
      .max(100, 'Probability cannot be more than 100')
      .optional(),
    expectedCloseDate: z.string()
      .datetime()
      .transform((str) => new Date(str))
      .optional(),
    
    // Relationships
    pipelineId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid pipeline ID format'),
    stageId: z.string()
      .min(1, 'Stage ID is required'),
    assignedTo: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
      .optional(),
    contactId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid contact ID format')
      .optional(),
    companyId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid company ID format')
      .optional(),
    
    // Sales metrics
    source: z.string().trim().optional(),
    
    // Custom fields
    customFields: z.record(z.any()).optional(),
    
    // Tags and labels
    tags: z.array(z.string().trim()).optional(),
    labels: z.array(z.string().trim()).optional(),
    
    // Activity tracking
    nextFollowUpAt: z.string()
      .datetime()
      .transform((str) => new Date(str))
      .optional(),
  }),
});

// Update deal schema
export const updateDealSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, 'Deal title is required')
      .max(200, 'Deal title cannot exceed 200 characters')
      .trim()
      .optional(),
    description: z.string()
      .max(2000, 'Deal description cannot exceed 2000 characters')
      .trim()
      .optional(),
    value: z.number()
      .min(0, 'Deal value cannot be negative')
      .optional(),
    currency: z.string()
      .length(3, 'Currency code must be 3 characters')
      .toUpperCase()
      .optional(),
    priority: z.nativeEnum(DealPriority).optional(),
    status: z.nativeEnum(DealStatus).optional(),
    probability: z.number()
      .min(0, 'Probability cannot be less than 0')
      .max(100, 'Probability cannot be more than 100')
      .optional(),
    expectedCloseDate: z.string()
      .datetime()
      .transform((str) => new Date(str))
      .optional(),
    
    // Relationships
    stageId: z.string().optional(),
    assignedTo: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
      .optional(),
    contactId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid contact ID format')
      .optional(),
    companyId: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid company ID format')
      .optional(),
    
    // Sales metrics
    source: z.string().trim().optional(),
    lostReason: z.string().trim().optional(),
    wonReason: z.string().trim().optional(),
    
    // Custom fields
    customFields: z.record(z.any()).optional(),
    
    // Tags and labels
    tags: z.array(z.string().trim()).optional(),
    labels: z.array(z.string().trim()).optional(),
    
    // Activity tracking
    nextFollowUpAt: z.string()
      .datetime()
      .transform((str) => new Date(str))
      .optional(),
    
    // Stage change reason
    stageChangeReason: z.string().trim().optional(),
  }),
});

// Move deal to stage schema
export const moveDealToStageSchema = z.object({
  body: z.object({
    stageId: z.string().min(1, 'Stage ID is required'),
    reason: z.string()
      .max(500, 'Reason cannot exceed 500 characters')
      .trim()
      .optional(),
  }),
});

// Add note schema
export const addNoteSchema = z.object({
  body: z.object({
    content: z.string()
      .min(1, 'Note content is required')
      .max(2000, 'Note content cannot exceed 2000 characters')
      .trim(),
    isPrivate: z.boolean().default(false),
  }),
});

// Deal query schema
export const dealQuerySchema = z.object({
  page: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string()
    .optional()
    .transform((val) => val ? Math.min(parseInt(val, 10), 100) : 20),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  pipelineId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid pipeline ID format')
    .optional(),
  stageId: z.string().optional(),
  assignedTo: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    .optional(),
  status: z.nativeEnum(DealStatus).optional(),
  priority: z.nativeEnum(DealPriority).optional(),
  startDate: z.string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
  endDate: z.string()
    .datetime()
    .transform((str) => new Date(str))
    .optional(),
  minValue: z.string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined),
  maxValue: z.string()
    .optional()
    .transform((val) => val ? parseFloat(val) : undefined),
  tags: z.union([
    z.string(),
    z.array(z.string())
  ]).optional(),
});

// Deal analytics query schema
export const dealAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d']).default('30d'),
  pipelineId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid pipeline ID format')
    .optional(),
});

// Deal ID param schema
export const dealIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid deal ID format'),
});

// Pipeline ID param schema for deals
export const dealPipelineIdParamSchema = z.object({
  pipelineId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid pipeline ID format'),
});

export type CreateDealInput = z.infer<typeof createDealSchema>['body'];
export type UpdateDealInput = z.infer<typeof updateDealSchema>['body'];
export type MoveDealToStageInput = z.infer<typeof moveDealToStageSchema>['body'];
export type AddNoteInput = z.infer<typeof addNoteSchema>['body'];
export type DealQueryInput = z.infer<typeof dealQuerySchema>;
export type DealAnalyticsQueryInput = z.infer<typeof dealAnalyticsQuerySchema>;