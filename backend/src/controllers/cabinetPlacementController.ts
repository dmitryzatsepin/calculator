// src/controllers/cabinetPlacementController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllCabinetPlacements = async (req: Request, res: Response): Promise<void> => {
  try {
    const placements = await prisma.cabinetPlacement.findMany({ orderBy: { name: 'asc' } });
    res.status(200).json(placements);
  } catch (error) {
    console.error("Ошибка получения размещений кабинетов:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
// TODO: Add getById, create, update, delete later