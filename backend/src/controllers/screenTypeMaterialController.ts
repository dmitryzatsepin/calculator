import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 

// --- Получение всех связей ScreenType-Material ---
export const getAllScreenTypeMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const screenTypeMaterials = await prisma.screenTypeMaterial.findMany({
      // Включаем связанные данные для ScreenType и Material, чтобы ответ был информативным
      include: {
        screenType: true, // Включить данные связанного ScreenType
        material: true    // Включить данные связанного Material
      }
    }); 
    res.status(200).json(screenTypeMaterials);
  } catch (error) {
    console.error("Ошибка получения связей ScreenType-Material:", error);
    res.status(500).json({ message: "Ошибка сервера при получении связей ScreenType-Material" });
  }
};
