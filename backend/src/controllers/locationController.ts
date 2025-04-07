// src/controllers/locationController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; 

export const getAllLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' } 
    });
    res.status(200).json(locations); 
  } catch (error) {
    console.error("Ошибка получения локаций:", error);
    res.status(500).json({ message: "Ошибка сервера при получении локаций" });
  }
};
// TODO: Add getById, create, update, delete later