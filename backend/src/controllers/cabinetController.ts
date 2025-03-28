import { Request, Response, NextFunction } from "express";
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createCabinetSchema, updateCabinetSchema } from '../validators/cabinetValidators';
import { idParamSchema } from '../validators/commonValidators';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
const asyncHandler = (fn: AsyncRequestHandler) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next); // Передаем ошибки дальше
    };


// 📌 Получение всех кабинетов
export const getCabinets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const cabinets = await prisma.cabinet.findMany();
    res.status(200).json({ message: "Список кабинетов", data: cabinets });
});

// 📌 Создание нового кабинета
export const createCabinet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Валидация и преобразование типов через Zod
    const validatedData = createCabinetSchema.parse(req.body);

    const cabinet = await prisma.cabinet.create({
        data: validatedData
    });

    res.status(201).json({ message: "Кабинет успешно создан", data: cabinet });
});

// 📌 Обновление кабинета
export const updateCabinet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Валидация ID из параметров URL
    const { id } = idParamSchema.parse(req.params);
    // Валидация и преобразование данных из тела запроса
    // Используем partial схему, т.к. не все поля могут прийти для обновления
    const validatedData = updateCabinetSchema.parse(req.body);

    // Проверяем, есть ли вообще данные для обновления после валидации
    if (Object.keys(validatedData).length === 0) {
         res.status(400).json({ message: "Нет данных для обновления" });
         return;
    }

    const updatedCabinet = await prisma.cabinet.update({
        where: { id }, // ID уже число после валидации idParamSchema
        data: validatedData // Данные уже правильных типов после валидации updateCabinetSchema
    });

    res.status(200).json({ message: "Кабинет успешно обновлен", data: updatedCabinet });
});

// 📌 Удаление кабинета
export const deleteCabinet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Валидация ID из параметров URL
    const { id } = idParamSchema.parse(req.params);

    await prisma.cabinet.delete({
        where: { id }, // ID уже число
    });

    // При успешном удалении часто возвращают статус 204 No Content без тела ответа
    // или статус 200 с сообщением
    res.status(200).json({ message: "Кабинет успешно удален" });
    // Альтернатива: res.status(204).send();
});