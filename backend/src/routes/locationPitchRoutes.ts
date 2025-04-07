// src/routes/locationPitchRoutes.ts
import express from 'express';
import { getAllLocationPitches } from '../controllers/locationPitchController'; // Проверь путь к контроллеру
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', protect, getAllLocationPitches);
export default router;