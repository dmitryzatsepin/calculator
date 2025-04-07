import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 

// --- Получение всех связей Cabinet-Material ---
export const getAllCabinetMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const cabinetMaterials = await prisma.cabinetMaterial.findMany({
      include: {
        cabinet: true,
        material: true
      }
    }); 
    res.status(200).json(cabinetMaterials);
  } catch (error) {
    console.error("Ошибка получения связей Cabinet-Material:", error);
    res.status(500).json({ message: "Ошибка сервера при получении связей Cabinet-Material" });
  }
};