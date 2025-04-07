// src/controllers/pitchTypePitchController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Убедись, что импорт prisma правильный

export const getAllPitchTypePitches = async (req: Request, res: Response): Promise<void> => {
  try {
    const relations = await prisma.pitchTypePitch.findMany({
      include: { 
        pitchType: true, // Включаем связанные данные pitchType
        pitch: true      // Включаем связанные данные pitch
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
    console.error("Ошибка получения связей PitchType-Pitch:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// TODO: Добавить другие функции (create, delete) позже при необходимости