import { Request, Response } from "express";
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';

// 📌 Получение типов экранов
export const getScreenTypes = asyncHandler(async (req: Request, res: Response) => {
  const types = await prisma.screenType.findMany();
  res.status(200).json({ message: "Список типов экранов", data: types });
});