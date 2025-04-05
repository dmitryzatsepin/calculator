import express from 'express';
import {
    getManufacturers,
    getManufacturerById,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
} from '../controllers/manufacturerController'; // Импорт функций из контроллера
import { protect, admin } from '../middleware/authMiddleware'; // Импорт middleware для защиты

const router = express.Router();

// --- Маршруты для Производителей (Manufacturers) ---

// Коллекция ресурсов (/api/v1/manufacturers)
router.route('/')
    // GET / - Получить список всех производителей (открытый доступ)
    .get(getManufacturers)
    // POST / - Создать нового производителя (защищено)
    .post(protect, admin, createManufacturer); // Требуется аутентификация и права админа

// Конкретный ресурс (/api/v1/manufacturers/:id)
router.route('/:id')
    // GET /:id - Получить одного производителя по ID (открытый доступ)
    .get(getManufacturerById)
    // PUT /:id - Обновить производителя по ID (защищено)
    .put(protect, admin, updateManufacturer) // Требуется аутентификация и права админа
    // DELETE /:id - Удалить производителя по ID (защищено)
    .delete(protect, admin, deleteManufacturer); // Требуется аутентификация и права админа

export default router;