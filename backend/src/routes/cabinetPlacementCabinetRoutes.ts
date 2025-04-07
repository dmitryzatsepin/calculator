// src/routes/cabinetPlacementCabinetRoutes.ts
import express from 'express';
import { getAllCabinetPlacementCabinets } from '../controllers/cabinetPlacementCabinetController'; // Проверь путь к контроллеру
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', protect, getAllCabinetPlacementCabinets);
export default router;