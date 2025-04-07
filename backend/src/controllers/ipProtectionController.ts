// src/controllers/ipProtectionController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 

export const getAllIpProtections = async (req: Request, res: Response): Promise<void> => {
  try {
    const protections = await prisma.ipProtection.findMany({ 
        orderBy: { code: 'asc' } // Или другая сортировка
    });
    res.status(200).json(protections); // <--- ВОЗВРАЩАЕМ МАССИВ
  } catch (error) {
    console.error("Ошибка получения IP защит:", error);
    res.status(500).json({ message: "Ошибка сервера при получении IP защит" });
  }
};