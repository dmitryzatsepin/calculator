// src/routes/screenTypeRoutes.ts
import express from 'express'; // Импортируем express

// --- ИСПРАВЛЕННЫЙ ИМПОРТ ---
// Импортируем ТОЛЬКО getAllScreenTypes (переименованную из getScreenTypes)
import { getAllScreenTypes } from '../controllers/screenTypeController';
// Закомментированы остальные
// import {
//     createScreenType,
//     getScreenTypeById,
//     updateScreenType,
//     deleteScreenType,
// } from '../controllers/screenTypeController';

// Импортируем middleware, если нужно
import { protect, admin } from '../middleware/authMiddleware'; // Оставляем

const router = express.Router(); // Используем express.Router()

// --- МАРШРУТЫ ---

// GET /api/v1/screen-types - Получить все типы экранов
// Оставляем публичным (или добавь protect, если нужно)
router.get("/", getAllScreenTypes);

// --- ЗАКОММЕНТИРОВАННЫЕ МАРШРУТЫ ДЛЯ БУДУЩЕГО ---
// POST /api/v1/screen-types - Создать новый тип экрана
// router.post("/", protect, admin, createScreenType);

// GET /api/v1/screen-types/:id - Получить один тип экрана по ID
// router.get("/:id", getScreenTypeById);

// PUT /api/v1/screen-types/:id - Обновить тип экрана по ID
// router.put("/:id", protect, admin, updateScreenType);

// DELETE /api/v1/screen-types/:id - Удалить тип экрана по ID
// router.delete("/:id", protect, admin, deleteScreenType);

export default router;