import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 

// --- Получение всех Типов Пикселей ---
export const getAllPixelTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const pixelTypes = await prisma.pixelType.findMany(); 
    res.status(200).json(pixelTypes);
  } catch (error) {
    console.error("Ошибка получения типов пикселей:", error);
    res.status(500).json({ message: "Ошибка сервера при получении типов пикселей" });
  }
};