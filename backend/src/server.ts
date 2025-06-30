// backend/src/server.ts
import express, { Request, Response, NextFunction, Application } from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import expressPlayground from "graphql-playground-middleware-express";

// --- GraphQL, Prisma и Зависимости для Контекста ---
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { schema } from "./graphql/schema";
import { prisma } from "./lib/prisma";
import { GraphQLContext, Services } from "./graphql/builder"; // <-- Импортируем Services
import { validateSchema } from "graphql";
import jwt from 'jsonwebtoken';
import { User as PrismaUser } from '../prisma/generated/client';

// --- Импорты всех сервисов ---
import { AuthService } from './services/authService';
import { CabinetService } from './services/cabinetService';
import { ItemService } from './services/itemService';
import { LocationService } from './services/locationService';
import { MaterialService } from './services/materialService';
import { ModuleService } from './services/moduleService';
import { OptionService } from './services/optionService';
import { PitchService } from './services/pitchService';
import { PriceService } from './services/priceService';
import { RefreshRateService } from './services/refreshRateService';
import { ScreenTypeService } from './services/screenTypeService';
import { SensorService } from './services/sensorService';
import { BrightnessService } from './services/brightnessService';
import { ControlTypeService } from './services/controlTypeService';
import { IpProtectionService } from './services/ipProtectionService';
import { ItemCategoryService } from './services/itemCategoryService';
import { ItemSubcategoryService } from './services/itemSubcategoryService';
import { ManufacturerService } from './services/manufacturerService';
import { PlacementService } from './services/placementService';
import { SupplierService } from './services/supplierService';
import { CabinetItemComponentService } from './services/cabinetItemComponentService';
import { CabinetPriceService } from './services/cabinetPriceService';
import { CabinetSizeService } from './services/cabinetSizeService';


// --- Инициализация ---
dotenv.config();
const app: Application = express();
let httpServer: http.Server;

const GRAPHQL_PATH = '/api/v1';
const PLAYGROUND_PATH = '/playground';
const HEALTHCHECK_PATH = '/health';


async function startServer() {
  console.log("🚀 Initializing server...");

  // 1. Проверка подключения к Prisma
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected successfully");
  } catch (prismaError) {
    console.error("❌ Prisma connection error:", prismaError);
    process.exit(1);
  }

  // 2. Валидация схемы GraphQL
  try {
    const schemaValidationErrors = validateSchema(schema);
    if (schemaValidationErrors.length > 0) {
      console.error("❌ GraphQL schema validation errors:", schemaValidationErrors);
      process.exit(1);
    }
    console.log("✅ GraphQL schema validated successfully");
  } catch (schemaError) {
    console.error("❌ GraphQL schema validation failed:", schemaError);
    process.exit(1);
  }

  // 3. Создание HTTP сервера
  httpServer = http.createServer(app);

  // 4. Настройка Apollo Server
  console.log("🚀 Setting up Apollo Server...");
  const apolloServer = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
  });
  await apolloServer.start();
  console.log("✅ Apollo Server started successfully");

  // 5. Middleware
  app.use(cors({/* ... */}));
  app.use(morgan("dev")); 
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  console.log('✅ Basic middleware applied');

  // 6. GraphQL Endpoint
  app.use(
    GRAPHQL_PATH,
    cors<cors.CorsRequest>(),
    express.json({ limit: '10mb' }),
    expressMiddleware(apolloServer, {
      context: async ({ req }): Promise<GraphQLContext> => {
        let currentUser: PrismaUser | null = null;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; [key: string]: any };
            if (decoded && typeof decoded.id === 'number') {
              currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
              if (!currentUser) console.warn(`[AUTH CONTEXT] User ID ${decoded.id} from token not found in DB.`);
              else console.log(`[AUTH CONTEXT] Authenticated user: ${currentUser.email}`);
            }
          } catch (err) {
            console.warn(`[AUTH CONTEXT] JWT verification error: ${(err as Error).message}`);
            currentUser = null;
          }
        }
        
        // --- ИНИЦИАЛИЗАЦИЯ СЕРВИСОВ ---
        // Создаем экземпляры всех сервисов один раз на каждый запрос
        const services: Services = {
          authService: new AuthService(prisma),
          cabinetService: new CabinetService(prisma),
          itemService: new ItemService(prisma),
          locationService: new LocationService(prisma),
          materialService: new MaterialService(prisma),
          moduleService: new ModuleService(prisma),
          optionService: new OptionService(prisma),
          pitchService: new PitchService(prisma),
          priceService: new PriceService(prisma),
          refreshRateService: new RefreshRateService(prisma),
          screenTypeService: new ScreenTypeService(prisma),
          sensorService: new SensorService(prisma),
          brightnessService: new BrightnessService(prisma),
          controlTypeService: new ControlTypeService(prisma),
          ipProtectionService: new IpProtectionService(prisma),
          itemCategoryService: new ItemCategoryService(prisma),
          itemSubcategoryService: new ItemSubcategoryService(prisma),
          manufacturerService: new ManufacturerService(prisma),
          placementService: new PlacementService(prisma),
          supplierService: new SupplierService(prisma),
          cabinetItemComponentService: new CabinetItemComponentService(prisma),
          cabinetPriceService: new CabinetPriceService(prisma),
          cabinetSizeService: new CabinetSizeService(prisma),
        };

        // Возвращаем расширенный объект контекста
        return {
          prisma,
          currentUser,
          auth: authHeader || null,
          services,
        };
      },
    })
  );
  console.log(`✅ GraphQL endpoint configured at ${GRAPHQL_PATH}`);

  // 7. GraphQL Playground Endpoint
  app.get(PLAYGROUND_PATH, expressPlayground({ endpoint: GRAPHQL_PATH }));
  console.log(`✅ GraphQL Playground available at ${PLAYGROUND_PATH}`);
  
  app.use(helmet());
  console.log("✅ Helmet applied globally (excluding /api/v1, /playground)");

  // 8. Healthcheck и корневой роут
  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      status: "OK",
      message: "API is running",
      endpoints: {
        graphql: GRAPHQL_PATH,
        playground: PLAYGROUND_PATH,
        healthcheck: HEALTHCHECK_PATH,
      },
    });
  });
  app.get(HEALTHCHECK_PATH, async (req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: "healthy",
        database: "connected",
        uptime: process.uptime(),
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        uptime: process.uptime(),
      });
    }
  });
  console.log("✅ Other routes registered");

  // 9. Обработка ошибок
  console.log("🚀 Registering error handlers...");
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.warn(`[404 HANDLER] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: "Not Found" });
  });
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    console.error(`[500 HANDLER] Error for ${req.method} ${req.path}`, err);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  });
  console.log("✅ Error handlers registered.");

  // 10. Запуск сервера
  const PORT = process.env.PORT || 5000;
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  console.log(`
    🚀 Server ready at: http://localhost:${PORT}
    🎯 GraphQL Playground: http://localhost:${PORT}${PLAYGROUND_PATH}
    ⚡ GraphQL endpoint: http://localhost:${PORT}${GRAPHQL_PATH}
    ❤️  Healthcheck: http://localhost:${PORT}${HEALTHCHECK_PATH}
  `);
}

// --- Graceful shutdown (без изменений) ---
async function gracefulShutdown(signal: string) {
  console.log(`\n🔌 Received ${signal}. Shutting down gracefully...`);
  try {
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("HTTP close timeout")), 10000);
        httpServer.close((err) => { clearTimeout(t); if (err) reject(err); else resolve(); });
      });
      console.log("✅ HTTP server closed");
    }
    await prisma.$disconnect();
    console.log("✅ Prisma disconnected");
    process.exit(0);
  } catch (error) {
    console.error("❌ Shutdown failed:", error);
    process.exit(1);
  } finally {
    setTimeout(() => process.exit(1), 15000).unref();
  }
}

// --- Обработчики сигналов ---
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
signals.forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  gracefulShutdown("uncaughtException").catch(() => {});
  setTimeout(() => process.exit(1), 5000).unref();
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection").catch(() => {});
  setTimeout(() => process.exit(1), 5000).unref();
});

// --- Запуск ---
startServer().catch((error) => {
  console.error("💥 Failed to start server:", error);
  process.exit(1);
});