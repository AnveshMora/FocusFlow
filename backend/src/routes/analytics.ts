import { Router } from 'express';
import { getTodayAnalytics, getWeeklyAnalytics, getStreakAnalytics, getHeatmapAnalytics } from '../controllers/analyticsController';

const router = Router();

router.get('/analytics/today', getTodayAnalytics);
router.get('/analytics/weekly', getWeeklyAnalytics);
router.get('/analytics/streak', getStreakAnalytics);
router.get('/analytics/heatmap', getHeatmapAnalytics);

export default router;
