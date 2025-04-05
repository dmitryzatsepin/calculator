import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client"; // Prisma и типы ошибок
import { Decimal } from "@prisma/client/runtime/library"; // Для Decimal
import { prisma } from "../lib/prisma"; // Экземпляр Prisma
import { asyncHandler } from "../middleware/asyncHandler"; // Обработчик async
import { idParamSchema } from "../validators/commonValidators"; // Валидатор ID
import {
  // ИЗМЕНЕНО: Импортируем схемы для PixelStepDefinition
  createPixelStepDefinitionSchema,
  updatePixelStepDefinitionSchema,
} from "../validators/pixelStepDefinitionValidators"; // Валидаторы PixelStepDefinition

// УДАЛЕНО: Хелпер mapPixelStepModelToResponse - нерелевантен для PixelStepDefinition

// 📌 Получение всех определений шага пикселя (PixelStepDefinition)
// ИЗМЕНЕНО: getPixelSteps -> getPixelStepDefinitions
export const getPixelStepDefinitions = asyncHandler(async (req: Request, res: Response) => {
  // ИЗМЕНЕНО: prisma.pixelStepModel -> prisma.pixelStepDefinition
  const definitions = await prisma.pixelStepDefinition.findMany({
    // ИЗМЕНЕНО: Сортируем по коду
    orderBy: { code: "asc" },
    // ИЗМЕНЕНО: Убрали include - нет прямых связей для включения в этом контексте
  });
  // ИЗМЕНЕНО: Возвращаем список определений как есть (id, code, stepValue, createdAt, updatedAt)
  res
    .status(200)
    .json({ message: "Список определений шага пикселя", data: definitions });
});


// 📌 Создание нового определения шага пикселя (PixelStepDefinition)
// ИЗМЕНЕНО: createPixelStep -> createPixelStepDefinition
export const createPixelStepDefinition = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // ИЗМЕНЕНО: Используем схему для PixelStepDefinition
    const validatedData = createPixelStepDefinitionSchema.parse(req.body);

    // ИЗМЕНЕНО: Деструктурируем поля из новой схемы
    const { code, stepValue } = validatedData;

    // ИЗМЕНЕНО: Проверка уникальности по полю 'code'
    const existingDefinition = await prisma.pixelStepDefinition.findUnique({
      where: { code: code }, // Проверяем уникальность code
      select: { id: true },
    });
    if (existingDefinition) {
      res.status(409); // Conflict
      // ИЗМЕНЕНО: Сообщение об ошибке
      return next(
        new Error(
          `Определение шага пикселя (PixelStepDefinition) с кодом '${code}' уже существует.`
        )
      );
    }

    try {
      // ИЗМЕНЕНО: prisma.pixelStepModel.create -> prisma.pixelStepDefinition.create
      const newDefinition = await prisma.pixelStepDefinition.create({
        data: {
          code: code,
          // Обрабатываем Decimal - Prisma Client принимает number или string
          stepValue: new Prisma.Decimal(stepValue),
          // УДАЛЕНА логика связей с ScreenType, Option и т.д.
        },
        // УДАЛЕН include, т.к. создаем базовую сущность
      });
      res
        .status(201)
        .json({
          message: "Определение шага пикселя успешно создано",
          data: newDefinition, // Возвращаем созданный объект
        });
    } catch (e: any) {
      // Ловим ошибку уникальности (P2002), которая должна касаться 'code'
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        res.status(409);
        // ИЗМЕНЕНО: Уточняем ошибку
        return next(
          new Error(
            `Ошибка уникальности при создании PixelStepDefinition. Поле 'code' (${code}) должно быть уникальным.`
          )
        );
      }
      return next(e); // Передаем другие ошибки дальше
    }
  }
);


// 📌 Обновление определения шага пикселя (PixelStepDefinition)
// ИЗМЕНЕНО: updatePixelStep -> updatePixelStepDefinition
export const updatePixelStepDefinition = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    // ИЗМЕНЕНО: Используем схему обновления для PixelStepDefinition
    const validatedData = updatePixelStepDefinitionSchema.parse(req.body);
    // ИЗМЕНЕНО: Деструктурируем возможное поле (обычно только stepValue)
    const { stepValue } = validatedData; // code обычно не обновляют

    // Проверка на пустое тело сделана в валидаторе .refine()

    // Собираем данные для обновления (только stepValue)
    // ИЗМЕНЕНО: Тип Prisma.PixelStepDefinitionUpdateInput
    const dataToUpdate: Prisma.PixelStepDefinitionUpdateInput = {};
    if (stepValue !== undefined) {
      dataToUpdate.stepValue = new Prisma.Decimal(stepValue);
    }
    // Если нужно разрешить обновление 'code', добавить проверку уникальности как в create и добавить в dataToUpdate

    try {
      // ИЗМЕНЕНО: prisma.pixelStepModel.update -> prisma.pixelStepDefinition.update
      const updatedDefinition = await prisma.pixelStepDefinition.update({
        where: { id },
        data: dataToUpdate,
        // УДАЛЕН include
      });
      res
        .status(200)
        .json({
          message: "Определение шага пикселя успешно обновлено",
          data: updatedDefinition, // Возвращаем обновленный объект
        });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") { // RecordNotFound
          res.status(404);
          // ИЗМЕНЕНО: Сообщение об ошибке
          return next(new Error(`Определение шага пикселя (PixelStepDefinition) с ID ${id} не найдено.`));
        }
        // Ошибка P2002 (Unique constraint) маловероятна, если не обновляем 'code'
      }
      return next(e); // Передаем другие ошибки дальше
    }
  }
);


// 📌 Удаление определения шага пикселя (PixelStepDefinition)
// ИЗМЕНЕНО: deletePixelStep -> deletePixelStepDefinition
export const deletePixelStepDefinition = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);

    try {
      // 1. Проверка существования PixelStepDefinition
      // ИЗМЕНЕНО: prisma.pixelStepModel -> prisma.pixelStepDefinition
      const definitionExists = await prisma.pixelStepDefinition.findUnique({
        where: { id },
        select: { id: true, code: true }, // Получаем 'code' для проверки зависимостей и сообщения
      });
      if (!definitionExists) {
        res.status(404);
        // ИЗМЕНЕНО: Сообщение об ошибке
        return next(new Error(`Определение шага пикселя (PixelStepDefinition) с ID ${id} не найдено.`));
      }

      // 2. Проверка зависимостей: используется ли 'code' этого определения в PixelOption или Module?
      // Важно: Зависит от правил onDelete в связях PixelOption -> PixelStepDefinition и Module -> PixelStepDefinition.
      // Если там Restrict (по умолчанию), то удаление будет запрещено базой данных.
      // Эта проверка нужна для понятного сообщения пользователю.

      const relatedPixelOptionsCount = await prisma.pixelOption.count({
        where: { pixelCode: definitionExists.code }, // Ищем по 'code'
      });

      const relatedModulesCount = await prisma.module.count({
        where: { pixelCode: definitionExists.code }, // Ищем по 'code'
      });

      // ИЗМЕНЕНО: Список зависимостей
      const blockingDependencies: string[] = [];
      if (relatedPixelOptionsCount > 0) {
        blockingDependencies.push(`варианты пикселей (${relatedPixelOptionsCount} шт. в 'PixelOption')`);
      }
      if (relatedModulesCount > 0) {
        blockingDependencies.push(`модули (${relatedModulesCount} шт. в 'Module')`);
      }

      // 3. Если зависимости найдены, возвращаем ошибку 409 (т.к. onDelete скорее всего Restrict)
      if (blockingDependencies.length > 0) {
        res.status(409); // Conflict
        const dependencyString = blockingDependencies.join(' и ');
        const message = `Невозможно удалить определение шага пикселя с кодом '${definitionExists.code}' (ID ${id}), так как оно используется в ${dependencyString}.`;
        console.warn(message); // Логируем предупреждение
        return next(new Error(message)); // Возвращаем ошибку клиенту
      }

      // 4. Удаление, если зависимостей нет
      // ИЗМЕНЕНО: prisma.pixelStepModel.delete -> prisma.pixelStepDefinition.delete
      await prisma.pixelStepDefinition.delete({ where: { id } });
      res.status(200).json({ message: "Определение шага пикселя успешно удалено" });

    } catch (e: any) {
      // ИЗМЕНЕНО: Логируем ошибку для PixelStepDefinition
      console.error(`Ошибка при удалении PixelStepDefinition ID ${id}:`, e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2025") { // RecordNotFound (маловероятно)
              res.status(404);
              // ИЗМЕНЕНО: Сообщение об ошибке
              return next(
                  new Error(
                      `Определение шага пикселя (PixelStepDefinition) с ID ${id} не найдено (ошибка при удалении).`
                  )
              );
          } else if (e.code === "P2003") { // Foreign key constraint failed (явный результат Restrict)
             res.status(409); // Conflict
             return next(new Error(`Невозможно удалить PixelStepDefinition с ID ${id}, так как он используется в связанных записях (PixelOption или Module).`));
          }
      }
      return next(e); // Передаем другие ошибки дальше
    }
  }
);