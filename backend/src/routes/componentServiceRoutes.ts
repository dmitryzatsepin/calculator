// src/routes/componentServiceRoutes.ts // <-- Рекомендуется переименовать файл
import express from 'express'; // Импортируем express
import { protect } from '../middleware/authMiddleware'; // Защита роутов
import {
    // ИЗМЕНЕНО: Импортируем правильные имена функций
    getComponentServices,
    getComponentServiceById,
    createComponentService,
    updateComponentService,
    deleteComponentService
} from '../controllers/componentServiceController'; // Убедись, что имя файла контроллера тоже обновлено

const router = express.Router(); // Используем express.Router()

// ИЗМЕНЕНО: Комментарии обновлены
// Маршруты для комплектующих/услуг (ComponentService)

// Базовый путь '/' здесь будет соответствовать '/api/v1/component-services' (или как ты его зарегистрируешь)

// GET / - Получить все ComponentServices
router.get("/", getComponentServices); // ИЗМЕНЕНО: имя функции

// GET /:id - Получить один ComponentService по ID
router.get("/:id", getComponentServiceById); // ИЗМЕНЕНО: имя функции

// POST / - Создать новый ComponentService (защищено)
router.post("/", protect, createComponentService); // ИЗМЕНЕНО: имя функции

// PUT /:id - Обновить ComponentService по ID (защищено)
router.put("/:id", protect, updateComponentService); // ИЗМЕНЕНО: имя функции

// DELETE /:id - Удалить ComponentService по ID (защищено)
router.delete("/:id", protect, deleteComponentService); // ИЗМЕНЕНО: имя функции

export default router;