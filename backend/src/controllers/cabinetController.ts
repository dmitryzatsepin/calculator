import { Request, Response } from "express";
import { createCabinetSchema, CreateCabinetInput } from '../validators/cabinetValidators';
import { z } from 'zod';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Получение всех кабинетов
export const getCabinets = async (req: Request, res: Response): Promise<void> => {
    try {
        const cabinets = await prisma.cabinet.findMany();
        res.status(200).json({ message: "Список кабинетов", cabinets });
    } catch (error) {
        console.error("Ошибка получения кабинетов:", (error as Error).message);
        res.status(500).json({ message: "Ошибка сервера", error: (error as Error).message });
    }
};

// 📌 Создание нового кабинета
export const createCabinet = async (req: Request, res: Response): Promise<void> => {
    try {
        // Валидация и получение типизированных данных
        const validatedData = createCabinetSchema.parse(req.body); // parse выбросит ошибку, если валидация не пройдет

        // Данные уже проверены и имеют правильные типы благодаря Zod и coerce
        const cabinet = await prisma.cabinet.create({
            data: validatedData // Просто передаем валидированные данные
        });

        res.status(201).json({ message: "Кабинет создан", cabinet });
    } catch (error) { // error здесь имеет тип unknown
        if (error instanceof z.ZodError) {
            // Ошибка валидации Zod
            console.error("Ошибка валидации:", error.errors);
            res.status(400).json({ message: "Ошибка валидации", errors: error.format() });
        // Проверяем, является ли это ошибкой Prisma с кодом и метаданными
        } else if (error instanceof Error && 'code' in error && 'meta' in error) {
             // Здесь мы можем безопасно использовать error.message, т.к. error instanceof Error
             console.error("Prisma Error:", { code: (error as any).code, meta: (error as any).meta, message: error.message });
             res.status(500).json({ message: "Ошибка базы данных при создании кабинета", error: error.message });
        // Проверяем, является ли это просто стандартным объектом Error
        } else if (error instanceof Error) {
            // Здесь мы можем безопасно использовать error.message
            console.error("Общая ошибка создания кабинета:", error.message);
            res.status(500).json({ message: "Ошибка сервера при создании кабинета", error: error.message });
        // Если это что-то другое (не объект Error)
        } else {
            console.error("Неизвестная ошибка создания кабинета:", error);
            res.status(500).json({ message: "Неизвестная ошибка сервера при создании кабинета" });
        }
    }
};

// 📌 Обновление кабинета
export const updateCabinet = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, width, height, modulesQ, powerUnitQ, powerUnitCapacity, receiver, cooler, pixelStep, location, material, placement} = req.body;

        if (
            !name || !width || !height || !modulesQ || !powerUnitQ || !powerUnitCapacity || !receiver || !cooler || !Array.isArray(pixelStep) || pixelStep.length === 0 || !location || !Array.isArray(material) || material.length === 0|| !placement
        ) {
            res.status(400).json({ message: "Все поля обязательны" });
            return;
        }

        const updatedCabinet = await prisma.cabinet.update({
            where: { id: Number(id) },
            data: {
                name,
                width: parseInt(width, 10),
                height: parseInt(height, 10),
                modulesQ: parseInt(modulesQ, 10),
                powerUnitQ: parseInt(powerUnitQ, 10),
                powerUnitCapacity: parseInt(powerUnitCapacity, 10),
                receiver: parseInt(receiver, 10),
                cooler: parseInt(cooler, 10),
                pixelStep,
                location,
                material,
                placement,
            }
        });

        res.status(200).json({ message: "Кабинет обновлен", updatedCabinet });
    } catch (error) {
        console.error("Ошибка обновления кабинета:", (error as Error).message);
        res.status(500).json({ message: "Ошибка сервера", error: (error as Error).message });
    }
};

// 📌 Удаление кабинета
export const deleteCabinet = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ message: "ID кабинета обязателен" });
            return;
        }

        await prisma.cabinet.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: "Кабинет удален" });
    } catch (error) {
        console.error("Ошибка удаления кабинета:", (error as Error).message);
        res.status(500).json({ message: "Ошибка сервера", error: (error as Error).message });
    }
};