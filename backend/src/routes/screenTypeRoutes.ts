import { Router } from "express";
import { getScreenTypes } from "../controllers/screenTypeController";

const router = Router();

// 📌 Получение всех типов экранов
router.get("/", getScreenTypes);

export default router;
