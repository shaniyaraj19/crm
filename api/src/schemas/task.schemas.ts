import { z } from 'zod';

// Create Task Schema
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
  description: z.string().min(1, 'Task description is required').max(1000, 'Task description must be less than 1000 characters'),
  dueDate: z.string().datetime('Invalid due date format'),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium, or high' })
  }),
  assignedTo: z.string().min(1, 'Assigned user is required'),
  companyId: z.string().min(1, 'Company ID is required')
});

// Update Task Schema
export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters').optional(),
  description: z.string().min(1, 'Task description is required').max(1000, 'Task description must be less than 1000 characters').optional(),
  dueDate: z.string().datetime('Invalid due date format').optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium, or high' })
  }).optional(),
  assignedTo: z.string().min(1, 'Assigned user is required').optional(),
  status: z.enum(['pending', 'in-progress', 'completed'], {
    errorMap: () => ({ message: 'Status must be pending, in-progress, or completed' })
  }).optional()
});

// Task ID Schema
export const taskIdSchema = z.object({
  id: z.string().min(1, 'Task ID is required')
});

// Company ID Schema
export const companyIdSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required')
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskIdInput = z.infer<typeof taskIdSchema>;
export type CompanyIdInput = z.infer<typeof companyIdSchema>;
