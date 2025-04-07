// src/routes/pitchRoutes.ts
import express from 'express';
import { getAllPitches } from '../controllers/pitchController';
// import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllPitches); 
export default router;