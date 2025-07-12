// src/middleware/errorHandler.ts (Новый файл)
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../prisma/generated/client';
import { JsonWebTokenError } from 'jsonwebtoken'; // Если используете JWT

export const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    console.error("-----------------------------------------");
    console.error("Произошла ошибка:");
    console.error("Path:", req.path);
    console.error("Method:", req.method);
    // Не логируйте req.body в продакшене, если там могут быть чувствительные данные
    // console.error("Body:", req.body);
    console.error("Error:", err); // Логируем полную ошибку для отладки
    console.error("-----------------------------------------");


    if (err instanceof ZodError) {
        // Ошибка валидации Zod
        res.status(400).json({
            message: "Ошибка валидации входных данных",
            errors: err.format(), // Подробные ошибки по полям
        });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Известные ошибки Prisma (нарушение ограничений, запись не найдена и т.д.)
        let status = 500;
        let message = "Ошибка базы данных";

        switch (err.code) {
            case 'P2002': // Unique constraint violation
                status = 409; // Conflict
                const target = err.meta?.target; // Сохраним в переменную для удобства
                // Проверяем, что target существует и является массивом
                const targetString = Array.isArray(target)
                    ? target.join(', ')
                    : 'неизвестные поля'; // Запасной вариант, если target не массив
                message = `Запись с таким(и) уникальным(и) полем(ами) уже существует: ${targetString}`;
                break;
            case 'P2014': // Required relation violation
                status = 400;
                message = `Ошибка связи между таблицами: ${err.meta?.relation_name}`;
                break;
            case 'P2025': // Record to update/delete not found
                status = 404; // Not Found
                message = `Запись для ${req.method === 'DELETE' ? 'удаления' : 'обновления'} не найдена`;
                break;
            // Добавьте другие коды Prisma по необходимости
            // https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
            default:
                message = `Ошибка базы данных (код: ${err.code})`;
        }
        res.status(status).json({ message, code: err.code });
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        // Ошибки валидации Prisma (например, неверный тип данных, не пойманный Zod)
        // Обычно Zod должен ловить это раньше
        res.status(400).json({
            message: "Ошибка валидации данных для базы данных",
            // error: err.message // Можно скрыть в продакшене
        });
    }

    if (err instanceof JsonWebTokenError) {
        // Пример обработки ошибок JWT
        res.status(401).json({ message: 'Невалидный токен аутентификации' });
    }


    // Общая ошибка сервера
    // В продакшене лучше не отправлять err.message клиенту, если он может содержать чувствительную информацию
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({ // Используем статус из ошибки, если он есть
        message: err.message || "Внутренняя ошибка сервера",
        // Можно добавить stack trace в режиме разработки
        stack: isProduction ? undefined : err.stack,
    });
};