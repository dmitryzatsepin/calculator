
//backend\src\types\express\index.d.ts
// 1. Определяем структуру нашего пользователя
export interface CustomUser {
    id: number;
    email: string;
    role: "USER" | "ADMIN";
}

// 2. Расширяем глобальное пространство имен Express
declare global {
  namespace Express {

    export interface User extends CustomUser {}
  }
}

export {};