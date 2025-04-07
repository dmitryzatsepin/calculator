// src/routes/screenTypeLocationRoutes.ts
import express from 'express';
import { getAllScreenTypeLocations } from '../controllers/screenTypeLocationController'; // Проверь путь к контроллеру
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllScreenTypeLocations);
export default router;