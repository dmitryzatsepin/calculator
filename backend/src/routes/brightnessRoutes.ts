// src/routes/brightnessRoutes.ts
import express from 'express';
import { getAllBrightnessValues } from '../controllers/brightnessController';
// import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllBrightnessValues); 
export default router;