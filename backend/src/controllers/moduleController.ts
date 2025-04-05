// src/controllers/moduleController.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/asyncHandler";
import { idParamSchema } from "../validators/commonValidators";
import {
  createModuleSchema,
  updateModuleSchema,
} from "../validators/moduleValidators";
import { Decimal } from "@prisma/client/runtime/library";

// --- Хелпер для проверки существования связанных сущностей ---
// Возвращает null, если все ОК, или объект ошибки для next()
const checkRelatedEntities = async (
    data: { manufacturerCode?: string | null, screenTypeId?: number, pixelCode?: string },
    operation: 'create' | 'update'
) => {
    // Проверяем ScreenType (обязателен при создании, если передан при обновлении)
    if (data.screenTypeId !== undefined) {
        const screenTypeExists = await prisma.screenType.findUnique({ where: { id: data.screenTypeId }, select: {id: true} });
        if (!screenTypeExists) {
            return new Error(`Тип экрана (ScreenType) с ID ${data.screenTypeId} не найден.`);
        }
    } else if (operation === 'create') {
         return new Error(`screenTypeId обязателен при создании модуля.`); // На всякий случай, валидатор должен это ловить
    }

    // Проверяем PixelStepDefinition (обязателен при создании, если передан при обновлении)
    if (data.pixelCode !== undefined) {
        const stepDefinitionExists = await prisma.pixelStepDefinition.findUnique({ where: { code: data.pixelCode }, select: {id: true} });
        if (!stepDefinitionExists) {
            return new Error(`Определение шага пикселя (PixelStepDefinition) с кодом '${data.pixelCode}' не найдено.`);
        }
    } else if (operation === 'create') {
         return new Error(`pixelCode обязателен при создании модуля.`); // На всякий случай
    }

    // Проверяем Manufacturer (необязателен, но если передан - должен существовать)
    if (data.manufacturerCode !== undefined && data.manufacturerCode !== null) { // Проверяем, если передан не null
        const manufacturerExists = await prisma.manufacturer.findUnique({ where: { code: data.manufacturerCode }, select: {id: true} });
        if (!manufacturerExists) {
            return new Error(`Производитель (Manufacturer) с кодом '${data.manufacturerCode}' не найден.`);
        }
    }

    return null; // Все связанные сущности найдены
}

// 📌 Получение всех модулей
export const getModules = asyncHandler(async (req: Request, res: Response) => {
  const modules = await prisma.module.findMany({
    orderBy: { sku: "asc" }, // Сортируем по SKU
    include: { // Включаем связанные данные для контекста
        manufacturer: { select: { code: true, name: true } },
        screenType: { select: { id: true, name: true } },
        stepDefinition: { select: { code: true, stepValue: true } },
    }
  });
  res
    .status(200)
    .json({ message: "Список модулей", data: modules });
});

// 📌 Получение одного модуля по ID
export const getModuleById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    try {
      const module = await prisma.module.findUniqueOrThrow({
        where: { id },
        include: { // Включаем связанные данные
            manufacturer: { select: { code: true, name: true } },
            screenType: { select: { id: true, name: true } },
            stepDefinition: { select: { code: true, stepValue: true } },
        }
      });
      res.status(200).json({ message: "Модуль найден", data: module });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        res.status(404);
        return next(new Error(`Модуль с ID ${id} не найден.`));
      }
      return next(e);
    }
  }
);

// 📌 Создание нового модуля
export const createModule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = createModuleSchema.parse(req.body);
    const {
        sku, type, moduleWidth, moduleHeight, moduleFrequency, moduleBrightness, priceUsd,
        manufacturerCode, screenTypeId, pixelCode
    } = validatedData;

    // 1. Проверяем существование связанных сущностей
    const entityCheckError = await checkRelatedEntities({ manufacturerCode, screenTypeId, pixelCode }, 'create');
    if (entityCheckError) {
        res.status(400); // Bad Request, т.к. переданы невалидные ID/коды
        return next(entityCheckError);
    }

    // 2. Проверяем уникальность SKU
    const existingModule = await prisma.module.findUnique({
      where: { sku: sku },
      select: { id: true },
    });
    if (existingModule) {
      res.status(409); // Conflict
      return next(new Error(`Модуль с SKU '${sku}' уже существует.`));
    }

    // 3. Создаем модуль
    try {
      const newModule = await prisma.module.create({
        data: {
          sku, type, moduleWidth, moduleHeight, moduleFrequency, moduleBrightness,
          priceUsd: priceUsd !== undefined && priceUsd !== null ? new Prisma.Decimal(priceUsd) : null,
          // Связи через connect
          screenType: { connect: { id: screenTypeId } },
          stepDefinition: { connect: { code: pixelCode } },
          // Необязательная связь с производителем
          ...(manufacturerCode && { manufacturer: { connect: { code: manufacturerCode } } })
        },
        include: { // Включаем связанные данные в ответ
            manufacturer: { select: { code: true, name: true } },
            screenType: { select: { id: true, name: true } },
            stepDefinition: { select: { code: true, stepValue: true } },
        }
      });
      res
        .status(201)
        .json({ message: "Модуль успешно создан", data: newModule });
    } catch (e: any) {
      // Обработка ошибки уникальности SKU (P2002)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        res.status(409);
        return next(new Error(`Ошибка уникальности при создании модуля. SKU '${sku}' должен быть уникальным.`));
      }
      // Обработка ошибок FK (P2003) - маловероятно после проверок, но возможно
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
         console.error("FK constraint error during module creation:", e);
         res.status(400);
         return next(new Error(`Ошибка связи с ${e.meta?.field_name ?? 'связанной таблицей'} при создании модуля.`));
      }
      return next(e);
    }
  }
);

// 📌 Обновление модуля
export const updateModule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateModuleSchema.parse(req.body);
    const {
        sku, type, moduleWidth, moduleHeight, moduleFrequency, moduleBrightness, priceUsd,
        manufacturerCode, screenTypeId, pixelCode
    } = validatedData; // Все поля здесь опциональны

    // Проверка на пустое тело сделана валидатором .refine()

    // 1. Проверяем существование связанных сущностей, ЕСЛИ они переданы для обновления
    const entityCheckError = await checkRelatedEntities({ manufacturerCode, screenTypeId, pixelCode }, 'update');
     if (entityCheckError) {
         res.status(400); // Bad Request
         return next(entityCheckError);
     }

    // 2. Если обновляется SKU, проверяем его уникальность
    if (sku) {
      const existingModule = await prisma.module.findUnique({
        where: { sku: sku },
        select: { id: true },
      });
      // Если модуль с таким SKU найден и это НЕ текущий обновляемый модуль
      if (existingModule && existingModule.id !== id) {
        res.status(409); // Conflict
        return next(new Error(`Модуль с SKU '${sku}' уже существует.`));
      }
    }

    // 3. Собираем данные для обновления
    const dataToUpdate: Prisma.ModuleUpdateInput = {};
    // Добавляем простые поля, если они переданы
    if (sku !== undefined) dataToUpdate.sku = sku;
    if (type !== undefined) dataToUpdate.type = type;
    if (moduleWidth !== undefined) dataToUpdate.moduleWidth = moduleWidth;
    if (moduleHeight !== undefined) dataToUpdate.moduleHeight = moduleHeight;
    if (moduleFrequency !== undefined) dataToUpdate.moduleFrequency = moduleFrequency;
    if (moduleBrightness !== undefined) dataToUpdate.moduleBrightness = moduleBrightness;
    if (priceUsd !== undefined) dataToUpdate.priceUsd = priceUsd !== null ? new Decimal(priceUsd) : null;

    // Обновляем связи, если переданы ID/коды
    if (screenTypeId !== undefined) dataToUpdate.screenType = { connect: { id: screenTypeId } };
    if (pixelCode !== undefined) dataToUpdate.stepDefinition = { connect: { code: pixelCode } };
    // Обновление необязательной связи Manufacturer: connect, disconnect или ничего
    if (manufacturerCode !== undefined) {
        if (manufacturerCode === null) { // Явно передан null для отсоединения
             dataToUpdate.manufacturer = { disconnect: true };
        } else { // Передан новый код для соединения
             dataToUpdate.manufacturer = { connect: { code: manufacturerCode } };
        }
    }

    // 4. Обновляем модуль
    try {
      const updatedModule = await prisma.module.update({
        where: { id },
        data: dataToUpdate,
        include: { // Включаем связанные данные в ответ
            manufacturer: { select: { code: true, name: true } },
            screenType: { select: { id: true, name: true } },
            stepDefinition: { select: { code: true, stepValue: true } },
        }
      });
      res
        .status(200)
        .json({ message: "Модуль успешно обновлен", data: updatedModule });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") { // RecordNotFound
          res.status(404);
          return next(new Error(`Модуль с ID ${id} не найден.`));
        } else if (e.code === "P2002") { // Unique constraint violation (для SKU)
          res.status(409);
          return next(
            new Error(`Ошибка уникальности при обновлении модуля ID ${id}. SKU '${sku}' должен быть уникальным.`)
          );
        } else if (e.code === "P2003") { // Foreign key constraint failed
            console.error("FK constraint error during module update:", e);
            res.status(400);
            // Определить, какая связь вызвала ошибку, сложнее без парсинга e.meta
            return next(new Error(`Ошибка связи при обновлении модуля. Убедитесь, что указанные ScreenType, PixelStepDefinition и Manufacturer существуют.`));
        }
      }
      return next(e);
    }
  }
);

// 📌 Удаление модуля
export const deleteModule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);

    try {
      // 1. Проверка существования модуля (для правильного 404)
      const moduleExists = await prisma.module.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!moduleExists) {
        res.status(404);
        return next(new Error(`Модуль с ID ${id} не найден.`));
      }

      // 2. Проверка зависимостей (Зависят ли другие сущности от этого модуля?)
      // В текущей схеме нет моделей, которые напрямую ссылались бы на Module.id
      // как на внешний ключ с ограничением Restrict. Поэтому прямых блокировок
      // при удалении быть не должно. Если появятся - добавить проверку здесь.
      /*
      const relatedEntitiesCount = await prisma.someOtherModel.count({ where: { moduleId: id } });
      if (relatedEntitiesCount > 0) {
          res.status(409);
          return next(new Error(`Невозможно удалить модуль ID ${id}, так как он используется в ${relatedEntitiesCount} других записях.`));
      }
      */

      // 3. Удаление модуля
      await prisma.module.delete({ where: { id } });
      res.status(200).json({ message: "Модуль успешно удален" });

    } catch (e: any) {
      console.error(`Ошибка при удалении модуля ID ${id}:`, e);
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
          res.status(404);
          return next(new Error(`Модуль с ID ${id} не найден (ошибка при удалении).`));
      }
      // P2003 не ожидается, если нет FK с Restrict, указывающих на Module
      return next(e);
    }
  }
);