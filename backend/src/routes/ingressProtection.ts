import { Router } from "express";
import { getIngressProtection } from "../controllers/ingressProtectionController";

const router = Router();

// 📌 Получение всех типов экранов
router.get("/", getIngressProtection);

export default router;
