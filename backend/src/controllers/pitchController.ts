// src/controllers/pitchController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllPitches = async (req: Request, res: Response): Promise<void> => {
  try {
    const pitches = await prisma.pitch.findMany({ orderBy: { code: 'asc' } });
    const result = pitches.map(p => ({ ...p, pitchValue: p.pitchValue.toString() }));
    res.status(200).json(result);
  } catch (error) {
    console.error("Ошибка получения шагов пикселя (Pitch):", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
 // TODO: Add getById, create, update, delete later