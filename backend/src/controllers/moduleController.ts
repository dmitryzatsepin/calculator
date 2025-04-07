// src/controllers/moduleController.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client"; // Уберем лишнее позже
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler'; // Оставляем
// import { idParamSchema } from '../validators/commonValidators'; // Пока не нужно
// import { createModuleSchema, updateModuleSchema } from '../validators/moduleValidators'; // Пока не нужно
import { Decimal } from "@prisma/client/runtime/library"; // Оставляем, т.к. Decimal используется в запросе

// --- Хелпер для проверки существования связанных сущностей ---
// (Закомментируем, так как используется только в create/update)
/*
const checkRelatedEntities = async (
    data: { manufacturerCode?: string | null, locationCode?: string | null, pitchCode?: string | null, refreshRateValue?: number | null, brightnessValue?: number | null },
    operation: 'create' | 'update'
) => {
    // Проверяем Location (если передан или обязателен)
    if (data.locationCode !== undefined && data.locationCode !== null) {
        const locationExists = await prisma.location.findUnique({ where: { code: data.locationCode }, select: {id: true} });
        if (!locationExists) {
            return new Error(`Локация (Location) с кодом '${data.locationCode}' не найдена.`);
        }
    } else if (operation === 'create' && !data.locationCode ) { // Если связь обязательна при создании
         // return new Error(`locationCode обязателен при создании модуля.`);
    }

    // Проверяем Pitch (обязателен всегда)
    if (data.pitchCode !== undefined) {
        const pitchExists = await prisma.pitch.findUnique({ where: { code: data.pitchCode }, select: {id: true} });
        if (!pitchExists) {
            return new Error(`Шаг пикселя (Pitch) с кодом '${data.pitchCode}' не найден.`);
        }
    } else if (operation === 'create') {
         return new Error(`pitchCode обязателен при создании модуля.`);
    }

    // Проверяем Manufacturer (необязателен)
    if (data.manufacturerCode !== undefined && data.manufacturerCode !== null) {
        const manufacturerExists = await prisma.manufacturer.findUnique({ where: { code: data.manufacturerCode }, select: {id: true} });
        if (!manufacturerExists) {
            return new Error(`Производитель (Manufacturer) с кодом '${data.manufacturerCode}' не найден.`);
        }
    }

    // Проверяем RefreshRate (необязателен)
    if (data.refreshRateValue !== undefined && data.refreshRateValue !== null) {
        const refreshRateExists = await prisma.refreshRate.findUnique({ where: { value: data.refreshRateValue }, select: {value: true} });
        if (!refreshRateExists) {
            return new Error(`Частота обновления (RefreshRate) со значением '${data.refreshRateValue}' не найдена.`);
        }
    }
    
    // Проверяем Brightness (необязателен)
    if (data.brightnessValue !== undefined && data.brightnessValue !== null) {
        const brightnessExists = await prisma.brightness.findUnique({ where: { value: data.brightnessValue }, select: {value: true} });
        if (!brightnessExists) {
            return new Error(`Яркость (Brightness) со значением '${data.brightnessValue}' не найдена.`);
        }
    }

    return null; // Все связанные сущности найдены
}
*/

// 📌 Получение всех модулей (Переименовано и обновлен include)
export const getAllModules = asyncHandler(async (req: Request, res: Response) => {
  const modules = await prisma.module.findMany({
    orderBy: { sku: "asc" }, 
    include: { // Включаем актуальные связи
        manufacturer: { select: { code: true, name: true } }, // Manufacturer (опционально)
        location: { select: { code: true, name: true } },     // Location (опционально/обязательно?)
        pitch: { select: { code: true, pitchValue: true, moduleWidth: true, moduleHeight: true } }, // Pitch (обязательно)
        refreshRate: { select: { value: true } },             // RefreshRate (опционально)
        brightness: { select: { value: true } },              // Brightness (опционально)
    }
  });

  // Преобразуем Decimal в строки
  const responseData = modules.map(m => ({
      ...m,
      priceUsd: m.priceUsd?.toString() ?? null,
      pitch: {
          ...m.pitch,
          pitchValue: m.pitch.pitchValue.toString()
      }
  }));

  // Возвращаем чистый массив
  res.status(200).json(responseData);
});

// -------------------------------------------------------------------- //
// --- ВЕСЬ КОД НИЖЕ ЗАКОММЕНТИРОВАН (getModuleById, create, update, delete) --- //
// -------------------------------------------------------------------- //

/*
// 📌 Получение одного модуля по ID (Нуждается в обновлении include)
export const getModuleById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // ... (код требует обновления include как в getAllModules и преобразования Decimal) ...
    res.status(501).json({ message: "Получение модуля по ID еще не реализовано" });
  }
);
*/

/*
// 📌 Создание нового модуля (ТРЕБУЕТ ПОЛНОЙ ПЕРЕРАБОТКИ)
export const createModule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Переписать под новую схему
    // 1. Обновить валидатор createModuleSchema
    // 2. Использовать locationCode, pitchCode, manufacturerCode, refreshRateValue, brightnessValue
    // 3. Обновить checkRelatedEntities или выполнять проверки здесь
    // 4. Обновить prisma.module.create с новыми связями
    res.status(501).json({ message: "Создание модуля еще не реализовано" });
  }
);
*/

/*
// 📌 Обновление модуля (ТРЕБУЕТ ПОЛНОЙ ПЕРЕРАБОТКИ)
export const updateModule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Переписать под новую схему
    // 1. Обновить валидатор updateModuleSchema
    // 2. Обновить checkRelatedEntities или выполнять проверки здесь
    // 3. Обновить логику dataToUpdate для новых полей и связей
    // 4. Обновить prisma.module.update
     res.status(501).json({ message: "Обновление модуля еще не реализовано" });
  }
);
*/

/*
// 📌 Удаление модуля (Проверить и раскомментировать, если нужно)
export const deleteModule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // ... (Логика удаления в целом должна работать, т.к. на Module никто не ссылается с Restrict) ...
     res.status(501).json({ message: "Удаление модуля еще не реализовано" });
  }
);
*/