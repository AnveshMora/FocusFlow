import { Router } from 'express';
import { getSchedule, updateSchedule } from '../controllers/scheduleController';

const router = Router();

router.get('/schedules/:id', getSchedule);
router.patch('/schedules/:id', updateSchedule);

export default router;
