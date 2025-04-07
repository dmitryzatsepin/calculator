// src/controllers/screenTypeLocationController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Убедись, что импорт prisma правильный

export const getAllScreenTypeLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const relations = await prisma.screenTypeLocation.findMany({
      include: { 
        screenType: true, // Включаем связанные данные screenType
        location: true    // Включаем связанные данные location
      },
    });
    res.status(200).json(relations); // Отправляем результат
  } catch (error) {
    console.error("Ошибка получения связей ScreenType-Location:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// TODO: Добавить другие функции (create, delete) позже при необходимости