// src/server.ts
import express, { Request, Response, NextFunction, Application } from "express"; 
import http from 'http';
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";

// --- Конфигурация и Библиотеки ---
import { prisma } from './lib/prisma';
import { configurePassport } from "./config/passport"; // Убедись, что путь верный

// --- Маршруты ---
import healthcheckRoute from "./routes/healthcheck";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes"; 
import cabinetRoutes from "./routes/cabinetRoutes";
import cabinetComponentRoutes from "./routes/cabinetComponentRoutes"; 
import componentServiceRoutes from "./routes/componentServiceRoutes";
import ipProtectionRoutes from "./routes/ipProtectionRoutes";
import manufacturerRoutes from "./routes/manufacturerRoutes";
import materialRoutes from "./routes/materialRoutes";
import moduleRoutes from "./routes/moduleRoutes";
import screenTypeRoutes from "./routes/screenTypeRoutes";
// --- 👇 Добавляем импорты для новых роутов 👇 ---
import locationRoutes from "./routes/locationRoutes"; 
import cabinetPlacementRoutes from "./routes/cabinetPlacementRoutes"; 
import pitchRoutes from "./routes/pitchRoutes"; 
import pitchTypeRoutes from "./routes/pitchTypeRoutes"; 
import refreshRateRoutes from "./routes/refreshRateRoutes"; 
import brightnessRoutes from "./routes/brightnessRoutes"; 
import screenTypeLocationRoutes from "./routes/screenTypeLocationRoutes"; 
import screenTypePitchRoutes from "./routes/screenTypePitchRoutes"; 
import locationMaterialRoutes from "./routes/locationMaterialRoutes"; 
import locationPitchRoutes from "./routes/locationPitchRoutes"; 
import locationCabinetRoutes from "./routes/locationCabinetRoutes"; 
import materialCabinetRoutes from "./routes/materialCabinetRoutes"; 
import cabinetPlacementCabinetRoutes from "./routes/cabinetPlacementCabinetRoutes"; 
import pitchTypePitchRoutes from "./routes/pitchTypePitchRoutes"; 
// --- Конец добавленных импортов ---
//import currencyRoutes from './routes/currencyRoutes'; // Оставил закомментированным

// --- Инициализация ---
dotenv.config(); 
const app: Application = express(); 
const API_PREFIX = process.env.API_PREFIX || '/api/v1'; 

// --- Основные Middleware ---
app.use(cors()); 
app.use(helmet()); 
app.use(express.json()); 
app.use(morgan("dev")); 
app.use(passport.initialize()); 
configurePassport(passport); 

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
app.use(`${API_PREFIX}/cabinet-components`, cabinetComponentRoutes);
app.use(`${API_PREFIX}/component-services`, componentServiceRoutes);
app.use(`${API_PREFIX}/ip-protection`, ipProtectionRoutes); // Оставил единственное число
app.use(`${API_PREFIX}/manufacturers`, manufacturerRoutes);
app.use(`${API_PREFIX}/materials`, materialRoutes);
app.use(`${API_PREFIX}/modules`, moduleRoutes);
app.use(`${API_PREFIX}/screen-types`, screenTypeRoutes); 
// --- 👇 Добавляем подключения для новых роутов 👇 ---
app.use(`${API_PREFIX}/locations`, locationRoutes); 
app.use(`${API_PREFIX}/cabinet-placements`, cabinetPlacementRoutes); 
app.use(`${API_PREFIX}/pitches`, pitchRoutes); 
app.use(`${API_PREFIX}/pitch-types`, pitchTypeRoutes); 
app.use(`${API_PREFIX}/refresh-rates`, refreshRateRoutes); 
app.use(`${API_PREFIX}/brightness-values`, brightnessRoutes); 
app.use(`${API_PREFIX}/screen-type-locations`, screenTypeLocationRoutes); 
app.use(`${API_PREFIX}/screen-type-pitches`, screenTypePitchRoutes); 
app.use(`${API_PREFIX}/location-materials`, locationMaterialRoutes); 
app.use(`${API_PREFIX}/location-pitches`, locationPitchRoutes); 
app.use(`${API_PREFIX}/location-cabinets`, locationCabinetRoutes); 
app.use(`${API_PREFIX}/material-cabinets`, materialCabinetRoutes); 
app.use(`${API_PREFIX}/cabinet-placement-cabinets`, cabinetPlacementCabinetRoutes); 
app.use(`${API_PREFIX}/pitch-type-pitches`, pitchTypePitchRoutes); 
// --- Конец добавленных подключений ---
// if (currencyRoutes) { app.use(`${API_PREFIX}/currencies', currencyRoutes); } 

// --- Обработка ошибок ---
// Middleware для обработки не найденных роутов (404) 
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Маршрут не найден - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Основной обработчик ошибок 
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}\n${err.stack}`);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// --- Запуск Сервера и Корректное Завершение ---
const PORT = process.env.PORT || 5000;
const server = http.createServer(app).listen(PORT, () => {
  console.log(`🚀 Backend server started successfully.`);
  console.log(`   Listening on: http://localhost:${PORT}`);
  console.log(`   API Root: http://localhost:${PORT}${API_PREFIX}`);
});

const gracefulShutdown = async (signal: string) => { /* ... как раньше ... */ };
process.on('SIGINT', () => gracefulShutdown('SIGINT')); 
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (error, origin) => { /* ... как раньше ... */ });
process.on('unhandledRejection', (reason, promise) => { /* ... как раньше ... */ });