// src/routes/locationRoutes.ts
import express from 'express';
import { getAllLocations } from '../controllers/locationController';
// import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllLocations); 
export default router;