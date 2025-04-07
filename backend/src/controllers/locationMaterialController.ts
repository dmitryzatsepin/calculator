// src/controllers/locationMaterialController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Убедись, что импорт prisma правильный

export const getAllLocationMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const relations = await prisma.locationMaterial.findMany({
      include: { 
        location: true, // Включаем связанные данные location
        material: true  // Включаем связанные данные material
      }, 
    });
    res.status(200).json(relations); // Отправляем результат
  } catch (error) {
    console.error("Ошибка получения связей Location-Material:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// TODO: Добавить другие функции (getById, create, delete) позже при необходимости