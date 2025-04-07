// src/routes/ipProtectionRoutes.ts
import express from 'express';
// --- 👇 ИСПРАВЛЯЕМ ИМЯ ФУНКЦИИ 👇 ---
import { getAllIpProtections } from '../controllers/ipProtectionController'; 
// import { protect } from '../middleware/authMiddleware'; // Пока не защищаем

const router = express.Router();

// Используем правильное имя функции
router.get('/', getAllIpProtections); 

export default router;