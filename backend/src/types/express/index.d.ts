// backend/types/express/index.d.ts

// 1. Определяем структуру нашего пользователя
//    (Должна точно совпадать с той, что используется в authMiddleware)
interface CustomUser {
    id: number;
    email: string;
    role: "USER" | "ADMIN";
    // Добавь другие поля, если они есть в твоем объекте user
}

// 2. Расширяем глобальное пространство имен Express
declare global {
  namespace Express {
    // 3. "Сливаем" наш интерфейс CustomUser с существующим интерфейсом Express.User
    //    Теперь TypeScript будет знать, что req.user имеет поля id, email, role
    export interface User extends CustomUser {}
  }
}

// 4. Пустой экспорт может быть нужен, чтобы файл считался модулем
//    (иногда требуется для правильной работы глобальных деклараций)
export {};