// src/routes/screenTypeRoutes.ts
import express from 'express'; // Импортируем express
import {
    getScreenTypes,
    // Предполагаемые имена функций для полного CRUD (нужно реализовать в контроллере)
    createScreenType,
    getScreenTypeById,
    updateScreenType,
    deleteScreenType,
} from '../controllers/screenTypeController';
// import { createScreenTypeSchema, updateScreenTypeSchema } from '../validators/screenTypeValidators'; // Валидаторы понадобятся в контроллере
import { protect, admin } from '../middleware/authMiddleware'; // Защита роутов

const router = express.Router(); // Используем express.Router()

// Маршруты для ScreenType

// GET / - Получить все типы экранов (открытый доступ)
router.get("/", getScreenTypes);

// POST / - Создать новый тип экрана (защищено)
// ВАЖНО: Функция createScreenType должна быть реализована в screenTypeController.ts
router.post("/", protect, admin, createScreenType);

// GET /:id - Получить один тип экрана по ID (открытый доступ)
// ВАЖНО: Функция getScreenTypeById должна быть реализована в screenTypeController.ts
router.get("/:id", getScreenTypeById);

// PUT /:id - Обновить тип экрана по ID (защищено)
// ВАЖНО: Функция updateScreenType должна быть реализована в screenTypeController.ts
router.put("/:id", protect, admin, updateScreenType);

// DELETE /:id - Удалить тип экрана по ID (защищено)
// ВАЖНО: Функция deleteScreenType должна быть реализована в screenTypeController.ts
router.delete("/:id", protect, admin, deleteScreenType);

export default router;