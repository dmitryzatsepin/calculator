import express from 'express';
import { getIpProtection } from '../controllers/ipProtectionController';

const router = express.Router();

// 📌 Получение всех степеней защиты (IP Protection)
router.get("/", getIpProtection);

// Если нужен полный CRUD (Create, Update, Delete):
// 1. Добавь соответствующие функции в ipProtectionController.ts
// 2. Создай ipProtectionValidators.ts
// 3. Раскомментируй и добавь роуты ниже:
/*
import { createIpProtectionSchema, updateIpProtectionSchema } from '../validators/ipProtectionValidators'; // Импорт валидаторов
import { createIpProtection, updateIpProtection, deleteIpProtection } from '../controllers/ipProtectionController'; // Импорт CRUD функций
import { protect, admin } from '../middleware/authMiddleware'; // Защита

// POST / - Создать новую степень защиты (защищено)
router.post("/", protect, admin, createIpProtection);

// PUT /:id - Обновить степень защиты по ID (защищено)
router.put("/:id", protect, admin, updateIpProtection);

// DELETE /:id - Удалить степень защиты по ID (защищено)
router.delete("/:id", protect, admin, deleteIpProtection);
*/

export default router;