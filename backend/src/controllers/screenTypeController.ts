import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Получение типов экранов
export const getScreenTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.screenType.findMany();
    res.status(200).json({ types });
  } catch (error) {
    console.error("Ошибка загрузки типов экранов:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
