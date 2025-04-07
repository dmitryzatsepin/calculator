// src/controllers/locationPitchController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Убедись, что импорт prisma правильный

export const getAllLocationPitches = async (req: Request, res: Response): Promise<void> => {
  try {
    const relations = await prisma.locationPitch.findMany({
      include: { 
        location: true, // Включаем связанные данные location
        pitch: true     // Включаем связанные данные pitch
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
    console.error("Ошибка получения связей Location-Pitch:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// TODO: Добавить другие функции (getById, create, delete) позже при необходимости