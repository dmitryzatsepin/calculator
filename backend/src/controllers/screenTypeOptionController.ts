import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 

// --- Получение всех связей ScreenType-Option ---
export const getAllScreenTypeOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const screenTypeOptions = await prisma.screenTypeOption.findMany({
      // Включаем связанные данные для ScreenType и Option
      include: {
        screenType: true, // Включить данные связанного ScreenType
        option: true      // Включить данные связанного Option
      }
    }); 
    res.status(200).json(screenTypeOptions);
  } catch (error) {
    console.error("Ошибка получения связей ScreenType-Option:", error);
    res.status(500).json({ message: "Ошибка сервера при получении связей ScreenType-Option" });
  }
};
