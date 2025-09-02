import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', ScheduleController.createSchedule);
router.get('/company/:companyId', ScheduleController.getSchedules);
router.get('/:id', ScheduleController.getScheduleById);
router.put('/:id', ScheduleController.updateSchedule);
router.delete('/:id', ScheduleController.deleteSchedule);

export default router;
