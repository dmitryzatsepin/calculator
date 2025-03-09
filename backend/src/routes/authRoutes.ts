import { Router } from "express";
import { register, login, logout } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// 🔐 Защищенный маршрут, возвращает данные авторизованного пользователя
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
