import { Router } from "express";
import passport from "passport";
import { register, login, logout } from "../controllers/authController"; 

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "Доступ разрешён", user: req.user });
  }
);

export default router;
