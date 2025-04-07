// src/routes/locationMaterialRoutes.ts
import express from 'express';
import { getAllLocationMaterials } from '../controllers/locationMaterialController'; // Проверь путь к контроллеру
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllLocationMaterials);
export default router;