// src/controllers/materialController.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/asyncHandler";
import { idParamSchema } from "../validators/commonValidators"; // Для получения ID из параметра
import {
  createMaterialSchema,
  updateMaterialSchema,
} from "../validators/materialValidators"; // Импортируем валидаторы Material

// 📌 Получение всех материалов
export const getMaterials = asyncHandler(async (req: Request, res: Response) => {
  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" }, // Сортируем по имени
  });
  res
    .status(200)
    .json({ message: "Список материалов", data: materials });
});

// 📌 Получение одного материала по ID
export const getMaterialById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params); // Валидируем и получаем ID
    try {
      const material = await prisma.material.findUniqueOrThrow({
        where: { id },
      });
      res.status(200).json({ message: "Материал найден", data: material });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        res.status(404);
        return next(new Error(`Материал с ID ${id} не найден.`));
      }
      return next(e);
    }
  }
);

// 📌 Создание нового материала
export const createMaterial = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = createMaterialSchema.parse(req.body);
    const { code, name } = validatedData;

    // Проверка уникальности 'code' перед созданием
    const existingMaterial = await prisma.material.findUnique({
      where: { code: code },
      select: { id: true },
    });
    if (existingMaterial) {
      res.status(409); // Conflict
      return next(
        new Error(`Материал с кодом '${code}' уже существует.`)
      );
    }

    try {
      const newMaterial = await prisma.material.create({
        data: {
          code: code,
          name: name,
        },
      });
      res
        .status(201)
        .json({ message: "Материал успешно создан", data: newMaterial });
    } catch (e: any) {
      // Обработка ошибки уникальности (P2002)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        res.status(409);
        return next(
          new Error(`Ошибка уникальности при создании материала. Код '${code}' должен быть уникальным.`)
        );
      }
      return next(e);
    }
  }
);

// 📌 Обновление материала
export const updateMaterial = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateMaterialSchema.parse(req.body);
    const { code, name } = validatedData; // Могут быть undefined

    // Проверка на пустое тело сделана валидатором .refine()

    // Если обновляется 'code', проверяем его уникальность
    if (code) {
      const existingMaterial = await prisma.material.findUnique({
        where: { code: code },
        select: { id: true },
      });
      // Если материал с таким кодом найден и это НЕ текущий обновляемый
      if (existingMaterial && existingMaterial.id !== id) {
        res.status(409); // Conflict
        return next(
          new Error(`Материал с кодом '${code}' уже существует.`)
        );
      }
    }

    // Собираем данные для обновления (только переданные поля)
    const dataToUpdate: Prisma.MaterialUpdateInput = {};
    if (code !== undefined) dataToUpdate.code = code;
    if (name !== undefined) dataToUpdate.name = name;

    try {
      const updatedMaterial = await prisma.material.update({
        where: { id },
        data: dataToUpdate,
      });
      res
        .status(200)
        .json({ message: "Материал успешно обновлен", data: updatedMaterial });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") { // RecordNotFound
          res.status(404);
          return next(new Error(`Материал с ID ${id} не найден.`));
        } else if (e.code === "P2002") { // Unique constraint violation (для code)
          res.status(409);
          return next(
            new Error(`Ошибка уникальности при обновлении материала ID ${id}. Код '${code}' должен быть уникальным.`)
          );
        }
      }
      return next(e);
    }
  }
);

// 📌 Удаление материала
export const deleteMaterial = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);

    try {
      // 1. Проверка существования материала (для правильного 404)
      const materialExists = await prisma.material.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!materialExists) {
        res.status(404);
        return next(new Error(`Материал с ID ${id} не найден.`));
      }

      // 2. Проверка зависимостей (Опционально, т.к. есть onDelete: Cascade в связующих таблицах)
      // В моделях ScreenTypeMaterial и CabinetMaterial стоит onDelete: Cascade
      // для связи с Material. Это значит, что при удалении Material,
      // соответствующие записи в этих связующих таблицах будут удалены автоматически.
      // Поэтому явная проверка зависимостей здесь не требуется для предотвращения ошибки БД.
      /*
      const relatedScreenTypesCount = await prisma.screenTypeMaterial.count({ where: { materialId: id } });
      const relatedCabinetsCount = await prisma.cabinetMaterial.count({ where: { materialId: id } });
      if (relatedScreenTypesCount > 0 || relatedCabinetsCount > 0) {
          res.status(409); // Conflict
          // Можно вернуть сообщение, но удаление все равно произойдет каскадно
          const message = `Материал ID ${id} используется в ${relatedScreenTypesCount} типах экранов и ${relatedCabinetsCount} кабинетах. Связи будут удалены каскадно.`;
          console.warn(message);
          // return next(new Error(message)); // Если нужно блокировать удаление, несмотря на Cascade
      }
      */

      // 3. Удаление материала (связи удалятся каскадно)
      await prisma.material.delete({ where: { id } });
      res.status(200).json({ message: "Материал успешно удален" });

    } catch (e: any) {
      console.error(`Ошибка при удалении материала ID ${id}:`, e);
      // P2025 маловероятен из-за проверки выше
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
          res.status(404);
          return next(new Error(`Материал с ID ${id} не найден (ошибка при удалении).`));
      }
      // P2003 (Foreign key constraint) не должен возникать из-за Cascade
      return next(e);
    }
  }
);