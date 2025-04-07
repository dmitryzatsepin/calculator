// src/controllers/refreshRateController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllRefreshRates = async (req: Request, res: Response): Promise<void> => {
  try {
    const rates = await prisma.refreshRate.findMany({ orderBy: { value: 'asc' } });
    res.status(200).json(rates);
  } catch (error) {
    console.error("Ошибка получения частот обновления:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
// TODO: Add getById, create, update, delete later