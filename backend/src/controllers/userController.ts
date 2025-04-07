// src/controllers/userController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';

// 📌 Получение всех пользователей (для админки)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Добавить проверку прав администратора, если нужно
  const users = await prisma.user.findMany({
    select: { // Исключаем пароль
      id: true, email: true, name: true, role: true, createdAt: true,
    },
    orderBy: { id: 'asc' }
  });
  // Возвращаем чистый массив
  res.status(200).json(users);
});

// TODO: Добавить getUserById, createUser, updateUser, deleteUser