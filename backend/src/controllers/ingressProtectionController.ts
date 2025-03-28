import { Request, Response } from "express";
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';

// 📌 Получение степеней защиты
export const getIngressProtection = asyncHandler(async (req: Request, res: Response) => {
  const protections = await prisma.ingressProtection.findMany();
  res.status(200).json({ message: "Список степеней защиты", data: protections });
});