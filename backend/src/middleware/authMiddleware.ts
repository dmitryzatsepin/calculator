// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import passport from "passport";

// Определяем интерфейс для пользователя
interface User {
  id: number;
  email: string;
  role: "USER" | "ADMIN"; // Тип роли из твоей Prisma схемы
}

// Расширяем интерфейс Request, чтобы добавить поле user
interface RequestWithUser extends Request {
  user?: User; // Делаем user опциональным на всякий случай
}

// Middleware для защиты роутов (проверка JWT)
export const protect = (req: RequestWithUser, res: Response, next: NextFunction) => { // Используем RequestWithUser
  console.log('Protect middleware вызван...');
  console.log('Authorization Header:', req.headers.authorization);
  passport.authenticate("jwt", { session: false }, (err: Error | null, user: User | false, info: any) => {
    console.log('Passport authenticate callback:', { err, user, info });
    if (err || !user) {
      console.log('Ошибка аутентификации или пользователь не найден');
      // Не отправляем ответ здесь, если хотим кастомную обработку ошибок Passport
      // Можно просто вызвать next(err || new Error('Unauthorized'));
      return res.status(401).json({ message: "Не авторизован" });
    }
    console.log('Пользователь успешно аутентифицирован:', user);
    req.user = user; // Присваиваем пользователя к req
    next(); // Передаем управление дальше (например, к 'admin' или к контроллеру)
  })(req, res, next);
};

// НОВОЕ: Middleware для проверки роли администратора
export const admin = (req: RequestWithUser, res: Response, next: NextFunction) => { // Используем RequestWithUser
    console.log('Admin middleware вызван...');
    // Проверяем, что protect отработал и добавил req.user с нужной ролью
    if (req.user && req.user.role === 'ADMIN') {
        console.log('Доступ разрешен для ADMIN');
        next(); // Пользователь админ, пропускаем дальше
    } else {
        console.log('Доступ запрещен. Требуются права администратора.', { userRole: req.user?.role });
        res.status(403); // Forbidden
        // Создаем ошибку, чтобы ее мог поймать обработчик ошибок Express
        const error = new Error('Доступ запрещен. Требуются права администратора.');
        next(error); // Передаем ошибку дальше
    }
};