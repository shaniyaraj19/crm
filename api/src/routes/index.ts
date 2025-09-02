import { Router } from 'express';
import authRoutes from './auth.routes';
import pipelineRoutes from './pipeline.routes';
import dealRoutes from './deal.routes';
import contactRoutes from './contact.routes';
import companyRoutes from './company.routes';
import analyticsRoutes from './analytics.routes';
import notesRoutes from './notes.routes';
import taskRoutes from './task.routes';
import scheduleRoutes from './schedule.routes';
import activityRoutes from './activity.routes';
import fileRoutes from './file.routes';

// import userRoutes from './user.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/pipelines', pipelineRoutes);
router.use('/deals', dealRoutes);
router.use('/contacts', contactRoutes);
router.use('/companies', companyRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notes', notesRoutes);
router.use('/tasks', taskRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/activities', activityRoutes);
router.use('/files', fileRoutes);

// router.use('/users', userRoutes);

export default router;