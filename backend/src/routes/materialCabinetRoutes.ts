// src/routes/materialCabinetRoutes.ts
import express from 'express';
import { getAllMaterialCabinets } from '../controllers/materialCabinetController'; // Проверь путь к контроллеру
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllMaterialCabinets);
export default router;