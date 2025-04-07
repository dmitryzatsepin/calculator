import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 

// --- Получение всех Опций Пикселей ---
export const getAllPixelOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const pixelOptions = await prisma.pixelOption.findMany({

    }); 
    res.status(200).json(pixelOptions);
  } catch (error) {
    console.error("Ошибка получения опций пикселей:", error);
    res.status(500).json({ message: "Ошибка сервера при получении опций пикселей" });
  }
};
