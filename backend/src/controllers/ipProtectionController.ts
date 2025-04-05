import { Request, Response } from "express";
import { prisma } from '../lib/prisma'; // Импорт Prisma остается
import { asyncHandler } from '../middleware/asyncHandler'; // Middleware остается

// 📌 Получение степеней защиты
export const getIpProtection = asyncHandler(async (req: Request, res: Response) => {
  const protections = await prisma.ipProtection.findMany({
      orderBy: { code: 'asc' }
  });

  res.status(200).json({ message: "Список степеней защиты", data: protections });
});