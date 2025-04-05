// src/routes/moduleRoutes.ts (Новый файл)
import express from 'express';
import {
    getModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,
} from '../controllers/moduleController'; // Импорт функций из контроллера Module
import { protect, admin } from '../middleware/authMiddleware'; // Импорт middleware для защиты

const router = express.Router();

// --- Маршруты для Модулей (Modules) ---

// Коллекция ресурсов (/api/v1/modules)
router.route('/')
    // GET / - Получить список всех модулей (открытый доступ)
    .get(getModules)
    // POST / - Создать новый модуль (защищено)
    .post(protect, admin, createModule); // Требуется аутентификация и права админа

// Конкретный ресурс (/api/v1/modules/:id)
router.route('/:id')
    // GET /:id - Получить один модуль по ID (открытый доступ)
    .get(getModuleById)
    // PUT /:id - Обновить модуль по ID (защищено)
    .put(protect, admin, updateModule) // Требуется аутентификация и права админа
    // DELETE /:id - Удалить модуль по ID (защищено)
    .delete(protect, admin, deleteModule); // Требуется аутентификация и права админа

export default router;