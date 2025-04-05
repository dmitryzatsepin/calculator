import { Request, Response, NextFunction } from "express";
// ИЗМЕНЕНО: Убрали Part, PixelStepModel. Добавили нужные модели из актуальной схемы.
import { PrismaClient, Prisma, ComponentService, PixelStepDefinition, Cabinet, Material, ScreenType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';
import { idParamSchema } from '../validators/commonValidators';
// TODO: Обновить валидаторы cabinetValidators под новую структуру данных
import { createCabinetSchema, updateCabinetSchema } from '../validators/cabinetValidators';

// --- Интерфейсы для типизации связанных данных (улучшено для mapCabinetToResponse) ---

interface ComponentDetail {
    componentId: number; // Было partId
    code: string;        // Добавили code из ComponentService
    name: string;        // Используем общее поле name из ComponentService
    quantity: number;
    priceUsd: Decimal | null;
    priceRub: Decimal | null;
    category?: string | null; // Добавили категорию
}

// УДАЛЕНО: Интерфейс CompatiblePixelStepDetail, так как связи Cabinet <-> PixelStepDefinition нет в схеме

interface CabinetComponentRelation {
    quantity: number;
    // ИЗМЕНЕНО: Связь с ComponentService (переименовано в component)
    component: {
        id: number;
        code: string;
        name: string;
        priceUsd: Decimal | null;
        priceRub: Decimal | null;
        category?: string | null; // Добавили категорию
    }
}

// --- Тип для получения Кабинета с деталями через Prisma GetPayload ---
type CabinetWithDetails = Prisma.CabinetGetPayload<{
  include: {
    screenType: { select: { name: true } }; // Связь с ScreenType (опциональная в схеме)
    materials: { // Связь M-N CabinetMaterial
        include: {
            material: { select: { code: true, name: true } } // Включаем детали Material
        }
    };
    components: { // Связь M-N CabinetComponent
        select: {
            quantity: true;
            component: { // Включаем детали ComponentService
                select: { id: true; code: true; name: true; priceUsd: true; priceRub: true; category: true }
            }
        }
    };
    // УДАЛЕНО: ipCode, compatiblePixelSteps - нет таких связей в схеме Cabinet
  }
}>

// --- Хелпер для преобразования Cabinet в ответ API (ПЕРЕПИСАН под новую схему) ---
const mapCabinetToResponse = (cabinet: CabinetWithDetails | null) => {
    if (!cabinet) return null;
    const {
        screenType, materials, components,
        priceUsd, // Берем из самой модели Cabinet
        // УДАЛЕНО: mountPriceRub, deliveryPriceRub, addPriceRub - нет в модели Cabinet
        // УДАЛЕНО: compatiblePixelSteps, ipCode
        ...rest // Остальные поля модели Cabinet (id, sku, name, width, height, etc.)
    } = cabinet;

    // Получаем коды материалов из связи M-N
    const materialCodes: string[] = materials?.map(cm => cm.material.code) ?? [];

    // Обрабатываем компоненты из связи M-N
    const componentDetails: ComponentDetail[] = components?.map((comp): ComponentDetail => ({
        componentId: comp.component.id,
        code: comp.component.code,
        name: comp.component.name,
        quantity: comp.quantity,
        priceUsd: comp.component.priceUsd,
        priceRub: comp.component.priceRub,
        category: comp.component.category,
    })) ?? [];

    // --- Поиск ключевых компонентов ---
    // TODO: Заменить 'placeholder_code_...' на реальные коды или использовать категории
    let powerUnitInfo = componentDetails.find((c: ComponentDetail) => c.code?.startsWith('PU')); // Пример: Ищем по коду, начинающемуся с PU
    let receiverInfo = componentDetails.find((c: ComponentDetail) => c.code === 'placeholder_code_receiver'); // Пример: Ищем по точному коду
    let coolerInfo = componentDetails.find((c: ComponentDetail) => c.category === 'Охлаждение'); // Пример: Ищем по категории

    // --- Формирование ответа ---
    // Используем поля напрямую из модели Cabinet и обработанные данные связей
    return {
        id: rest.id,
        sku: rest.sku,
        name: rest.name,
        placement: rest.placement,
        location: screenType?.name ?? null, // Имя типа экрана или null
        materialCodes: materialCodes, // Массив кодов материалов
        pixelStep: [], // ЗАГЛУШКА: Прямой связи с шагом пикселя нет, оставляем пустым или убираем поле
        powerUnit: powerUnitInfo?.name ?? 'N/A',
        // powerUnitCapacity: parseInt(powerUnitInfo?.code?.replace('PU', '') || '0'), // Пример получения мощности из кода
        powerUnitQ: powerUnitInfo?.quantity ?? 0,
        receiverQ: receiverInfo?.quantity ?? 0, // Переименовали receiver -> receiverQ
        coolerQ: coolerInfo?.quantity ?? 0, // Переименовали cooler -> coolerQ
        width: rest.width,
        height: rest.height,
        modulesCount: rest.modulesCount,
        priceUsd: priceUsd, // Цена из модели Cabinet
        // УДАЛЕНО: mountPriceRub, deliveryPriceRub, addPriceRub
        // УДАЛЕНО: ipCode
        createdAt: rest.createdAt,
        updatedAt: rest.updatedAt,
    };
};


// 📌 Получение всех кабинетов (ПЕРЕПИСАНО под новую схему)
export const getCabinets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const cabinets = await prisma.cabinet.findMany({ // ИЗМЕНЕНО: CabinetConfiguration -> Cabinet
        orderBy: { id: 'asc' },
        include: { // ИЗМЕНЕНО: Обновляем include в соответствии со схемой
            screenType: { select: { name: true } },
            materials: { include: { material: { select: { code: true, name: true } } } },
            components: {
                select: {
                    quantity: true,
                    component: { select: { id: true, code: true, name: true, priceUsd: true, priceRub: true, category: true } }
                }
            }
            // УДАЛЕНО: ipCode, compatiblePixelSteps
        }
    });
    // Используем обновленный маппер
    const responseData = cabinets.map(mapCabinetToResponse);
    res.status(200).json({ message: "Список кабинетов", data: responseData });
});


// 📌 Создание нового кабинета (ПЕРЕПИСАНО под новую схему)
export const createCabinet = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // TODO: Обновить createCabinetSchema в validators! Ожидаем:
    // sku, name?, width?, height?, modulesCount?, placement?, priceUsd?
    // location? (screenType.name)
    // materialCodes: string[]
    // components: Array<{ componentCode: string, quantity: number }>
    // pixelStepCodes - убрано (нет связи)
    // Убраны: powerUnitCapacity, powerUnitQ, receiver, cooler (передаются в components)
    // Убраны: mountPriceRub, deliveryPriceRub, addPriceRub (нет в схеме)
    const validatedData = createCabinetSchema.parse(req.body);
    const {
        sku, name, width, height, modulesCount, placement, priceUsd, // Поля Cabinet
        location, // Имя ScreenType
        materialCodes, // Массив кодов материалов
        components: componentsInput, // Массив компонентов { componentCode, quantity }
        // УДАЛЕНО: pixelStep, powerUnitCapacity, powerUnitQ, receiver, cooler, mountPriceRub, deliveryPriceRub, addPriceRub
        ...rest // Остальные поля из валидации (если есть)
    } = validatedData;

    // --- Обработка ScreenType (1-n, опционально) ---
    let screenTypeId: number | undefined = undefined;
    if (location) {
        const screenType = await prisma.screenType.findUnique({ where: { name: location }, select: { id: true } });
        if (!screenType) { res.status(400); return next(new Error(`Тип экрана '${location}' не найден.`)); }
        screenTypeId = screenType.id;
    }

    // --- Обработка Материалов (M-N) ---
    const materialsToConnect: Prisma.CabinetMaterialCreateManyCabinetInput[] = [];
    if (materialCodes && materialCodes.length > 0) {
        const foundMaterials = await prisma.material.findMany({
            where: { code: { in: materialCodes } }, // Ищем по коду
            select: { id: true, code: true }
        });
        if (foundMaterials.length !== materialCodes.length) {
            const foundCodes = foundMaterials.map(m => m.code);
            const notFound = materialCodes.filter(code => !foundCodes.includes(code));
            res.status(400); return next(new Error(`Следующие коды материалов не найдены: ${notFound.join(', ')}`));
        }
        // Готовим данные для создания связей в CabinetMaterial
        foundMaterials.forEach(m => materialsToConnect.push({ materialId: m.id }));
    } else {
        // Решите, обязателен ли материал. Если да - выдавать ошибку.
        console.warn(`[Create Cabinet ${sku}] Материалы не указаны.`);
        // res.status(400); return next(new Error(`Не указаны материалы кабинета.`));
    }

    // --- Обработка PixelSteps (УДАЛЕНО) ---
    // Связи Cabinet -> PixelStepDefinition нет в схеме. Логика удалена.
    // Если связь нужна, добавьте M-N таблицу в schema.prisma и адаптируйте код.
    console.warn(`[Create Cabinet ${sku}] Логика связи с PixelStepDefinition пропущена (нет M-N связи в схеме).`);

    // --- Обработка Компонентов (M-N) ---
    const componentsToCreate: Prisma.CabinetComponentCreateWithoutCabinetInput[] = []; // ИЗМЕНЕНО ТИП
    if (componentsInput && componentsInput.length > 0) {
        for (const item of componentsInput) {
             // TODO: Убедиться, что валидатор проверяет структуру item
             const { componentCode, quantity } = item;
             if (!componentCode || !quantity || quantity <= 0) {
                 console.warn(`(Create Cabinet ${sku}) Пропуск некорректного компонента:`, item);
                 continue;
             };
             const componentService = await prisma.componentService.findUnique({ // ИЗМЕНЕНО: part -> componentService
                 where: { code: componentCode }, // Ищем по коду
                 select: { id: true }
             });
             if (componentService) {
                 // Готовим данные для создания связи в CabinetComponent
                 componentsToCreate.push({
                     quantity: quantity,
                     component: { connect: { id: componentService.id } } // Связываем с ComponentService
                 });
             } else {
                 // Можно выдавать ошибку, если компонент обязателен
                 console.warn(`(Create Cabinet ${sku}) ComponentService с code='${componentCode}' не найден. Пропуск.`);
                 // return next(new Error(`Компонент с кодом '${componentCode}' не найден.`));
             }
        }
    }

    // --- Создание Кабинета ---
    try {
        const newCabinet = await prisma.cabinet.create({ // ИЗМЕНЕНО: cabinetConfiguration -> cabinet
            data: {
                // Основные поля кабинета
                sku, name, width, height, modulesCount, placement,
                priceUsd: priceUsd != null ? new Prisma.Decimal(priceUsd) : null,
                // Связь 1-n с ScreenType (если ID найден)
                ...(screenTypeId !== undefined && { screenType: { connect: { id: screenTypeId } } }),
                // Вложенное создание связей M-N
                materials: { create: materialsToConnect }, // Создает записи в CabinetMaterial
                components: { create: componentsToCreate }  // Создает записи в CabinetComponent
                // УДАЛЕНО: compatiblePixelSteps, ipCode, mountPriceRub, deliveryPriceRub, addPriceRub
            },
            include: { // Включаем связанные данные для ответа
                 screenType: { select: { name: true } },
                 materials: { include: { material: { select: { code: true, name: true } } } },
                 components: {
                     select: {
                         quantity: true,
                         component: { select: { id: true, code: true, name: true, priceUsd: true, priceRub: true, category: true } }
                     }
                 }
             }
        });
        // Используем обновленный маппер для ответа
        const responseData = mapCabinetToResponse(newCabinet);
        res.status(201).json({ message: "Кабинет успешно создан", data: responseData });
    } catch (e: any) {
        // Обработка ошибок (например, дубликат SKU P2002)
        console.error(`Ошибка при создании кабинета ${sku}:`, e);
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
             return next(new Error(`Кабинет с SKU '${sku}' уже существует.`));
        }
        return next(e);
    }
});


// 📌 Обновление кабинета (ПЕРЕПИСАНО под новую схему)
export const updateCabinet = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    // TODO: Обновить updateCabinetSchema в validators! Ожидаем опциональные поля как в create.
    const validatedData = updateCabinetSchema.parse(req.body);
    const {
        sku, name, width, height, modulesCount, placement, priceUsd, // Поля Cabinet
        location, // Имя ScreenType (или null для отсоединения)
        materialCodes, // Массив кодов материалов (или пустой)
        components: componentsInput, // Массив компонентов { componentCode, quantity } (или пустой)
        // УДАЛЕНО: pixelStep, powerUnitCapacity, powerUnitQ, receiver, cooler, mountPriceRub, deliveryPriceRub, addPriceRub
        ...rest
     } = validatedData;


    if (Object.keys(validatedData).length === 0) {
        res.status(400).json({ message: "Нет данных для обновления" }); return;
    }

    // Данные для основного update (простые поля кабинета)
    const cabinetDataToUpdate: Prisma.CabinetUpdateInput = {}; // ИЗМЕНЕНО ТИП
    if (sku !== undefined) cabinetDataToUpdate.sku = sku;
    if (name !== undefined) cabinetDataToUpdate.name = name;
    if (width !== undefined) cabinetDataToUpdate.width = width;
    if (height !== undefined) cabinetDataToUpdate.height = height;
    if (modulesCount !== undefined) cabinetDataToUpdate.modulesCount = modulesCount;
    if (placement !== undefined) cabinetDataToUpdate.placement = placement;
    if (priceUsd !== undefined) cabinetDataToUpdate.priceUsd = priceUsd != null ? new Prisma.Decimal(priceUsd) : null;
    // УДАЛЕНО: mountPriceRub, deliveryPriceRub, addPriceRub


    try {
        // Используем транзакцию для атомарного обновления связей
        await prisma.$transaction(async (tx) => {

            // --- Обновление ScreenType (1-n) ---
            if (location !== undefined) { // Если поле location передано (может быть null)
                if (location === null) {
                     // Отсоединяем ScreenType
                     cabinetDataToUpdate.screenType = { disconnect: true };
                } else {
                    // Ищем и присоединяем новый ScreenType
                    const screenType = await tx.screenType.findUnique({ where: { name: location }, select: { id: true } });
                    if (!screenType) { throw new Error(`Тип экрана '${location}' не найден.`); }
                    cabinetDataToUpdate.screenType = { connect: { id: screenType.id } };
                }
            }

            // --- Обновление Материалов (M-N) через delete/create ---
            if (materialCodes !== undefined) { // Если передан массив materialCodes (может быть пустым)
                console.log(`Обновление материалов для кабинета ID: ${id}`);
                // 1. Удаляем все старые связи Cabinet <-> Material
                await tx.cabinetMaterial.deleteMany({
                    where: { cabinetId: id } // ИЗМЕНЕНО: cabinetConfigurationId -> cabinetId
                });
                console.log(` - Старые связи материалов удалены.`);

                 // 2. Если новый список не пустой, ищем материалы и готовим новые связи
                if (materialCodes.length > 0) {
                    const foundMaterials = await tx.material.findMany({
                        where: { code: { in: materialCodes } }, // Ищем по коду
                        select: { id: true, code: true }
                    });
                    // Проверяем, все ли коды найдены
                    if (foundMaterials.length !== materialCodes.length) {
                        const foundCodes = foundMaterials.map(m => m.code);
                        const notFound = materialCodes.filter(code => !foundCodes.includes(code));
                        throw new Error(`Следующие коды материалов не найдены: ${notFound.join(', ')}`);
                    }
                    // 3. Готовим данные для создания новых записей в CabinetMaterial
                    const materialsToCreate = foundMaterials.map(m => ({ materialId: m.id }));
                    cabinetDataToUpdate.materials = { create: materialsToCreate };
                    console.log(` - Новые связи материалов будут созданы: ${materialsToCreate.length} шт.`);
                } else {
                    // Если массив пустой, старые связи уже удалены, новые не создаем
                    console.log(` - Новых связей материалов для создания нет.`);
                    // Prisma обработает отсутствие 'materials' или 'create: []' корректно
                }
            }

            // --- Обновление PixelSteps (УДАЛЕНО) ---
            // Логика пропущена, так как связи нет в схеме.
            // if (pixelStepCodes !== undefined) {
                 console.warn(`[Update Cabinet ${id}] Логика обновления PixelStepDefinition пропущена (нет M-N связи в схеме).`);
            // }


            // --- Обновление Компонентов (M-N) через delete/create ---
            if (componentsInput !== undefined) { // Если передан массив componentsInput (может быть пустым)
                console.log(`Обновление компонентов для кабинета ID: ${id}`);
                const newComponentsToCreate: Prisma.CabinetComponentCreateWithoutCabinetInput[] = []; // ИЗМЕНЕНО ТИП

                // 1. Готовим список новых компонентов для связи
                 if (componentsInput.length > 0) {
                     for (const item of componentsInput) {
                         const { componentCode, quantity } = item;
                         if (!componentCode || !quantity || quantity <= 0) {
                            console.warn(`(Update Cabinet ${id}) Пропуск некорректного компонента:`, item);
                            continue;
                         };
                         const componentService = await tx.componentService.findUnique({ // ИЗМЕНЕНО: part -> componentService
                             where: { code: componentCode }, // Ищем по коду
                             select: { id: true }
                         });
                         if (componentService) {
                             newComponentsToCreate.push({
                                 quantity: quantity,
                                 component: { connect: { id: componentService.id } } // ИЗМЕНЕНО: part -> component
                             });
                         } else {
                             // Можно выдавать ошибку
                             console.warn(`(Update Cabinet ${id}) ComponentService с code='${componentCode}' не найден. Пропуск.`);
                             // throw new Error(`Компонент с кодом '${componentCode}' не найден.`);
                         }
                     }
                }

                // 2. Удаляем все старые связи Cabinet <-> Component
                await tx.cabinetComponent.deleteMany({
                    where: { cabinetId: id } // ИЗМЕНЕНО: cabinetConfigurationId -> cabinetId
                });
                console.log(` - Старые компоненты удалены.`);

                // 3. Если есть новые компоненты, добавляем операцию их создания
                if (newComponentsToCreate.length > 0) {
                    cabinetDataToUpdate.components = { create: newComponentsToCreate };
                    console.log(` - Новые компоненты будут созданы: ${newComponentsToCreate.length} шт.`);
                } else {
                     console.log(` - Новых компонентов для создания нет.`);
                }
           }

            // --- Выполнение основного обновления Cabinet ---
            // Обновляем только если есть что обновлять (простые поля или связи)
            if (Object.keys(cabinetDataToUpdate).length > 0) {
                 await tx.cabinet.update({ // ИЗМЕНЕНО: cabinetConfiguration -> cabinet
                     where: { id },
                     data: cabinetDataToUpdate
                 });
                 console.log(` - Основная запись Cabinet ID ${id} обновлена.`);
             } else {
                 console.log(` - Основная запись Cabinet ID ${id} не требовала обновления.`);
             }

        }); // Конец транзакции

        // --- Получаем обновленный кабинет и возвращаем результат ---
        const updatedCabinet = await prisma.cabinet.findUnique({ // ИЗМЕНЕНО: cabinetConfiguration -> cabinet
            where: { id },
            include: { // Включаем те же данные, что и в getCabinets
                 screenType: { select: { name: true } },
                 materials: { include: { material: { select: { code: true, name: true } } } },
                 components: {
                     select: {
                         quantity: true,
                         component: { select: { id: true, code: true, name: true, priceUsd: true, priceRub: true, category: true } }
                     }
                 }
             }
        });
        // Используем обновленный маппер
        const responseData = mapCabinetToResponse(updatedCabinet);
        res.status(200).json({ message: "Кабинет успешно обновлен", data: responseData });

    } catch (e: any) {
        // Обработка ошибок (P2025 - не найдено для update, P2002 - дубликат SKU)
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            res.status(404); return next(new Error(`Кабинет с ID ${id} не найден.`));
        }
         if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
             // Это может произойти, если пытаемся изменить SKU на уже существующий
             res.status(409); // Conflict
             return next(new Error(`Кабинет с таким SKU '${validatedData.sku}' уже существует.`));
        }
        console.error(`Ошибка при обновлении кабинета ID ${id}:`, e);
        return next(e);
    }
});


// 📌 Удаление кабинета (ПЕРЕПИСАНО под новую схему)
export const deleteCabinet = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);

    try {
        // 1. Проверяем существование кабинета
        const cabinetExists = await prisma.cabinet.findUnique({ // ИЗМЕНЕНО: cabinetConfiguration -> cabinet
            where: { id }, select: { id: true } // Достаточно проверить наличие ID
        });

        if (!cabinetExists) {
            res.status(404);
            return next(new Error(`Кабинет с ID ${id} не найден.`));
        }

        // 2. Проверка зависимостей (ОПЦИОНАЛЬНО, если onDelete: Cascade настроен)
        // В вашей схеме CabinetMaterial и CabinetComponent имеют onDelete: Cascade,
        // поэтому Prisma удалит их автоматически при удалении Cabinet.
        // Эти проверки нужны в основном для информации или если Cascade не настроен.

        /* // Закомментировано, т.к. Cascade должен сработать
        const relatedMaterialsCount = await prisma.cabinetMaterial.count({
             where: { cabinetId: id }, // ИЗМЕНЕНО: cabinetConfigurationId -> cabinetId
        });
        const relatedComponentsCount = await prisma.cabinetComponent.count({
            where: { cabinetId: id }, // ИЗМЕНЕНО: cabinetConfigurationId -> cabinetId
        });

        const blockingDependencies: string[] = [];
         if (relatedMaterialsCount > 0) {
             blockingDependencies.push(`материалы (${relatedMaterialsCount} шт. в 'CabinetMaterial')`);
         }
        if (relatedComponentsCount > 0) {
            blockingDependencies.push(`компоненты (${relatedComponentsCount} шт. в 'CabinetComponent')`);
        }

        if (blockingDependencies.length > 0) {
            // Если onDelete НЕ Cascade, здесь нужно выдавать ошибку 409 Conflict
            res.status(409);
            const dependencyString = blockingDependencies.join(' и ');
            const message = `Невозможно удалить кабинет с ID ${id}, так как существуют связанные ${dependencyString}. Удалите сначала зависимые записи или убедитесь, что настроено каскадное удаление.`;
            console.warn(message);
            return next(new Error(message));
        }
        */

        // 3. Удаляем кабинет
        // Связанные записи в CabinetMaterial и CabinetComponent будут удалены автоматически (из-за onDelete: Cascade)
        await prisma.cabinet.delete({
            where: { id } // ИЗМЕНЕНО: cabinetConfiguration -> cabinet
        });

        res.status(200).json({ message: "Кабинет успешно удален" });

    } catch (e: any) {
        console.error(`Ошибка при попытке удаления кабинета ID ${id}:`, e);
        // Обработка P2025 (если кабинет удалили между findUnique и delete)
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
             res.status(404); return next(new Error(`Кабинет с ID ${id} не найден (ошибка при удалении).`));
        }
         // Обработка P2003 (Foreign key constraint failed - если onDelete НЕ Cascade или Restrict)
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
             res.status(409); // Conflict
             return next(new Error(`Невозможно удалить кабинет с ID ${id}, так как на него ссылаются другие записи. Удалите сначала зависимые записи.`));
        }
        // Другие ошибки
        return next(e);
    }
});