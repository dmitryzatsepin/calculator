import { Request, Response, NextFunction } from "express";
import passport from "passport";

interface User {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err: Error | null, user: User | false) => {
    if (err || !user) {
      return res.status(401).json({ message: "Не авторизован" });
    }
    req.user = user;
    next();
  })(req, res, next);
};
