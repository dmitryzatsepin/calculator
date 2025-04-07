import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 

// --- Получение всех связей Cabinet-Component ---
export const getAllCabinetComponents = async (req: Request, res: Response): Promise<void> => {
  try {
    const cabinetComponents = await prisma.cabinetComponent.findMany({
      include: {
        cabinet: true,
        component: true
      }
    }); 
    res.status(200).json(cabinetComponents);
  } catch (error) {
    console.error("Ошибка получения связей Cabinet-Component:", error);
    res.status(500).json({ message: "Ошибка сервера при получении связей Cabinet-Component" });
  }
};