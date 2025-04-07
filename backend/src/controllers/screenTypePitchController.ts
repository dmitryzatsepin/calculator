// src/controllers/screenTypePitchController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Убедись, что импорт prisma правильный

export const getAllScreenTypePitches = async (req: Request, res: Response): Promise<void> => {
  try {
    const relations = await prisma.screenTypePitch.findMany({
      include: { 
        screenType: true, // Включаем связанные данные screenType
        pitch: true       // Включаем связанные данные pitch
      },
    });
    // Преобразуем Decimal в строчку для pitchValue в объекте pitch
    const result = relations.map(r => ({
      ...r,
      pitch: { 
        ...r.pitch, 
        pitchValue: r.pitch.pitchValue.toString() 
      }
    }));
    res.status(200).json(result); // Отправляем результат
  } catch (error) {
    console.error("Ошибка получения связей ScreenType-Pitch:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// TODO: Добавить другие функции (create, delete) позже при необходимости