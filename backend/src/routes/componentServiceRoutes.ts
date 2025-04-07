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

// Маршруты для комплектующих/услуг (ComponentService)

// Базовый путь '/' здесь будет соответствовать '/api/v1/component-services' (или как ты его зарегистрируешь)

router.get("/", getComponentServices);
router.get("/:id", getComponentServiceById);
router.post("/", protect, createComponentService);
router.put("/:id", protect, updateComponentService);
router.delete("/:id", protect, deleteComponentService);

export default router;