// src/routes/locationCabinetRoutes.ts
import express from 'express';
import { getAllLocationCabinets } from '../controllers/locationCabinetController'; // Проверь путь к контроллеру
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllLocationCabinets);
export default router;