// src/controllers/screenTypeController.ts
import { Request, Response, NextFunction } from "express"; // Добавили NextFunction
import { PrismaClient, Prisma } from "@prisma/client"; // Добавили Prisma для типов ошибок
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';
import { idParamSchema } from "../validators/commonValidators"; // Для ID
import {
    createScreenTypeSchema,
    updateScreenTypeSchema
} from "../validators/screenTypeValidators"; // Валидаторы для ScreenType

// --- Вспомогательная функция для маппинга ответа (чтобы не дублировать) ---
const mapScreenTypeToResponse = (screenType: any) => {
    if (!screenType) return null;

    // Включаем обработку вложенных связей, если они есть в screenType
    const materials = screenType.materials?.map((m: any) => ({
        code: m.material?.code, // Добавили ?. для безопасности
        name: m.material?.name
    })) ?? []; // Используем ?? [] для случая, когда materials отсутствует

    const options = screenType.options?.map((o: any) => ({
        code: o.option?.code, // Добавили ?. для безопасности
        name: o.option?.name
    })) ?? []; // Используем ?? []

    return {
        id: screenType.id,
        name: screenType.name,
        brightness: screenType.brightness,
        materials: materials,
        options: options,
        createdAt: screenType.createdAt, // Добавляем таймстемпы, если нужны
        updatedAt: screenType.updatedAt,
    };
};

// --- Вспомогательная функция для проверки связанных кодов ---
const checkRelatedCodes = async (
    codes: string[] | undefined,
    model: 'material' | 'option'
): Promise<{ foundIds: number[], notFoundCodes: string[] }> => {
    const foundIds: number[] = [];
    const notFoundCodes: string[] = [];

    if (!codes || codes.length === 0) {
        return { foundIds, notFoundCodes };
    }

    const uniqueCodes = [...new Set(codes)]; // Убираем дубликаты

    let results;
    if (model === 'material') {
        results = await prisma.material.findMany({
            where: { code: { in: uniqueCodes } },
            select: { id: true, code: true },
        });
    } else { // model === 'option'
        results = await prisma.option.findMany({
            where: { code: { in: uniqueCodes } },
            select: { id: true, code: true },
        });
    }

    const foundCodesMap = new Map(results.map(item => [item.code, item.id]));

    for (const code of uniqueCodes) {
        const foundId = foundCodesMap.get(code);
        if (foundId !== undefined) {
            foundIds.push(foundId);
        } else {
            notFoundCodes.push(code);
        }
    }

    return { foundIds, notFoundCodes };
};


// 📌 Получение всех типов экранов (уже было, используем маппер)
export const getScreenTypes = asyncHandler(async (req: Request, res: Response) => {
  const screenTypes = await prisma.screenType.findMany({
    orderBy: { name: 'asc' },
    include: {
      materials: { select: { material: { select: { code: true, name: true } } } },
      options:   { select: { option:   { select: { code: true, name: true } } } }
    }
  });
  // Используем хелпер для маппинга
  const responseData = screenTypes.map(mapScreenTypeToResponse);
  res.status(200).json({ message: "Список типов экранов", data: responseData });
});

// 📌 Получение одного типа экрана по ID (НОВАЯ ФУНКЦИЯ)
export const getScreenTypeById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    try {
        const screenType = await prisma.screenType.findUniqueOrThrow({
            where: { id },
            include: { // Включаем те же данные, что и в getScreenTypes
                materials: { select: { material: { select: { code: true, name: true } } } },
                options:   { select: { option:   { select: { code: true, name: true } } } }
            }
        });
        // Используем хелпер для маппинга
        res.status(200).json({ message: "Тип экрана найден", data: mapScreenTypeToResponse(screenType) });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            res.status(404);
            return next(new Error(`Тип экрана с ID ${id} не найден.`));
        }
        return next(e);
    }
});

// 📌 Создание нового типа экрана (НОВАЯ ФУНКЦИЯ)
export const createScreenType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = createScreenTypeSchema.parse(req.body);
    const { name, brightness, materialCodes, optionCodes } = validatedData;

    // 1. Проверка уникальности имени
    const existingType = await prisma.screenType.findUnique({ where: { name } });
    if (existingType) {
        res.status(409);
        return next(new Error(`Тип экрана с именем '${name}' уже существует.`));
    }

    // 2. Проверка существования связанных Material и Option
    const materialCheck = await checkRelatedCodes(materialCodes, 'material');
    if (materialCheck.notFoundCodes.length > 0) {
        res.status(400);
        return next(new Error(`Следующие коды материалов не найдены: ${materialCheck.notFoundCodes.join(', ')}`));
    }
    const optionCheck = await checkRelatedCodes(optionCodes, 'option');
    if (optionCheck.notFoundCodes.length > 0) {
        res.status(400);
        return next(new Error(`Следующие коды опций не найдены: ${optionCheck.notFoundCodes.join(', ')}`));
    }

    // 3. Создание ScreenType со связями
    try {
        const newScreenType = await prisma.screenType.create({
            data: {
                name,
                brightness, // Prisma обработает undefined как null, если поле Int?
                // Создаем связи M-N через вложенные create
                materials: materialCheck.foundIds.length > 0 ? {
                    create: materialCheck.foundIds.map(id => ({ materialId: id }))
                } : undefined, // Не создаем пустую связь, если массив кодов пуст или не передан
                options: optionCheck.foundIds.length > 0 ? {
                    create: optionCheck.foundIds.map(id => ({ optionId: id }))
                } : undefined,
            },
            include: { // Включаем данные для ответа
                materials: { select: { material: { select: { code: true, name: true } } } },
                options:   { select: { option:   { select: { code: true, name: true } } } }
            }
        });
        res.status(201).json({ message: "Тип экрана успешно создан", data: mapScreenTypeToResponse(newScreenType) });
    } catch (e) {
      // Ловим P2002 на случай гонки потоков
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        res.status(409);
        return next(new Error(`Ошибка уникальности при создании типа экрана. Имя '${name}' должно быть уникальным.`));
      }
      // Ловим P2003 на случай проблем с FK
       if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
         console.error("FK constraint error during ScreenType creation:", e);
         res.status(400);
         return next(new Error(`Ошибка связи при создании типа экрана.`));
       }
      return next(e);
    }
});

// 📌 Обновление типа экрана (НОВАЯ ФУНКЦИЯ)
export const updateScreenType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateScreenTypeSchema.parse(req.body);
    const { name, brightness, materialCodes, optionCodes } = validatedData; // Все поля опциональны

    // 1. Проверка уникальности имени, если оно передано и отличается от текущего
    if (name) {
        const existingType = await prisma.screenType.findFirst({
            where: { name, NOT: { id } }
        });
        if (existingType) {
            res.status(409);
            return next(new Error(`Тип экрана с именем '${name}' уже существует.`));
        }
    }

    // 2. Проверка существования связанных Material и Option, если коды переданы
    let materialIds: number[] | undefined;
    if (materialCodes !== undefined) {
        const materialCheck = await checkRelatedCodes(materialCodes, 'material');
        if (materialCheck.notFoundCodes.length > 0) {
            res.status(400);
            return next(new Error(`Следующие коды материалов не найдены: ${materialCheck.notFoundCodes.join(', ')}`));
        }
        materialIds = materialCheck.foundIds;
    }

    let optionIds: number[] | undefined;
     if (optionCodes !== undefined) {
        const optionCheck = await checkRelatedCodes(optionCodes, 'option');
        if (optionCheck.notFoundCodes.length > 0) {
            res.status(400);
            return next(new Error(`Следующие коды опций не найдены: ${optionCheck.notFoundCodes.join(', ')}`));
        }
        optionIds = optionCheck.foundIds;
    }

    // 3. Обновление ScreenType и его связей
    try {
         // Используем транзакцию для атомарного обновления связей M-N
        const updatedScreenType = await prisma.$transaction(async (tx) => {
            // Обновляем основные поля
            const dataToUpdate: Prisma.ScreenTypeUpdateInput = {};
            if (name !== undefined) dataToUpdate.name = name;
            if (brightness !== undefined) dataToUpdate.brightness = brightness; // Позволяем установить null

            // Обновляем связи M-N (deleteMany + create)
            if (materialIds !== undefined) {
                await tx.screenTypeMaterial.deleteMany({ where: { screenTypeId: id } });
                if (materialIds.length > 0) {
                    dataToUpdate.materials = {
                        create: materialIds.map(matId => ({ materialId: matId }))
                    };
                }
            }
            if (optionIds !== undefined) {
                 await tx.screenTypeOption.deleteMany({ where: { screenTypeId: id } });
                 if (optionIds.length > 0) {
                    dataToUpdate.options = {
                        create: optionIds.map(optId => ({ optionId: optId }))
                    };
                 }
            }

            // Выполняем основное обновление
            return tx.screenType.update({
                where: { id },
                data: dataToUpdate,
                include: { // Включаем данные для ответа
                    materials: { select: { material: { select: { code: true, name: true } } } },
                    options:   { select: { option:   { select: { code: true, name: true } } } }
                }
            });
        });

        res.status(200).json({ message: "Тип экрана успешно обновлен", data: mapScreenTypeToResponse(updatedScreenType) });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2025') {
                res.status(404);
                return next(new Error(`Тип экрана с ID ${id} не найден.`));
            }
            if (e.code === 'P2002') {
                 res.status(409);
                 return next(new Error(`Ошибка уникальности при обновлении типа экрана. Имя '${name}' должно быть уникальным.`));
            }
             if (e.code === 'P2003') {
                 console.error("FK constraint error during ScreenType update:", e);
                 res.status(400);
                 return next(new Error(`Ошибка связи при обновлении типа экрана.`));
            }
        }
        return next(e);
    }
});

// 📌 Удаление типа экрана (НОВАЯ ФУНКЦИЯ)
export const deleteScreenType = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = idParamSchema.parse(req.params);

    try {
        // 1. Проверка существования
        const screenTypeExists = await prisma.screenType.findUnique({
            where: { id },
            select: { id: true, name: true } // Получаем имя для сообщения
        });
        if (!screenTypeExists) {
            res.status(404);
            return next(new Error(`Тип экрана с ID ${id} не найден.`));
        }

        // 2. Проверка зависимостей (Module, Cabinet, PixelOption)
        // Связи с ScreenTypeMaterial и ScreenTypeOption удалятся каскадно (onDelete: Cascade)
        const relatedModulesCount = await prisma.module.count({ where: { screenTypeId: id }});
        const relatedCabinetsCount = await prisma.cabinet.count({ where: { screenTypeId: id }});
        const relatedPixelOptionsCount = await prisma.pixelOption.count({ where: { screenTypeId: id }});

        const blockingDependencies: string[] = [];
        if (relatedModulesCount > 0) blockingDependencies.push(`модули (${relatedModulesCount} шт.)`);
        if (relatedCabinetsCount > 0) blockingDependencies.push(`кабинеты (${relatedCabinetsCount} шт.)`);
        if (relatedPixelOptionsCount > 0) blockingDependencies.push(`варианты пикселей (${relatedPixelOptionsCount} шт.)`);

        if (blockingDependencies.length > 0) {
            res.status(409); // Conflict
            const dependencyString = blockingDependencies.join(', ');
            const message = `Невозможно удалить тип экрана '${screenTypeExists.name}' (ID ${id}), так как он используется в: ${dependencyString}.`;
            return next(new Error(message));
        }

        // 3. Удаление (связи M-N удалятся каскадно)
        // Удаляем внутри транзакции на случай сложных каскадных правил или триггеров (хотя здесь это избыточно)
        await prisma.$transaction(async (tx) => {
             // Prisma сама обработает каскадное удаление ScreenTypeMaterial/ScreenTypeOption
             await tx.screenType.delete({ where: { id } });
        });

        res.status(200).json({ message: "Тип экрана успешно удален" });

    } catch (e) {
         if (e instanceof Prisma.PrismaClientKnownRequestError) {
             if (e.code === 'P2025') {
                 res.status(404);
                 return next(new Error(`Тип экрана с ID ${id} не найден (ошибка при удалении).`));
             }
             // P2003 может возникнуть, если проверка зависимостей не сработала или onDelete не Cascade там, где ожидалось
             if (e.code === 'P2003') {
                 res.status(409);
                 return next(new Error(`Невозможно удалить тип экрана с ID ${id} из-за существующих связей (Module, Cabinet или PixelOption).`));
             }
         }
        return next(e);
    }
});