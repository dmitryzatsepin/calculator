// src/routes/cabinetRoutes.ts
import express from 'express';
// Импортируем ТОЛЬКО getAllCabinets (переименованную из getCabinets)
import { getAllCabinets } from "../controllers/cabinetController"; 
// Закомментированы createCabinet, updateCabinet, deleteCabinet, так как они не экспортируются
// import { createCabinet, updateCabinet, deleteCabinet } from "../controllers/cabinetController";

// Импортируем middleware, если нужно
import { protect, admin } from '../middleware/authMiddleware'; // Оставляем для использования в будущем

const router = express.Router();

// --- МАРШРУТЫ ---

// GET /api/v1/cabinets - Получить все кабинеты
// Защищаем маршрут с помощью 'protect'
router.get('/', protect, getAllCabinets); 

// --- ЗАКОММЕНТИРОВАННЫЕ МАРШРУТЫ ДЛЯ БУДУЩЕГО ---
// GET /api/v1/cabinets/:id - Получить один кабинет
// router.get('/:id', protect, getCabinetById); // Нужно будет раскомментировать getCabinetById в контроллере

// POST /api/v1/cabinets - Создать кабинет
// router.post('/', protect, admin, createCabinet); // Нужна роль admin

// PUT /api/v1/cabinets/:id - Обновить кабинет
// router.put('/:id', protect, admin, updateCabinet); // Нужна роль admin

// DELETE /api/v1/cabinets/:id - Удалить кабинет
// router.delete('/:id', protect, admin, deleteCabinet); // Нужна роль admin

export default router;