// src/controllers/dataController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// --- User ---
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { // Исключаем пароль
        id: true, email: true, name: true, role: true, createdAt: true,
      }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    res.status(500).json({ message: "Ошибка сервера при получении пользователей" });
  }
};

// --- Material ---
export const getAllMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.material.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения материалов:", error);
    res.status(500).json({ message: "Ошибка сервера при получении материалов" });
  }
};

// --- Option ---
export const getAllOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.option.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения опций:", error);
    res.status(500).json({ message: "Ошибка сервера при получении опций" });
  }
};

// --- Manufacturer ---
export const getAllManufacturers = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.manufacturer.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения производителей:", error);
    res.status(500).json({ message: "Ошибка сервера при получении производителей" });
  }
};

// --- ScreenType ---
export const getAllScreenTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.screenType.findMany({
      // Можно включить связанные справочники, если нужно
      // include: { materials: { include: { material: true } }, options: { include: { option: true } } }
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения типов экранов:", error);
    res.status(500).json({ message: "Ошибка сервера при получении типов экранов" });
  }
};

// --- IpProtection ---
export const getAllIpProtections = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.ipProtection.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения IP защит:", error);
    res.status(500).json({ message: "Ошибка сервера при получении IP защит" });
  }
};

// --- ComponentService ---
export const getAllComponentServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.componentService.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения компонентов/сервисов:", error);
    res.status(500).json({ message: "Ошибка сервера при получении компонентов/сервисов" });
  }
};

// --- PixelStepDefinition ---
export const getAllPixelStepDefinitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.pixelStepDefinition.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения определений шага пикселя:", error);
    res.status(500).json({ message: "Ошибка сервера при получении определений шага пикселя" });
  }
};

// --- PixelType ---
export const getAllPixelTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.pixelType.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения типов пикселей:", error);
    res.status(500).json({ message: "Ошибка сервера при получении типов пикселей" });
  }
};

// --- PixelOption ---
export const getAllPixelOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.pixelOption.findMany({
        // Можно включить связанные данные, если нужно
        // include: { stepDefinition: true, pixelType: true, screenType: true }
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения опций пикселей:", error);
    res.status(500).json({ message: "Ошибка сервера при получении опций пикселей" });
  }
};

// --- Module ---
export const getAllModules = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.module.findMany({
        // Можно включить связанные данные, если нужно
        // include: { manufacturer: true, screenType: true, stepDefinition: true }
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения модулей:", error);
    res.status(500).json({ message: "Ошибка сервера при получении модулей" });
  }
};

// --- Cabinet ---
export const getAllCabinets = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.cabinet.findMany({
      // Можно включить связанные данные, если нужно
      // include: { screenType: true, materials: { include: { material: true } }, components: { include: { component: true } } }
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения кабинетов:", error);
    res.status(500).json({ message: "Ошибка сервера при получении кабинетов" });
  }
};


// --- Связующие таблицы (M-N) ---

// --- ScreenTypeMaterial ---
export const getAllScreenTypeMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.screenTypeMaterial.findMany({
      include: { screenType: true, material: true } // Обычно полезно включить связанные
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения связей ScreenType-Material:", error);
    res.status(500).json({ message: "Ошибка сервера при получении связей ScreenType-Material" });
  }
};

// --- ScreenTypeOption ---
export const getAllScreenTypeOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.screenTypeOption.findMany({
       include: { screenType: true, option: true } // Обычно полезно включить связанные
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения связей ScreenType-Option:", error);
    res.status(500).json({ message: "Ошибка сервера при получении связей ScreenType-Option" });
  }
};

// --- CabinetMaterial ---
export const getAllCabinetMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.cabinetMaterial.findMany({
       include: { cabinet: true, material: true } // Обычно полезно включить связанные
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения связей Cabinet-Material:", error);
    res.status(500).json({ message: "Ошибка сервера при получении связей Cabinet-Material" });
  }
};

// --- CabinetComponent ---
export const getAllCabinetComponents = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.cabinetComponent.findMany({
       include: { cabinet: true, component: true } // Обычно полезно включить связанные
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка получения связей Cabinet-Component:", error);
    res.status(500).json({ message: "Ошибка сервера при получении связей Cabinet-Component" });
  }
};