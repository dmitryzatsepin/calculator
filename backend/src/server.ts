import express, { Request, Response, NextFunction } from "express"; // Добавили типы
import http from 'http'; // Для управления сервером
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";

import { prisma } from './lib/prisma';

import { configurePassport } from "./config/passport";
import authRoutes from "./routes/authRoutes";
import pixelStepRoutes from "./routes/pixelStepRoutes";
import cabinetRoutes from "./routes/cabinetRoutes";
import screenTypeRoutes from "./routes/screenTypeRoutes";
import protectionRoutes from "./routes/ingressProtection";
import healthcheck from "./routes/healthcheck";


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Рассмотри более строгие настройки CORS для продакшена
app.use(helmet());
app.use(morgan("dev"));
app.use(passport.initialize());
configurePassport(passport);

// Routes
// Healthcheck обычно монтируют на отдельный путь, но оставим на / для совместимости
app.use("/", healthcheck);
app.use("/auth", authRoutes);
app.use("/screen-types", screenTypeRoutes);
app.use("/pixel-steps", pixelStepRoutes);
app.use("/protection", protectionRoutes);
app.use("/cabinets", cabinetRoutes);


// --- Базовый обработчик ошибок ---
// Должен идти ПОСЛЕ всех роутов
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack || err); // Логируем ошибку

  // Отправляем общий ответ об ошибке клиенту
  res.status(500).json({ message: "Internal Server Error" });
});


// --- Запуск сервера и Graceful Shutdown ---
const PORT = process.env.PORT || 5000;

// Создаем и запускаем HTTP сервер
const server = http.createServer(app).listen(PORT, () => { // Используем http.createServer
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});

// Функция для корректного завершения
const gracefulShutdown = async (signal: string) => { // Сделали async для await prisma.$disconnect()
  console.log(`\nReceived ${signal}. Closing HTTP server...`);
  server.close(async (err) => { // Добавили async и сюда
    if (err) {
      console.error('Error closing server:', err);
      process.exit(1);
    } else {
      console.log('HTTP server closed.');
      try {
        // Закрываем соединение с Prisma перед выходом
        await prisma.$disconnect();
        console.log('Prisma connection closed.');
      } catch (dbErr) {
        console.error('Error disconnecting Prisma:', dbErr);
      } finally {
         process.exit(0); // Успешный выход
      }
    }
  });

  // Таймаут для принудительного завершения
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 15000); // 15 секунд
};

// Обработчики сигналов
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Сигнал завершения

// Опционально: Обработка других необработанных ошибок
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
  process.exit(1); // В таких случаях лучше сразу падать
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...', reason);
  process.exit(1); // В таких случаях лучше сразу падать
});