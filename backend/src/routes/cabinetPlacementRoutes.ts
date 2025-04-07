// src/routes/cabinetPlacementRoutes.ts
import express from 'express';
import { getAllCabinetPlacements } from '../controllers/cabinetPlacementController';
// import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllCabinetPlacements); 
export default router;