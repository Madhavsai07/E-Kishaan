import { Router } from 'express';
import { getWeatherHandler } from '../controllers/weatherController.js';
import { getSoilFertilityHandler, addFertilizerLogHandler } from '../controllers/soilController.js';
import { getMarketPricesHandler } from '../controllers/marketController.js';
import { solvePotionHandler } from '../controllers/solverController.js';
import { getUserStatsHandler, updateUserStatsHandler } from '../controllers/userController.js';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AgriSmart E-Kishaan Express Backend',
    timestamp: new Date().toISOString(),
  });
});

// Weather API
router.get('/weather', getWeatherHandler);

// Soil Fertility API
router.get('/soil/fertility', getSoilFertilityHandler);
router.post('/soil/fertilizer', addFertilizerLogHandler);

// Market Prices API
router.get('/market/prices', getMarketPricesHandler);

// Frankenstein Solver API
router.post('/solver/solve', solvePotionHandler);

// User Stats API
router.get('/user/stats', getUserStatsHandler);
router.post('/user/stats', updateUserStatsHandler);

export default router;
