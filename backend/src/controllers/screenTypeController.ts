// src/controllers/screenTypeController.ts
import { Request, Response, NextFunction } from "express"; // Добавили NextFunction
import { PrismaClient, Prisma } from "@prisma/client"; // Добавили Prisma для типов ошибок
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler'; // Оставляем
// import { idParamSchema } from "../validators/commonValidators"; // Пока не нужно
// import { createScreenTypeSchema, updateScreenTypeSchema } from "../validators/screenTypeValidators"; // Пока не нужно

// --- Вспомогательная функция для маппинга ответа (УПРОЩЕНО) ---
// Убраны удаленные связи materials и options
const mapScreenTypeToResponse = (screenType: {id: number, code: string, name: string, createdAt: Date, updatedAt: Date } | null) => {
    if (!screenType) return null;
    return {
        id: screenType.id,
        code: screenType.code, // Добавили code
        name: screenType.name,
        createdAt: screenType.createdAt,
        updatedAt: screenType.updatedAt,
    };
};

// --- Вспомогательная функция для проверки связанных кодов (ЗАКОММЕНТИРОВАНА) ---
/*
const checkRelatedCodes = async (
    // ... (код не используется, т.к. create/update закомментированы) ...
) => {
    // ...
};
*/


// 📌 Получение всех типов экранов (Переименовано, обновлено, используется маппер)
export const getAllScreenTypes = asyncHandler(async (req: Request, res: Response) => {
  const screenTypes = await prisma.screenType.findMany({
    orderBy: { name: 'asc' },
    // Убрали include для materials и options, т.к. их нет в модели
  });
  // Используем хелпер для маппинга (хотя он сейчас простой)
  const responseData = screenTypes.map(mapScreenTypeToResponse);
  // Возвращаем чистый массив
  res.status(200).json(responseData);
});

// -------------------------------------------------------------------- //
// --- ВЕСЬ КОД НИЖЕ ЗАКОММЕНТИРОВАН (getById, create, update, delete) --- //
// -------------------------------------------------------------------- //

/*
// 📌 Получение одного типа экрана по ID (ТРЕБУЕТ ПРОВЕРКИ И АДАПТАЦИИ)
export const getScreenTypeById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Проверить/адаптировать, если будет нужен
    const { id } = {}; // Заглушка idParamSchema.parse(req.params);
    try {
        const screenType = await prisma.screenType.findUniqueOrThrow({
            where: { id },
            // Убрали include
        });
        res.status(200).json({ message: "Тип экрана найден", data: mapScreenTypeToResponse(screenType) });
    } catch (e) {
        // ... (обработка ошибок) ...
    }
});
*/

/*
// 📌 Создание нового типа экрана (ТРЕБУЕТ ПОЛНОЙ ПЕРЕРАБОТКИ)
export const createScreenType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Переписать под новую схему (code, name) и связи (locations, pitches)
    // 1. Обновить валидатор createScreenTypeSchema
    // 2. Проверить уникальность code
    // 3. Проверить существование locationCodes, pitchCodes
    // 4. Обновить prisma.screenType.create с вложенным create для связей
    res.status(501).json({ message: "Создание типа экрана еще не реализовано" });
});
*/

/*
// 📌 Обновление типа экрана (ТРЕБУЕТ ПОЛНОЙ ПЕРЕРАБОТКИ)
export const updateScreenType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Переписать под новую схему
    // 1. Обновить валидатор updateScreenTypeSchema
    // 2. Обработать обновление code, name
    // 3. Реализовать обновление связей M-N (locations, pitches) через транзакцию
    res.status(501).json({ message: "Обновление типа экрана еще не реализовано" });
});
*/

/*
// 📌 Удаление типа экрана (ТРЕБУЕТ ПОЛНОЙ ПЕРЕРАБОТКИ ПРОВЕРКИ ЗАВИСИМОСТЕЙ)
export const deleteScreenType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Переписать проверку зависимостей под новую схему
    // Теперь нужно проверять связи в ScreenTypeLocation и ScreenTypePitch
    // (хотя они удалятся каскадно) и в Module (если связь с Module вернется)
    res.status(501).json({ message: "Удаление типа экрана еще не реализовано" });
});
*/