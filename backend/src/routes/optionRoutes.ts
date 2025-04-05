// src/routes/optionRoutes.ts (Новый файл)
import express from 'express';
import {
    getOptions,
    getOptionById,
    createOption,
    updateOption,
    deleteOption,
} from '../controllers/optionController'; // Импорт функций из контроллера Option
import { protect, admin } from '../middleware/authMiddleware'; // Импорт middleware для защиты

const router = express.Router();

// --- Маршруты для Опций (Options) ---

// Коллекция ресурсов (/api/v1/options)
router.route('/')
    // GET / - Получить список всех опций (открытый доступ)
    .get(getOptions)
    // POST / - Создать новую опцию (защищено)
    .post(protect, admin, createOption); // Требуется аутентификация и права админа

// Конкретный ресурс (/api/v1/options/:id)
router.route('/:id')
    // GET /:id - Получить одну опцию по ID (открытый доступ)
    .get(getOptionById)
    // PUT /:id - Обновить опцию по ID (защищено)
    .put(protect, admin, updateOption) // Требуется аутентификация и права админа
    // DELETE /:id - Удалить опцию по ID (защищено)
    .delete(protect, admin, deleteOption); // Требуется аутентификация и права админа

export default router;