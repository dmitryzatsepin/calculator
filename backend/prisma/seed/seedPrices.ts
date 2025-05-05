// prisma/seed/seedPrices.ts
import { PrismaClient, Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import { getDataFromSheet, safeDecimal } from './utils'; // Убедитесь, что safeDecimal импортирован
import { priceConfigs, IdMaps } from './config'; // Импортируем конфиг цен
import type { SeedMode } from './index'; // Импортируем тип режима

/**
 * Заполняет таблицы цен (ItemPrice, CabinetPrice, ModulePrice).
 * Использует prisma.upsert для каждой строки.
 * @param prisma Экземпляр PrismaClient
 * @param workbook Рабочая книга Excel
 * @param idMaps Объект с картами ID (только для проверки существования сущности)
 * @param mode Режим сидинга ('clear' или 'upsert') - влияет только на логирование в данном случае
 */
export async function seedPrices(
    prisma: PrismaClient,
    workbook: XLSX.WorkBook,
    idMaps: IdMaps,
    mode: SeedMode
): Promise<void> {
    console.log(`\n--- Начало заполнения таблиц цен (Режим: ${mode.toUpperCase()}) ---`);
    const startTime = Date.now();
    const allPromises: Promise<any>[] = [];

    for (const config of priceConfigs) {
        console.log(`\n--- Обработка цен: ${config.modelName} (Лист: ${config.sheetName}) ---`);

        // Проверка конфига
        if (!config.entityField || !config.usdField || !config.entityField.mapRef) {
            console.error(`[${config.modelName} Config Error] Неполная конфигурация для цен.`);
            continue;
        }

        const sheetData = getDataFromSheet(workbook, config.sheetName);
        if (sheetData.length === 0) continue;

        const model = prisma[config.modelName] as any;
        if (!model || typeof model.upsert !== 'function') {
            console.error(`[${config.modelName} Prisma Error] Модель Prisma '${config.modelName}' или метод upsert не найдены.`);
            continue;
        }

        // Получаем карту ID для связанной сущности (item, module или cabinet)
        const entityMapKey = config.entityField.mapRef;
        const entityMap = (idMaps as any)[entityMapKey] as Map<string, number> | undefined;
        if (!entityMap) {
            console.error(`[${config.modelName} Error Prices] Не найдена карта ID: '${entityMapKey}'`);
            continue;
        }

        let upsertedCount = 0;
        let skippedCount = 0;
        const upsertPromises: Promise<any>[] = [];
        const processedEntityCodes = new Set<string>(); // Для проверки дубликатов сущностей в Excel

        for (const row of sheetData) {
            const entityCodeRaw = row[config.entityField.excelCol] ? String(row[config.entityField.excelCol]).trim() : null;
            if (!entityCodeRaw) {
                skippedCount++;
                continue; // Пропускаем строки без кода сущности
            }
             const entityCodeLower = entityCodeRaw.toLowerCase();

             // Проверка дубликатов entityCode в листе Excel
             if (processedEntityCodes.has(entityCodeLower)) {
                 console.warn(`[${config.modelName} Duplicate Price] Цена для сущности '${entityCodeRaw}' уже обработана из этого листа.`);
                 continue;
             }
             processedEntityCodes.add(entityCodeLower);


            // Проверяем, существует ли основная сущность
            if (!entityMap.has(entityCodeLower)) {
                console.warn(`[${config.modelName} Skip Price] Сущность '${entityCodeRaw}' (ключ: ${entityCodeLower}) не найдена в карте '${entityMapKey}'. Цена не будет добавлена/обновлена.`);
                skippedCount++;
                continue;
            }

            // Получаем значения цен
            const priceUsd = config.usdField.transform(row[config.usdField.excelCol], `${config.modelName} ${entityCodeRaw} USD`);
            const priceRub = config.rubField
                ? config.rubField.transform(row[config.rubField.excelCol], `${config.modelName} ${entityCodeRaw} RUB`)
                : undefined; // Используем undefined, если rubField не задан

            // Если обе цены null, пропускаем (или можно создавать запись с null ценами?)
            // if (priceUsd === null && priceRub === null) {
            //     skippedCount++;
            //     continue;
            // }

            // Собираем данные (используем оригинальный код сущности)
            const entityPrismaField = config.entityField.prismaField; // e.g., 'moduleCode'
            const createData: { [key: string]: any } = {
                [entityPrismaField]: entityCodeRaw,
                [config.usdField.prismaField]: priceUsd,
            };
            const updateData: { [key: string]: any } = {
                 [config.usdField.prismaField]: priceUsd,
            };

            // Добавляем рублевую цену, если она есть
            if (config.rubField && priceRub !== undefined) {
                 createData[config.rubField.prismaField] = priceRub;
                 updateData[config.rubField.prismaField] = priceRub;
            }

             // Where условие для upsert (по внешнему ключу)
             const wherePayload = {
                 [entityPrismaField]: entityCodeRaw
             };

             // Выполняем Upsert
             upsertPromises.push(
                 model.upsert({
                     where: wherePayload,
                     create: createData,
                     update: updateData,
                 }).then(() => {
                     upsertedCount++;
                 }).catch((e: any) => {
                      console.error(`[${config.modelName} Upsert Error Price] Сущность: '${entityCodeRaw}'. Error:`, e.code, e.message);
                      skippedCount++;
                      processedEntityCodes.delete(entityCodeLower);
                 })
             );

        } // конец цикла по строкам

         // Добавляем ожидание всех промисов upsert для этой таблицы в общий массив
         allPromises.push(
             Promise.all(upsertPromises).then(() => {
                 console.log(`  - ${config.modelName}: Обработано ${processedEntityCodes.size} уникальных сущностей.`);
                  if (skippedCount > 0) {
                     console.log(`    - Пропущено строк (нет кода/сущности или ошибка upsert): ${skippedCount}.`);
                 }
                 console.log(`    - Создано/Обновлено записей цен: ${upsertedCount}.`);
             }).catch(e => console.error(`[${config.modelName} Promise.all Upsert Error Price]`, e))
         );

    } // конец цикла по конфигам цен

    // Ожидаем завершения всех операций с ценами
    try {
        await Promise.all(allPromises);
    } catch (error) {
        console.error("\n--- Произошла ошибка при ожидании завершения всех операций в seedPrices ---", error);
    }

    const endTime = Date.now();
    console.log(`\n✅ Заполнение таблиц цен завершено за ${(endTime - startTime) / 1000} сек.`);
}