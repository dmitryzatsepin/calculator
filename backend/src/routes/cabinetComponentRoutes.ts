import express from 'express';
import { getAllCabinetComponents /*, getComponentsForCabinet */ } from '../controllers/cabinetComponentController'; 
import { protect /*, admin */ } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getAllCabinetComponents); 


export default router; 