import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getPixelSteps,
  createPixelStep,
  updatePixelStep,
  deletePixelStep,
} from "../controllers/pixelStepController";

const router = Router();

// 📌 Получение всех шагов пикселя
//router.get("/", protect, getPixelSteps); //🔐 API защищено middleware protectа
router.get("/", getPixelSteps); // ❌ Убрали protect — теперь запрос не требует токена

// 📌 Создание нового шага пикселя
router.post("/", protect, createPixelStep);

// 📌 Обновление шага пикселя
router.put("/:id", protect, updatePixelStep);

// 📌 Удаление шага пикселя
router.delete("/:id", protect, deletePixelStep);

export default router;