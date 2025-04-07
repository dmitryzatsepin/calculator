import express from 'express';
import { getAllPixelOptions /*, getPixelOptionById */ } from '../controllers/pixelOptionController'; 
import { protect /*, admin */ } from '../middleware/authMiddleware';

const router = express.Router();

// --- Маршруты для PixelOption ---
router.get('/', protect, getAllPixelOptions); 


export default router; 