import { PrismaClient, Role } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// 🔑 Функция для генерации JWT
const generateToken = (userId: number): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET не задан в .env");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 📝 Регистрация (Sign Up)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Имя, email и пароль обязательны" });
      return Promise.resolve(); // ✅ Добавлено, чтобы соответствовать Promise<void>
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: "Пользователь уже существует" });
      return Promise.resolve(); // ✅ Добавлено, чтобы избежать ошибки
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: Role.USER }, // ✅ Используем Role.USER вместо строки "USER"
    });

    const token = generateToken(newUser.id);

    res.status(201).json({ message: "Пользователь создан", user: newUser, token });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ message: "Ошибка сервера", error });
  }
};




// 📝 Авторизация (Sign In)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Неверный email или пароль" });
      return;
    }

    const token = generateToken(user.id);
    res.json({ user, token });
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).json({ message: "Ошибка сервера", error });
  }
};

// 📝 Выход (Log Out)
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: "Вы вышли из системы" });
};
