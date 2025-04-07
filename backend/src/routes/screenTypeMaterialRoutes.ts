import express from 'express';
import { getAllScreenTypeMaterials /*, getMaterialsForScreenType */ } from '../controllers/screenTypeMaterialController'; 
import { protect /*, admin */ } from '../middleware/authMiddleware';

const router = express.Router();

// --- Маршруты для ScreenTypeMaterial ---
router.get('/', protect, getAllScreenTypeMaterials); 


export default router; 