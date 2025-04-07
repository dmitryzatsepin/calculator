// src/routes/screenTypePitchRoutes.ts
import express from 'express';
import { getAllScreenTypePitches } from '../controllers/screenTypePitchController'; // Проверь путь к контроллеру
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllScreenTypePitches);
export default router;