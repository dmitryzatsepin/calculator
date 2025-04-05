// src/routes/pixelStepDefinitionRoutes.ts (Убедись, что файл переименован)
import express from 'express'; // Используем express
import { protect, admin } from '../middleware/authMiddleware'; // Импортируем protect и admin
import {
    // ИСПРАВЛЕНО: Импортируем функции с новыми именами
    getPixelStepDefinitions,
    createPixelStepDefinition,
    updatePixelStepDefinition,
    deletePixelStepDefinition,
    // getPixelStepDefinitionById // <-- Раскомментируй, если реализуешь в контроллере
} from '../controllers/pixelStepDefinitionController'; // Путь к контроллеру

const router = express.Router(); // Используем express.Router()

// Маршруты для PixelStepDefinition

// 📌 Получение всех определений шага пикселя
// GET / - Открытый доступ (как было в твоем коде)
router.get("/", getPixelStepDefinitions); // ИСПРАВЛЕНО: имя функции

// 📌 Создание нового определения шага пикселя
// POST / - Защищено (добавляем и admin для примера)
router.post("/", protect, admin, createPixelStepDefinition); // ИСПРАВЛЕНО: имя функции

// Маршруты для работы с конкретным ID
router.route("/:id")
    // 📌 Получение одного определения по ID (Добавлено, если нужно)
    // GET /:id - Открытый доступ
    // .get(getPixelStepDefinitionById) // <-- Раскомментируй, если реализуешь

    // 📌 Обновление определения шага пикселя
    // PUT /:id - Защищено
    .put(protect, admin, updatePixelStepDefinition) // ИСПРАВЛЕНО: имя функции

    // 📌 Удаление определения шага пикселя
    // DELETE /:id - Защищено
    .delete(protect, admin, deletePixelStepDefinition); // ИСПРАВЛЕНО: имя функции

export default router;