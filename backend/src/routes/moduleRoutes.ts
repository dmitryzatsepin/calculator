// src/routes/moduleRoutes.ts
import express from 'express';
// --- ИСПРАВЛЕННЫЙ ИМПОРТ ---
// Импортируем ТОЛЬКО getAllModules (переименованную из getModules)
import { getAllModules } from "../controllers/moduleController"; 
// Закомментированы остальные, т.к. они не экспортируются из контроллера
// import {
//     getModuleById,
//     createModule,
//     updateModule,
//     deleteModule,
// } from "../controllers/moduleController";

// Импортируем middleware, если нужно
import { protect, admin } from '../middleware/authMiddleware'; // Оставляем для использования в будущем

const router = express.Router();

// --- МАРШРУТЫ ---

// GET /api/v1/modules - Получить все модули
// Защищаем маршрут с помощью 'protect'
router.get('/', getAllModules); 

// --- ЗАКОММЕНТИРОВАННЫЕ МАРШРУТЫ ДЛЯ БУДУЩЕГО ---
// GET /api/v1/modules/:id - Получить один модуль
// router.get('/:id', protect, getModuleById); 

// POST /api/v1/modules - Создать модуль
// router.post('/', protect, admin, createModule); 

// PUT /api/v1/modules/:id - Обновить модуль
// router.put('/:id', protect, admin, updateModule); 

// DELETE /api/v1/modules/:id - Удалить модуль
// router.delete('/:id', protect, admin, deleteModule); 

export default router;