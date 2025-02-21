import { Router } from "express";
import { protect } from "../middleware/authMiddleware"; // 🔒 Защита маршрутов
import { getCabinets, createCabinet, updateCabinet, deleteCabinet } from "../controllers/cabinetController";

const router = Router();

// 📌 Получение всех кабинетов
router.get("/", protect, getCabinets);

// 📌 Создание нового кабинета
router.post("/", protect, createCabinet);

// 📌 Обновление кабинета
router.put("/:id", protect, updateCabinet);

// 📌 Удаление кабинета
router.delete("/:id", protect, deleteCabinet);

export default router;
