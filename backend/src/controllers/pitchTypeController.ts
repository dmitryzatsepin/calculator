// src/controllers/pitchTypeController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllPitchTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const types = await prisma.pitchType.findMany({ orderBy: { name: 'asc' } });
    res.status(200).json(types);
  } catch (error) {
    console.error("Ошибка получения типов шага пикселя (PitchType):", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
 // TODO: Add getById, create, update, delete later