import { PrismaClient, Role, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// 🔑 Функция для генерации JWT
const generateToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("!!! JWT_SECRET не задан в переменных окружения !!!");
    throw new Error("Внутренняя ошибка сервера: JWT_SECRET не настроен.");
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

// 📝 Регистрация (Sign Up)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Имя, email и пароль обязательны" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Пользователь с таким email уже существует" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.USER,
      },
    });

    // Генерируем токен для нового пользователя
    const token = generateToken(newUser.id);
    const { password: _, ...userData } = newUser;

    res.status(201).json({
      message: "Пользователь создан",
      user: userData,
      token,
    });

  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ message: "Ошибка сервера при регистрации" });
  }
};

// 📝 Авторизация (Sign In)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email и пароль обязательны" });
      return;
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Неверный email или пароль" });
      return;
    }

    const token = generateToken(user.id);
    const { password: _, ...userData } = user;

    res.status(200).json({
        message: "Вход успешен",
        user: userData,
        token
    });

  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        res.status(401).json({ message: "Неверный email или пароль" });
    } else {
        console.error("Ошибка входа:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
  }
};

// 📝 Выход (Log Out)
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: "Вы успешно вышли из системы" });
  } catch (error) {
    console.error("Ошибка выхода:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};