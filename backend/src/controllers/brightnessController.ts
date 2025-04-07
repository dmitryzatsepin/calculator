// src/controllers/brightnessController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllBrightnessValues = async (req: Request, res: Response): Promise<void> => {
  try {
    const values = await prisma.brightness.findMany({ orderBy: { value: 'asc' } });
    res.status(200).json(values);
  } catch (error) {
    console.error("Ошибка получения значений яркости:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
// TODO: Add getById, create, update, delete later