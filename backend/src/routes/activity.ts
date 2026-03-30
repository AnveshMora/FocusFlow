import { Router } from 'express';
import { getTodayActivities, markActivity, createCheckpoint } from '../controllers/activityController';

const router = Router();

router.get('/activities/today', getTodayActivities);
router.patch('/activities/:id/:action', markActivity); // action: mark-done or skip
router.post('/activities/checkpoint', createCheckpoint);

export default router;
