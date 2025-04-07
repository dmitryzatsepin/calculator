import express from 'express';
import { getAllScreenTypeOptions /*, getOptionsForScreenType */ } from '../controllers/screenTypeOptionController'; 
import { protect /*, admin */ } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getAllScreenTypeOptions); 


export default router; 