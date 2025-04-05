// src/routes/materialRoutes.ts (Новый файл)
import express from 'express';
import {
    getMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial,
} from '../controllers/materialController'; // Импорт функций из контроллера Material
import { protect, admin } from '../middleware/authMiddleware'; // Импорт middleware для защиты

const router = express.Router();

// --- Маршруты для Материалов (Materials) ---

// Коллекция ресурсов (/api/v1/materials)
router.route('/')
    // GET / - Получить список всех материалов (открытый доступ)
    .get(getMaterials)
    // POST / - Создать новый материал (защищено)
    .post(protect, admin, createMaterial); // Требуется аутентификация и права админа

// Конкретный ресурс (/api/v1/materials/:id)
router.route('/:id')
    // GET /:id - Получить один материал по ID (открытый доступ)
    .get(getMaterialById)
    // PUT /:id - Обновить материал по ID (защищено)
    .put(protect, admin, updateMaterial) // Требуется аутентификация и права админа
    // DELETE /:id - Удалить материал по ID (защищено)
    .delete(protect, admin, deleteMaterial); // Требуется аутентификация и права админа

export default router;