// src/routes/pitchTypeRoutes.ts
import express from 'express';
import { getAllPitchTypes } from '../controllers/pitchTypeController';
// import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/', getAllPitchTypes); 
export default router;