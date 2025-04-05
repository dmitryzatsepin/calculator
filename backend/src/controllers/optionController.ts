// src/controllers/optionController.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/asyncHandler";
import { idParamSchema } from "../validators/commonValidators";
import {
  createOptionSchema,
  updateOptionSchema,
} from "../validators/optionValidators"; // Импортируем валидаторы Option

// 📌 Получение всех опций
export const getOptions = asyncHandler(async (req: Request, res: Response) => {
  const options = await prisma.option.findMany({
    orderBy: { name: "asc" }, // Сортируем по имени
  });
  res
    .status(200)
    .json({ message: "Список опций", data: options });
});

// 📌 Получение одной опции по ID
export const getOptionById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    try {
      const option = await prisma.option.findUniqueOrThrow({
        where: { id },
      });
      res.status(200).json({ message: "Опция найдена", data: option });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        res.status(404);
        return next(new Error(`Опция с ID ${id} не найдена.`));
      }
      return next(e);
    }
  }
);

// 📌 Создание новой опции
export const createOption = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = createOptionSchema.parse(req.body);
    const { code, name } = validatedData;

    // Проверка уникальности 'code' и 'name' перед созданием
    // Можно сделать одним запросом с OR для оптимизации
    const existingOption = await prisma.option.findFirst({
      where: {
        OR: [
          { code: code },
          { name: name }
        ]
      },
      select: { code: true, name: true }, // Получаем, какое поле совпало
    });

    if (existingOption) {
      res.status(409); // Conflict
      if (existingOption.code === code) {
        return next(new Error(`Опция с кодом '${code}' уже существует.`));
      } else { // existingOption.name === name
        return next(new Error(`Опция с именем '${name}' уже существует.`));
      }
    }

    try {
      const newOption = await prisma.option.create({
        data: {
          code: code,
          name: name,
        },
      });
      res
        .status(201)
        .json({ message: "Опция успешно создана", data: newOption });
    } catch (e: any) {
      // Обработка ошибки уникальности (P2002), если проверка выше не сработала
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        res.status(409);
        // Определить, какое поле вызвало ошибку, можно по e.meta.target
        const target = (e.meta?.target as string[])?.join(', ') ?? 'code или name';
        return next(
          new Error(`Ошибка уникальности при создании опции. Поле '${target}' должно быть уникальным.`)
        );
      }
      return next(e);
    }
  }
);

// 📌 Обновление опции
export const updateOption = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateOptionSchema.parse(req.body);
    const { code, name } = validatedData; // Могут быть undefined

    // Проверка на пустое тело сделана валидатором .refine()

    // Проверяем уникальность ПЕРЕД обновлением, если поля code или name переданы
    if (code || name) {
        const conflictingFields: { code?: string; name?: string } = {};
        if (code) conflictingFields.code = code;
        if (name) conflictingFields.name = name;

        const existingOption = await prisma.option.findFirst({
            where: {
                OR: [
                    ...(code ? [{ code: code }] : []), // Добавляем условие, если code есть
                    ...(name ? [{ name: name }] : [])  // Добавляем условие, если name есть
                ],
                NOT: { id: id } // Исключаем текущую запись
            },
            select: { id: true, code: true, name: true }
        });

        if (existingOption) {
             res.status(409); // Conflict
             if (code && existingOption.code === code) {
                 return next(new Error(`Опция с кодом '${code}' уже существует.`));
             }
             if (name && existingOption.name === name) {
                 return next(new Error(`Опция с именем '${name}' уже существует.`));
             }
             // Если сработало из-за другого поля, но ошибка все равно есть
             return next(new Error(`Конфликт уникальности для полей code или name при обновлении опции.`));
        }
    }


    // Собираем данные для обновления (только переданные поля)
    const dataToUpdate: Prisma.OptionUpdateInput = {};
    if (code !== undefined) dataToUpdate.code = code;
    if (name !== undefined) dataToUpdate.name = name;

    try {
      const updatedOption = await prisma.option.update({
        where: { id },
        data: dataToUpdate,
      });
      res
        .status(200)
        .json({ message: "Опция успешно обновлена", data: updatedOption });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") { // RecordNotFound
          res.status(404);
          return next(new Error(`Опция с ID ${id} не найдена.`));
        } else if (e.code === "P2002") { // Unique constraint violation
          res.status(409);
          const target = (e.meta?.target as string[])?.join(', ') ?? 'code или name';
          return next(
            new Error(`Ошибка уникальности при обновлении опции ID ${id}. Поле '${target}' должно быть уникальным.`)
          );
        }
      }
      return next(e);
    }
  }
);

// 📌 Удаление опции
export const deleteOption = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);

    try {
      // 1. Проверка существования опции
      const optionExists = await prisma.option.findUnique({
        where: { id },
        select: { id: true, name: true }, // Получаем name для сообщения об ошибке
      });
      if (!optionExists) {
        res.status(404);
        return next(new Error(`Опция с ID ${id} не найдена.`));
      }

      // 2. Проверка зависимостей
      //    а) Связь с ScreenType через ScreenTypeOption (там onDelete: Cascade)
      //    б) Неявная связь с PixelOption через поле PixelOption.optionName
      //       Из-за неявной связи Cascade не сработает. Нужно проверить вручную.

      const relatedScreenTypesCount = await prisma.screenTypeOption.count({
          where: { optionId: id },
      });
      // Если onDelete: Cascade в ScreenTypeOption, эта проверка больше для информации

      const relatedPixelOptionsCount = await prisma.pixelOption.count({
          where: { optionName: optionExists.name } // Ищем по имени!
      });

      const blockingDependencies: string[] = [];
      if (relatedScreenTypesCount > 0) {
          // Зависит от Cascade. Если Cascade есть, это просто информация.
          console.log(`Опция ID ${id} связана с ${relatedScreenTypesCount} типами экранов (связи будут удалены каскадно).`);
          // blockingDependencies.push(`типы экранов (${relatedScreenTypesCount} шт. в ScreenTypeOption)`); // Можно добавить, если нужно блокировать несмотря на Cascade
      }
      if (relatedPixelOptionsCount > 0) {
          // Эта связь не каскадная, поэтому блокируем удаление
          blockingDependencies.push(`варианты пикселей (${relatedPixelOptionsCount} шт. в PixelOption, которые ссылаются по имени '${optionExists.name}')`);
      }


      // 3. Если есть БЛОКИРУЮЩИЕ зависимости (из PixelOption), возвращаем ошибку
      if (blockingDependencies.length > 0) {
          res.status(409); // Conflict
          const dependencyString = blockingDependencies.join(' и ');
          const message = `Невозможно удалить опцию '${optionExists.name}' (ID ${id}), так как существуют ${dependencyString}.`;
          console.warn(message);
          return next(new Error(message));
      }

      // 4. Удаление опции (связи с ScreenType удалятся каскадно)
      await prisma.option.delete({ where: { id } });
      res.status(200).json({ message: "Опция успешно удалена" });

    } catch (e: any) {
      console.error(`Ошибка при удалении опции ID ${id}:`, e);
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
          res.status(404);
          return next(new Error(`Опция с ID ${id} не найдена (ошибка при удалении).`));
      }
      // P2003 из-за ScreenTypeOption не ожидается (Cascade), но может быть из-за PixelOption (хотя мы проверили)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
          res.status(409);
          return next(new Error(`Невозможно удалить опцию с ID ${id}, так как она используется в связанных записях (вероятно, PixelOption).`));
      }
      return next(e);
    }
  }
);