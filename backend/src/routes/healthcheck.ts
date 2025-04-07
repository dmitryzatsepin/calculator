// src/routes/healthcheck.ts
import express, { Request, Response } from 'express';

const router = express.Router();

// Определяем маршрут ОТНОСИТЕЛЬНО роутера (т.е. просто '/')
// Полный путь будет собран в server.ts: /api/v1/healthcheck + /
router.get("/", (req: Request, res: Response) => {
    console.log("[INFO] Healthcheck request received");
    res.status(200).json({ status: "UP" });
});

export default router;