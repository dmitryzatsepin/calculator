import express from 'express';
import { getAllCabinetMaterials /*, getMaterialsForCabinet */ } from '../controllers/cabinetMaterialController'; 
import { protect /*, admin */ } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getAllCabinetMaterials); 


export default router; 