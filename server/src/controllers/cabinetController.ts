import { Request, Response } from "express";
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
        const { type, width, height, cooler, modulesQ, name, pixelOption, powerUnitCapacity, powerUnitQ, receiver } = req.body;
        
        if (
            !type || !width || !height || !cooler || !modulesQ || !name || 
            !Array.isArray(pixelOption) || pixelOption.length === 0 || 
            !powerUnitCapacity || !powerUnitQ || !receiver
        ) {
            res.status(400).json({ message: "Все поля обязательны" });
            return;
        }

        const cabinet = await prisma.cabinet.create({
            data: {
                type,
                width: parseInt(width, 10),
                height: parseInt(height, 10),
                cooler: parseInt(cooler, 10),
                modulesQ: parseInt(modulesQ, 10),
                name,
                pixelOption,
                powerUnitCapacity: parseInt(powerUnitCapacity, 10),
                powerUnitQ: parseInt(powerUnitQ, 10),
                receiver: parseInt(receiver, 10),
            }
        });

        res.status(201).json({ message: "Кабинет создан", cabinet });
    } catch (error) {
        console.error("Ошибка создания кабинета:", (error as Error).message);
        res.status(500).json({ message: "Ошибка сервера", error: (error as Error).message });
    }
};

// 📌 Обновление кабинета
export const updateCabinet = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { type, width, height, cooler, modulesQ, name, pixelOption, powerUnitCapacity, powerUnitQ, receiver } = req.body;

        if (!id || !type || !width || !height || !cooler || !modulesQ || !name || 
            !Array.isArray(pixelOption) || pixelOption.length === 0 || 
            !powerUnitCapacity || !powerUnitQ || !receiver) {
            res.status(400).json({ message: "Все поля обязательны" });
            return;
        }

        const updatedCabinet = await prisma.cabinet.update({
            where: { id: Number(id) },
            data: {
                type,
                width: parseInt(width, 10),
                height: parseInt(height, 10),
                cooler: parseInt(cooler, 10),
                modulesQ: parseInt(modulesQ, 10),
                name,
                pixelOption,
                powerUnitCapacity: parseInt(powerUnitCapacity, 10),
                powerUnitQ: parseInt(powerUnitQ, 10),
                receiver: parseInt(receiver, 10),
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