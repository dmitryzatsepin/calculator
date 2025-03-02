import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Получение всех шагов пикселя
export const getPixelSteps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const steps = await prisma.pixelStep.findMany();
        res.status(200).json({ message: "Список шагов пикселя", steps });
    } catch (error) {
        next(error); // Передаем ошибку в middleware обработки ошибок
    }
};

// 📌 Создание шага пикселя
export const createPixelStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, type, width, height, location, option, brightness, refreshFreq } = req.body;
        if (!type || !name || !width || !height || location ||option  || brightness || refreshFreq === undefined) {
            res.status(400).json({ message: "Все поля обязательны" });
            return;
        }

        const step = await prisma.pixelStep.create({
            data: { 
                name, 
                type, 
                width, 
                height, 
                location, 
                option,
                brightness, 
                refreshFreq
            },
        });

        res.status(201).json({ message: "Шаг пикселя создан", step });
    } catch (error) {
        next(error);
    }
};

// 📌 Обновление шага пикселя
export const updatePixelStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, type, width, height, location, option } = req.body;

        if (!type || !name || !width || !height || location || option === undefined) {
            res.status(400).json({ message: "Все поля обязательны" });
            return;
        }

        const step = await prisma.pixelStep.update({
            where: { id: Number(id) },
            data: { type, name, width, height, option },
        });

        res.status(200).json({ message: "Шаг пикселя обновлен", step });
    } catch (error) {
        next(error);
    }
};

// 📌 Удаление шага пикселя
export const deletePixelStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.pixelStep.delete({ where: { id: Number(id) } });

        res.status(200).json({ message: "Шаг пикселя удален" });
    } catch (error) {
        next(error);
    }
};