// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import passport from "passport";
// ИМПОРТИРУЕМ НАШ ТИП (укажи правильный путь!)
import { CustomUser } from "../types/express"; // <--- ДОБАВИЛИ ИМПОРТ

// Интерфейс User здесь больше не нужен, так как импортируем CustomUser
// interface User { ... }

export const protect = (req: Request, res: Response, next: NextFunction) => {
  console.log('Protect middleware вызван...');
  passport.authenticate("jwt", { session: false }, (err: Error | null, user: CustomUser | false, info: any) => { // Используем CustomUser в callback
    if (err || !user) {
      return res.status(401).json({ message: "Не авторизован" });
    }
    req.user = user; // Присваиваем объект типа CustomUser
    next();
  })(req, res, next);
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
    console.log('Admin middleware вызван...');
    // ЯВНО ПРИВОДИМ ТИП req.user к CustomUser
    const user = req.user as CustomUser; // <--- ЯВНОЕ ПРИВЕДЕНИЕ ТИПА
    if (user && user.role === 'ADMIN') {
        console.log('Доступ разрешен для ADMIN');
        next();
    } else {
        console.log('Доступ запрещен. Требуются права администратора.', { userRole: user?.role });
        res.status(403);
        const error = new Error('Доступ запрещен. Требуются права администратора.');
        next(error);
    }
};