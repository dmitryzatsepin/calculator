import express, { Request, Response, NextFunction, Application } from "express"; // 
import http from 'http';
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";

// --- Конфигурация и Библиотеки ---
import { prisma } from './lib/prisma';
import { configurePassport } from "./config/passport";

// --- Маршруты ---
import healthcheckRoute from "./routes/healthcheck";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import cabinetRoutes from "./routes/cabinetRoutes";
import cabinetMaterialRoutes from "./routes/cabinetMaterialRoutes";
import cabinetComponentRoutes from "./routes/cabinetComponentRoutes"; 
import componentServiceRoutes from "./routes/componentServiceRoutes";
import ipProtectionRoutes from "./routes/ipProtectionRoutes";
import manufacturerRoutes from "./routes/manufacturerRoutes";
import materialRoutes from "./routes/materialRoutes";
import moduleRoutes from "./routes/moduleRoutes";
import optionRoutes from "./routes/optionRoutes";
import pixelStepDefinitionRoutes from "./routes/pixelStepDefinitionRoutes";
import pixelTypeRoutes from "./routes/pixelTypeRoutes";
import pixelOptionRoutes from "./routes/pixelOptionRoutes";
import screenTypeRoutes from "./routes/screenTypeRoutes";
import screenTypeMaterialRoutes from "./routes/screenTypeMaterialRoutes";
import screenTypeOptionRoutes from "./routes/screenTypeOptionRoutes";
//import currencyRoutes from './routes/currencyRoutes';

// --- Инициализация ---
dotenv.config(); // Загружаем переменные окружения
const app: Application = express(); // Явно типизируем app
const API_PREFIX = process.env.API_PREFIX || '/api/v1'; // Префикс для API, можно задать в .env

// --- Основные Middleware ---
app.use(cors()); // Настройки CORS (можно ужесточить для продакшена)
app.use(helmet()); // Базовая защита HTTP заголовков
app.use(express.json()); // Парсинг JSON тел запросов
app.use(morgan("dev")); // Логирование HTTP запросов в консоль
app.use(passport.initialize()); // Инициализация Passport
configurePassport(passport); // Конфигурируем стратегии Passport

// --- Регистрация Маршрутов API ---
console.log(`Registering routes with prefix: ${API_PREFIX}`);

// Простой ответ на корневой путь API
app.get(API_PREFIX, (req: Request, res: Response) => {
  res.status(200).json({ message: 'Calculator API is running!' });
});

// Регистрация всех роутов для сущностей
app.use(`${API_PREFIX}/healthcheck`, healthcheckRoute);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/cabinets`, cabinetRoutes);
app.use(`${API_PREFIX}/cabinet-materials`, cabinetMaterialRoutes);
app.use(`${API_PREFIX}/cabinet-components`, cabinetComponentRoutes);
app.use(`${API_PREFIX}/component-services`, componentServiceRoutes);
app.use(`${API_PREFIX}/ip-protection`, ipProtectionRoutes);
app.use(`${API_PREFIX}/manufacturers`, manufacturerRoutes);
app.use(`${API_PREFIX}/materials`, materialRoutes);
app.use(`${API_PREFIX}/modules`, moduleRoutes);
app.use(`${API_PREFIX}/options`, optionRoutes);
app.use(`${API_PREFIX}/pixel-step-definitions`, pixelStepDefinitionRoutes);
app.use(`${API_PREFIX}/pixel-types`, pixelTypeRoutes);
app.use(`${API_PREFIX}/pixel-options`, pixelOptionRoutes);
app.use(`${API_PREFIX}/screen-types`, screenTypeRoutes);
app.use(`${API_PREFIX}/screen-type-materials`, screenTypeMaterialRoutes);
app.use(`${API_PREFIX}/screen-type-options`, screenTypeOptionRoutes);
// if (currencyRoutes) { app.use(`${API_PREFIX}/currencies', currencyRoutes); } // Если нужен

// --- Обработка ошибок ---
// Middleware для обработки не найденных роутов (404) - опционально
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Маршрут не найден - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Основной обработчик ошибок (должен идти последним)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Логируем полную ошибку для отладки
  console.error(`[ERROR] ${err.message}\n${err.stack}`);

  // Устанавливаем статус ошибки (если он не был установлен ранее)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Отправляем стандартизированный JSON ответ клиенту
  res.json({
    message: err.message || "Internal Server Error",
    // В режиме разработки можно отправлять стек вызовов, в продакшене - нет
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});


// --- Запуск Сервера и Корректное Завершение ---
const PORT = process.env.PORT || 5000;

// Используем стандартный http сервер для лучшего контроля над shutdown
const server = http.createServer(app).listen(PORT, () => {
  console.log(`🚀 Backend server started successfully.`);
  console.log(`   Listening on: http://localhost:${PORT}`);
  console.log(`   API Root: http://localhost:${PORT}${API_PREFIX}`);
});

// Функция корректного завершения
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🔌 Received ${signal}. Starting graceful shutdown...`);
  console.log("   Closing HTTP server...");
  server.close(async (err) => {
    if (err) {
      console.error('   [Error] closing server:', err);
      process.exit(1); // Выход с ошибкой
    }
    console.log('   ✅ HTTP server closed.');
    try {
      console.log('   Disconnecting Prisma...');
      await prisma.$disconnect(); // Закрываем соединение Prisma
      console.log('   ✅ Prisma connection closed.');
      process.exit(0); // Успешный выход
    } catch (dbErr) {
      console.error('   [Error] disconnecting Prisma:', dbErr);
      process.exit(1); // Выход с ошибкой
    }
  });

  // Таймаут для принудительного завершения, если что-то зависло
  setTimeout(() => {
    console.error('   [Timeout] Could not close connections in time, forcing shutdown.');
    process.exit(1);
  }, 15000); // 15 секунд
};

// Обработчики сигналов завершения
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // docker stop, kill, etc.

// Обработка критических ошибок процесса
process.on('uncaughtException', (error, origin) => {
  console.error(`\n💥 UNCAUGHT EXCEPTION! Origin: ${origin}`);
  console.error(error);
  console.error('   Shutting down application...');
  process.exit(1); // При таких ошибках лучше перезапустить приложение
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 UNHANDLED REJECTION!');
  console.error('   Reason:', reason);
  console.error('   Promise:', promise);
  console.error('   Shutting down application...');
  // ВАЖНО: Неправильно вызывать gracefulShutdown здесь, т.к. состояние может быть неконсистентным.
  // Лучше просто завершить процесс.
  server.close(() => {
      process.exit(1);
  });
  setTimeout(() => process.exit(1), 2000); // Принудительное завершение через 2с
});