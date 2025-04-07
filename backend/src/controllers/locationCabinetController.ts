// src/controllers/locationCabinetController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Убедись, что импорт prisma правильный

export const getAllLocationCabinets = async (req: Request, res: Response): Promise<void> => {
  try {
    const relations = await prisma.locationCabinet.findMany({
      include: { 
        location: true, // Включаем связанные данные location
        cabinet: true   // Включаем связанные данные cabinet
      },
    });
    // Преобразуем Decimal в строчку для priceUsd в объекте cabinet
    const result = relations.map(r => ({
      ...r,
      cabinet: { 
        ...r.cabinet, 
        priceUsd: r.cabinet.priceUsd?.toString() ?? null 
      }
    }));
    res.status(200).json(result); // Отправляем результат
  } catch (error) {
    console.error("Ошибка получения связей Location-Cabinet:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// TODO: Добавить другие функции (getById, create, delete) позже при необходимости