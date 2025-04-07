// src/routes/pitchTypePitchRoutes.ts
import express from 'express';
import { getAllPitchTypePitches } from '../controllers/pitchTypePitchController'; // Проверь путь к контроллеру
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllPitchTypePitches);
export default router;