import { Router } from "express";
import { protect } from "../middleware/authMiddleware"; // 🔒 Защита маршрутов
import { getCabinets, createCabinet, updateCabinet, deleteCabinet } from "../controllers/cabinetController";

const router = Router();

// 📌 Получение всех кабинетов (🔥 Открытый доступ)
router.get("/", getCabinets);

// 📌 Создание нового кабинета (❗ Оставляем защиту)
router.post("/", protect, createCabinet);

// 📌 Обновление кабинета (❗ Оставляем защиту)
router.put("/:id", protect, updateCabinet);

// 📌 Удаление кабинета (❗ Оставляем защиту)
router.delete("/:id", protect, deleteCabinet);

export default router;