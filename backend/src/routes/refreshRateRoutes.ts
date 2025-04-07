// src/routes/refreshRateRoutes.ts
import express from 'express';
import { getAllRefreshRates } from '../controllers/refreshRateController';
// import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllRefreshRates); 
export default router;