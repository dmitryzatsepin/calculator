// src/controllers/manufacturerController.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/asyncHandler";
import { idParamSchema } from "../validators/commonValidators"; // Для получения ID из параметра
import {
  createManufacturerSchema,
  updateManufacturerSchema,
} from "../validators/manufacturerValidators"; // Импортируем наши валидаторы

// 📌 Получение всех производителей
export const getManufacturers = asyncHandler(async (req: Request, res: Response) => {
  const manufacturers = await prisma.manufacturer.findMany({
    orderBy: { name: "asc" }, // Сортируем по имени
  });
  res
    .status(200)
    .json({ message: "Список производителей", data: manufacturers });
});

// 📌 Получение одного производителя по ID
export const getManufacturerById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params); // Валидируем и получаем ID
    try {
      const manufacturer = await prisma.manufacturer.findUniqueOrThrow({
        where: { id },
      });
      res.status(200).json({ message: "Производитель найден", data: manufacturer });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        res.status(404);
        return next(new Error(`Производитель с ID ${id} не найден.`));
      }
      return next(e);
    }
  }
);

// 📌 Создание нового производителя
export const createManufacturer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = createManufacturerSchema.parse(req.body);
    const { code, name } = validatedData;

    // Проверка уникальности 'code' перед созданием
    const existingManufacturer = await prisma.manufacturer.findUnique({
      where: { code: code },
      select: { id: true },
    });
    if (existingManufacturer) {
      res.status(409); // Conflict
      return next(
        new Error(`Производитель с кодом '${code}' уже существует.`)
      );
    }

    try {
      const newManufacturer = await prisma.manufacturer.create({
        data: {
          code: code,
          name: name,
        },
      });
      res
        .status(201)
        .json({ message: "Производитель успешно создан", data: newManufacturer });
    } catch (e: any) {
      // Обработка ошибки уникальности (P2002), если проверка выше не сработала
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        res.status(409);
        return next(
          new Error(`Ошибка уникальности при создании производителя. Код '${code}' должен быть уникальным.`)
        );
      }
      return next(e);
    }
  }
);

// 📌 Обновление производителя
export const updateManufacturer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateManufacturerSchema.parse(req.body);
    const { code, name } = validatedData; // Могут быть undefined

    // Проверка на пустое тело уже сделана валидатором .refine()

    // Если обновляется 'code', проверяем его уникальность
    if (code) {
      const existingManufacturer = await prisma.manufacturer.findUnique({
        where: { code: code },
        select: { id: true },
      });
      // Если производитель с таким кодом найден и это НЕ текущий обновляемый
      if (existingManufacturer && existingManufacturer.id !== id) {
        res.status(409); // Conflict
        return next(
          new Error(`Производитель с кодом '${code}' уже существует.`)
        );
      }
    }

    // Собираем данные для обновления (только переданные поля)
    const dataToUpdate: Prisma.ManufacturerUpdateInput = {};
    if (code !== undefined) dataToUpdate.code = code;
    if (name !== undefined) dataToUpdate.name = name;

    try {
      const updatedManufacturer = await prisma.manufacturer.update({
        where: { id },
        data: dataToUpdate,
      });
      res
        .status(200)
        .json({ message: "Производитель успешно обновлен", data: updatedManufacturer });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") { // RecordNotFound
          res.status(404);
          return next(new Error(`Производитель с ID ${id} не найден.`));
        } else if (e.code === "P2002") { // Unique constraint violation (для code)
          res.status(409);
          return next(
            new Error(`Ошибка уникальности при обновлении производителя ID ${id}. Код '${code}' должен быть уникальным.`)
          );
        }
      }
      return next(e);
    }
  }
);

// 📌 Удаление производителя
export const deleteManufacturer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);

    try {
      // 1. Проверка существования производителя
      const manufacturerExists = await prisma.manufacturer.findUnique({
        where: { id },
        select: { id: true, code: true, name: true }, // Получаем code/name для проверок и сообщений
      });
      if (!manufacturerExists) {
        res.status(404);
        return next(new Error(`Производитель с ID ${id} не найден.`));
      }

      // 2. Проверка зависимостей: используется ли производитель в модели Module?
      // Зависит от onDelete в связи Module -> Manufacturer (по умолчанию Restrict)
      const relatedModulesCount = await prisma.module.count({
        where: { manufacturerCode: manufacturerExists.code }, // Ищем модули, ссылающиеся на code производителя
      });

      if (relatedModulesCount > 0) {
        res.status(409); // Conflict (из-за Restrict)
        const message = `Невозможно удалить производителя '${manufacturerExists.name}' (Code: ${manufacturerExists.code}, ID: ${id}), так как он используется в ${relatedModulesCount} модулях.`;
        console.warn(message);
        return next(new Error(message));
      }

      // 3. Удаление, если зависимостей нет
      await prisma.manufacturer.delete({ where: { id } });
      res.status(200).json({ message: "Производитель успешно удален" });

    } catch (e: any) {
      console.error(`Ошибка при удалении производителя ID ${id}:`, e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2025") { // RecordNotFound (маловероятно)
              res.status(404);
              return next(
                  new Error(
                      `Производитель с ID ${id} не найден (ошибка при удалении).`
                  )
              );
          } else if (e.code === "P2003") { // Foreign key constraint failed (Restrict)
             res.status(409);
             return next(new Error(`Невозможно удалить производителя с ID ${id}, так как он используется в связанных модулях.`));
          }
      }
      return next(e);
    }
  }
);