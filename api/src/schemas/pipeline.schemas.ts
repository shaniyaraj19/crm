import { z } from 'zod';

// Pipeline stage schema
export const pipelineStageSchema = z.object({
  name: z.string()
    .min(1, 'Stage name is required')
    .max(100, 'Stage name cannot exceed 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Stage description cannot exceed 500 characters')
    .trim()
    .optional(),
  probability: z.number()
    .min(0, 'Probability cannot be less than 0')
    .max(100, 'Probability cannot be more than 100'),
  color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color'),
  order: z.number()
    .min(0, 'Order cannot be negative')
    .optional(),
  isActive: z.boolean().default(true),
  isClosedWon: z.boolean().default(false),
  isClosedLost: z.boolean().default(false),
});

// Create pipeline schema
export const createPipelineSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Pipeline name is required')
      .max(100, 'Pipeline name cannot exceed 100 characters')
      .trim(),
    description: z.string()
      .max(500, 'Pipeline description cannot exceed 500 characters')
      .trim()
      .optional(),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
    stages: z.array(pipelineStageSchema)
      .min(2, 'Pipeline must have at least 2 stages')
      .max(10, 'Pipeline cannot have more than 10 stages'),
    settings: z.object({
      requireStageReason: z.boolean().optional(),
      autoRotateDeals: z.boolean().optional(),
      rotationCriteria: z.array(z.object({
        field: z.string(),
        value: z.any(),
      })).optional(),
      notifications: z.object({
        stageChange: z.boolean().optional(),
        dealStuck: z.boolean().optional(),
        stuckDays: z.number().min(1).optional(),
      }).optional(),
    }).optional(),
  }),
});

// Update pipeline schema
export const updatePipelineSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Pipeline name is required')
      .max(100, 'Pipeline name cannot exceed 100 characters')
      .trim()
      .optional(),
    description: z.string()
      .max(500, 'Pipeline description cannot exceed 500 characters')
      .trim()
      .optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
    stages: z.array(pipelineStageSchema)
      .min(2, 'Pipeline must have at least 2 stages')
      .max(10, 'Pipeline cannot have more than 10 stages')
      .optional(),
    settings: z.object({
      requireStageReason: z.boolean().optional(),
      autoRotateDeals: z.boolean().optional(),
      rotationCriteria: z.array(z.object({
        field: z.string(),
        value: z.any(),
      })).optional(),
      notifications: z.object({
        stageChange: z.boolean().optional(),
        dealStuck: z.boolean().optional(),
        stuckDays: z.number().min(1).optional(),
      }).optional(),
    }).optional(),
  }),
});

// Add stage schema
export const addStageSchema = z.object({
  body: pipelineStageSchema.omit({ order: true }),
});

// Update stage schema
export const updateStageSchema = z.object({
  body: pipelineStageSchema.partial(),
});

// Reorder stages schema
export const reorderStagesSchema = z.object({
  body: z.object({
    stageOrders: z.array(z.object({
      stageId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stage ID format'),
      order: z.number().min(0),
    })).min(1, 'At least one stage order is required'),
  }),
});

// Pipeline query schema
export const pipelineQuerySchema = z.object({
  includeInactive: z.string()
    .optional()
    .transform((val) => val === 'true'),
});

// Pipeline ID param schema
export const pipelineIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid pipeline ID format'),
});

// Stage ID param schema
export const stageIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid pipeline ID format'),
  stageId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid stage ID format'),
});

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>['body'];
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>['body'];
export type AddStageInput = z.infer<typeof addStageSchema>['body'];
export type UpdateStageInput = z.infer<typeof updateStageSchema>['body'];
export type ReorderStagesInput = z.infer<typeof reorderStagesSchema>['body'];
export type PipelineQueryInput = z.infer<typeof pipelineQuerySchema>;