import { z } from 'zod';

// Create Schedule Schema
export const createScheduleSchema = z.object({
  meetingTitle: z.string().min(1, 'Meeting title is required').max(200, 'Meeting title must be less than 200 characters'),
  date: z.string().datetime('Invalid date format'),
  time: z.string().min(1, 'Time is required').max(10, 'Time must be less than 10 characters'),
  duration: z.enum(['10', '30', '45', '60'], {
    errorMap: () => ({ message: 'Duration must be 10, 30, 45, or 60 minutes' })
  }),
  attendees: z.string().min(1, 'Attendees are required').max(500, 'Attendees must be less than 500 characters'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  companyId: z.string().min(1, 'Company ID is required')
});

// Update Schedule Schema
export const updateScheduleSchema = z.object({
  meetingTitle: z.string().min(1, 'Meeting title is required').max(200, 'Meeting title must be less than 200 characters').optional(),
  date: z.string().datetime('Invalid date format').optional(),
  time: z.string().min(1, 'Time is required').max(10, 'Time must be less than 10 characters').optional(),
  duration: z.enum(['10', '30', '45', '60'], {
    errorMap: () => ({ message: 'Duration must be 10, 30, 45, or 60 minutes' })
  }).optional(),
  attendees: z.string().min(1, 'Attendees are required').max(500, 'Attendees must be less than 500 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be scheduled, completed, or cancelled' })
  }).optional()
});

// Schedule ID Schema
export const scheduleIdSchema = z.object({
  id: z.string().min(1, 'Schedule ID is required')
});

// Company ID Schema
export const companyIdSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required')
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type ScheduleIdInput = z.infer<typeof scheduleIdSchema>;
export type CompanyIdInput = z.infer<typeof companyIdSchema>;
