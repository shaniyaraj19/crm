import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimiter';

const router = Router();

// Apply authentication and rate limiting to all routes
router.use(authenticate);
router.use(generalRateLimit);

// Get all activities with filtering and pagination
router.get('/', ActivityController.getActivities);

// Get activity by ID
router.get('/:id', ActivityController.getActivity);

// Create new activity
router.post('/', ActivityController.createActivity);

// Update activity
router.put('/:id', ActivityController.updateActivity);

// Delete activity (soft delete)
router.delete('/:id', ActivityController.deleteActivity);

// Mark activity as complete
router.patch('/:id/complete', ActivityController.completeActivity);

// Get upcoming activities for user
router.get('/upcoming/activities', ActivityController.getUpcomingActivities);

// Get overdue activities for user
router.get('/overdue/activities', ActivityController.getOverdueActivities);

// Get activity statistics
router.get('/stats/activities', ActivityController.getActivityStats);

export default router;
