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
//import currencyRoutes from './routes/currencyRoutes';

// --- Инициализация ---
dotenv.config(); 
const app: Application = express(); 
const API_PREFIX = process.env.API_PREFIX || '/api/v1'; 
//console.log('[DEBUG] App created.'); // Лог 1

// --- Основные Middleware ---
try {
    app.use(cors()); 
    app.use(helmet()); 
    app.use(express.json()); 
    app.use(morgan("dev")); 
    //console.log('[DEBUG] Basic middleware applied.'); // Лог 2
    app.use(passport.initialize()); 
    //console.log('[DEBUG] Passport initialized.'); // Лог 3
    configurePassport(passport); // Конфигурируем стратегии Passport
    //console.log('[DEBUG] Passport configured.'); // Лог 4
} catch (middlewareError: any) {
    console.error('[DEBUG] ОШИБКА ПРИ НАСТРОЙКЕ БАЗОВЫХ MIDDLEWARE ИЛИ PASSPORT:', middlewareError);
    process.exit(1); // Выходим, если основная настройка не удалась
}

// --- Регистрация Маршрутов API ---
//console.log(`[DEBUG] Registering routes with prefix: ${API_PREFIX}`);
try {
    app.get(API_PREFIX, (req: Request, res: Response) => {
        res.status(200).json({ message: 'Calculator API is running!' });
    });

    // --- Подключение всех роутов ---
    // Добавим console.log перед каждым app.use для роута
    //console.log('[DEBUG] Registering: /healthcheck');
    app.use(`${API_PREFIX}/healthcheck`, healthcheckRoute);
    //console.log('[DEBUG] Registering: /auth');
    app.use(`${API_PREFIX}/auth`, authRoutes);
    //console.log('[DEBUG] Registering: /users');
    app.use(`${API_PREFIX}/users`, userRoutes); 
    //console.log('[DEBUG] Registering: /cabinets');
    app.use(`${API_PREFIX}/cabinets`, cabinetRoutes);
    //console.log('[DEBUG] Registering: /cabinet-components');
    app.use(`${API_PREFIX}/cabinet-components`, cabinetComponentRoutes);
    //console.log('[DEBUG] Registering: /component-services');
    app.use(`${API_PREFIX}/component-services`, componentServiceRoutes);
    //console.log('[DEBUG] Registering: /ip-protection');
    app.use(`${API_PREFIX}/ip-protection`, ipProtectionRoutes); 
    //console.log('[DEBUG] Registering: /manufacturers');
    app.use(`${API_PREFIX}/manufacturers`, manufacturerRoutes);
    //console.log('[DEBUG] Registering: /materials');
    app.use(`${API_PREFIX}/materials`, materialRoutes);
    //console.log('[DEBUG] Registering: /modules');
    app.use(`${API_PREFIX}/modules`, moduleRoutes);
    //console.log('[DEBUG] Registering: /screen-types');
    app.use(`${API_PREFIX}/screen-types`, screenTypeRoutes); 
    //console.log('[DEBUG] Registering: /locations');
    app.use(`${API_PREFIX}/locations`, locationRoutes); 
    //console.log('[DEBUG] Registering: /cabinet-placements');
    app.use(`${API_PREFIX}/cabinet-placements`, cabinetPlacementRoutes); 
    //console.log('[DEBUG] Registering: /pitches');
    app.use(`${API_PREFIX}/pitches`, pitchRoutes); 
    //console.log('[DEBUG] Registering: /pitch-types');
    app.use(`${API_PREFIX}/pitch-types`, pitchTypeRoutes); 
    //console.log('[DEBUG] Registering: /refresh-rates');
    app.use(`${API_PREFIX}/refresh-rates`, refreshRateRoutes); 
    //console.log('[DEBUG] Registering: /brightness-values');
    app.use(`${API_PREFIX}/brightness-values`, brightnessRoutes); 
    //console.log('[DEBUG] Registering: /screen-type-locations');
    app.use(`${API_PREFIX}/screen-type-locations`, screenTypeLocationRoutes); 
    //console.log('[DEBUG] Registering: /screen-type-pitches');
    app.use(`${API_PREFIX}/screen-type-pitches`, screenTypePitchRoutes); 
    //console.log('[DEBUG] Registering: /location-materials');
    app.use(`${API_PREFIX}/location-materials`, locationMaterialRoutes); 
    //console.log('[DEBUG] Registering: /location-pitches');
    app.use(`${API_PREFIX}/location-pitches`, locationPitchRoutes); 
    //console.log('[DEBUG] Registering: /location-cabinets');
    app.use(`${API_PREFIX}/location-cabinets`, locationCabinetRoutes); 
    //console.log('[DEBUG] Registering: /material-cabinets');
    app.use(`${API_PREFIX}/material-cabinets`, materialCabinetRoutes); 
    //console.log('[DEBUG] Registering: /cabinet-placement-cabinets');
    app.use(`${API_PREFIX}/cabinet-placement-cabinets`, cabinetPlacementCabinetRoutes); 
    //console.log('[DEBUG] Registering: /pitch-type-pitches');
    app.use(`${API_PREFIX}/pitch-type-pitches`, pitchTypePitchRoutes); 
    // if (currencyRoutes) { app.use(`${API_PREFIX}/currencies', currencyRoutes); } 
    //console.log('[DEBUG] Routes registered successfully.'); // Лог 5 (успешная регистрация)
} catch (routeError: any) {
    console.error('[DEBUG] ОШИБКА ПРИ РЕГИСТРАЦИИ РОУТОВ:', routeError); 
    process.exit(1);
}

// --- Обработка ошибок ---
try {
    // Middleware для обработки не найденных роутов (404) 
    app.use((req: Request, res: Response, next: NextFunction) => {
        const error = new Error(`Маршрут не найден - ${req.originalUrl}`);
        res.status(404);
        next(error); // Передаем ошибку дальше
    });

    // Основной обработчик ошибок 
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(`[ERROR HANDLER] ${err.message}\n${err.stack}`); // Изменим префикс лога
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Если статус не был изменен ранее (например, в 404), ставим 500
        res.status(statusCode);
        res.json({
            message: statusCode === 500 ? "Internal Server Error" : err.message, // Не показываем детали для 500
            stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        });
    });
    //console.log('[DEBUG] Error handlers registered.'); // Лог 6
} catch (errorHandlerError: any) {
     console.error('[DEBUG] ОШИБКА ПРИ РЕГИСТРАЦИИ ОБРАБОТЧИКОВ ОШИБОК:', errorHandlerError);
     process.exit(1);
}


// --- Запуск Сервера и Корректное Завершение ---
const PORT = process.env.PORT || 5000;
let server: http.Server; // Объявляем переменную server здесь
try {
    //console.log(`[DEBUG] Attempting to listen on port ${PORT}...`); // Лог 7
    server = http.createServer(app).listen(PORT, () => {
        //console.log('[DEBUG] Server.listen callback executed.'); // Лог 8
        console.log(`🚀 Backend server started successfully.`);
        console.log(`   Listening on: http://localhost:${PORT}`);
        console.log(`   API Root: http://localhost:${PORT}${API_PREFIX}`);
    });

    // Обработчик ошибок самого http сервера (например, EADDRINUSE)
    server.on('error', (error: NodeJS.ErrnoException) => { 
       console.error('[DEBUG] HTTP Server Error:', error);
       if (error.syscall !== 'listen') { throw error; } // Перебрасываем, если не ошибка listen
       switch (error.code) {
           case 'EACCES':
               console.error(`[FATAL] Port ${PORT} requires elevated privileges`);
               process.exit(1);
               break;
           case 'EADDRINUSE':
               console.error(`[FATAL] Port ${PORT} is already in use`);
               process.exit(1);
               break;
           default:
               throw error;
       }
    });
    //console.log('[DEBUG] Server.listen called, waiting for callback or error...'); // Лог 9

} catch (listenError: any) {
    console.error('[DEBUG] ОШИБКА ПРИ ВЫЗОВЕ server.listen:', listenError); 
    process.exit(1);
}

// Функция корректного завершения
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🔌 Received ${signal}. Starting graceful shutdown...`);
  console.log("   Closing HTTP server...");
  // Убедимся, что server был инициализирован перед вызовом close
  if (server) { 
      server.close(async (err) => {
          if (err) {
              console.error('   [Error] closing server:', err);
              process.exit(1);
          }
          console.log('   ✅ HTTP server closed.');
          try {
              console.log('   Disconnecting Prisma...');
              await prisma.$disconnect(); 
              console.log('   ✅ Prisma connection closed.');
              process.exit(0); 
          } catch (dbErr) {
              console.error('   [Error] disconnecting Prisma:', dbErr);
              process.exit(1);
          }
      });
  } else {
      console.warn("   Server was not initialized, exiting directly.");
      process.exit(0);
  }

  setTimeout(() => {
    console.error('   [Timeout] Could not close connections in time, forcing shutdown.');
    process.exit(1);
  }, 15000); 
};

// Обработчики сигналов завершения
process.on('SIGINT', () => gracefulShutdown('SIGINT')); 
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); 

// Обработка критических ошибок процесса
process.on('uncaughtException', (error, origin) => {
  console.error(`\n💥 UNCAUGHT EXCEPTION! Origin: ${origin}`);
  console.error(error);
  console.error('   Shutting down application...');
  // Принудительно завершаем, так как состояние непредсказуемо
  process.exit(1); 
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 UNHANDLED REJECTION!');
  console.error('   Reason:', reason);
  // console.error('   Promise:', promise); // Promise может быть большим, логируем по необходимости
  console.error('   Shutting down application...');
  if (server) {
      server.close(() => { process.exit(1); });
      setTimeout(() => process.exit(1), 2000); 
  } else {
      process.exit(1);
  }
});