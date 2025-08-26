import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../errors';

/**
 * Validation middleware factory
 */
export const validate = (schema: z.ZodSchema<any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
   

    try {
      // Validate the request against the schema
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Transform Zod errors into a more user-friendly format
        const errors: Record<string, string[]> = {};
        console.log(error);
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Query validation middleware for pagination and filtering
 */
export const validateQuery = (schema: z.ZodSchema<any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
   
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        next(new ValidationError('Query validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Params validation middleware
 */
export const validateParams = (schema: z.ZodSchema<any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        next(new ValidationError('Parameter validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? Math.min(parseInt(val, 10), 100) : 20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

export const searchSchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
});

// Combine pagination and search schemas
export const querySchema = paginationSchema.merge(searchSchema);