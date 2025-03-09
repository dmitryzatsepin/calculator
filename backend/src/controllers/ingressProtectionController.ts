import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Получение степеней защиты
export const getIngressProtection = async (req: Request, res: Response) => {
  try {
    const protections = await prisma.ingressProtection.findMany(); // ✅ Исправлено
    res.status(200).json({ protections }); // ✅ Исправлено (отдаем protections)
  } catch (error) {
    console.error("Ошибка загрузки степеней защиты:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
