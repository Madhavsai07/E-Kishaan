import { Router } from 'express';
import { getWeatherHandler } from '../controllers/weatherController';
import {
  getDistrictsHandler,
  getSoilReportHandler,
  getSoilHistoryHandler,
  getSoilRecommendationHandler,
  compareDistrictsHandler,
  addFertilizerLogHandler,
  adminSyncHandler,
  adminHealthHandler,
  getSoilFertilityHandler,
} from '../controllers/soilController';
import { getMarketPricesHandler } from '../controllers/marketController';
import { solvePotionHandler } from '../controllers/solverController';
import { getUserStatsHandler, updateUserStatsHandler } from '../controllers/userController';
import { getCropRecommendationsHandler } from '../controllers/cropController';
import {
  getFarmRoadmapHandler,
  saveFarmProfileHandler,
  submitDailyDiaryHandler,
  updateTaskStatusHandler,
} from '../controllers/roadmapController';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'E-Kishan Express Backend',
    timestamp: new Date().toISOString(),
  });
});

// Weather API
router.get('/weather', getWeatherHandler);

// Dynamic Soil Health Intelligence APIs (Punjab 23 Districts)
router.get('/soil/districts', getDistrictsHandler);
router.get('/soil/report/:district?', getSoilReportHandler);
router.get('/soil/history/:district?', getSoilHistoryHandler);
router.get('/soil/recommendation/:district?', getSoilRecommendationHandler);
router.get('/soil/compare', compareDistrictsHandler);
router.post('/soil/fertilizer', addFertilizerLogHandler);
router.post('/soil/admin/sync', adminSyncHandler);
router.get('/soil/admin/health', adminHealthHandler);

// AI Crop Recommendation & Advisory Engine API
router.get('/crops/recommendation/:district?', getCropRecommendationsHandler);

// AI Personalized Farm Roadmap & Smart Advisory System APIs
router.get('/farm/roadmap/:district?', getFarmRoadmapHandler);
router.post('/farm/profile', saveFarmProfileHandler);
router.post('/farm/diary', submitDailyDiaryHandler);
router.post('/farm/task/status', updateTaskStatusHandler);

// Legacy backward compatibility alias
router.get('/soil/fertility', getSoilFertilityHandler);

// Market Prices API
router.get('/market/prices', getMarketPricesHandler);

// Frankenstein Solver API
router.post('/solver/solve', solvePotionHandler);

// User Stats API
router.get('/user/stats', getUserStatsHandler);
router.post('/user/stats', updateUserStatsHandler);

export default router;
