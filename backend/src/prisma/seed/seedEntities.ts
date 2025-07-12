// prisma/seed/seedEntities.ts
import { PrismaClient } from '../generated/client';
const prisma = new PrismaClient();
type PrismaModelName = keyof Omit<PrismaClient, `$${string}` | symbol>;
import * as XLSX from 'xlsx';
import { getDataFromSheet, safeBoolean, safeInt, safeDecimal } from './utils';
import { entityConfigs, type IdMaps } from './config';
import type { SeedMode } from './index';

/**
 * @param prisma Экземпляр PrismaClient
 * @param workbook Рабочая книга Excel
 * @param idMaps Объект с картами ID (будет заполняться)
 * @param mode Режим сидинга ('clear' или 'upsert')
 */
export async function seedEntities(
    prisma: PrismaClient,
    workbook: XLSX.WorkBook,
    idMaps: IdMaps,
    mode: SeedMode
): Promise<void> {
    console.log('\n--- Начало заполнения основных сущностей (Cabinet, Module, Item) ---');
    const startTime = Date.now();

    for (const config of entityConfigs) {
        console.log(`\n--- Обработка: ${config.modelName} (Лист: ${config.sheetName}) ---`);
        const sheetData = getDataFromSheet(workbook, config.sheetName);
        if (sheetData.length === 0) continue;

        const model = prisma[config.modelName as PrismaModelName] as any;
        const modelMapKey = config.modelName;
        const idMap = (idMaps as any)[modelMapKey] as Map<string, number> | undefined;

        if (!idMap) {
            console.error(`[${config.modelName} Error] Карта ID для '${modelMapKey}' не найдена в idMaps.`);
            continue;
        }

        const processedKeysLower = new Set<string>();
        let upsertedCount = 0;
        let skippedCount = 0;
        const upsertPromises: Promise<any>[] = [];

        for (const row of sheetData) {
            const codeRaw = row[config.codeField.excelCol] ? String(row[config.codeField.excelCol]).trim() : null;
            if (!codeRaw) {
                // console.warn(`[${config.modelName}] Пропуск строки: отсутствует ${config.codeField.excelCol}`, row);
                skippedCount++;
                continue;
            }
            const codeLower = codeRaw.toLowerCase();

            if (processedKeysLower.has(codeLower)) {
                continue;
            }
            processedKeysLower.add(codeLower);

            const createData: { [key: string]: any } = {};
            const updateData: { [key: string]: any } = {};

            createData[config.codeField.prismaField] = codeRaw;

            // SKU
            if (config.skuField && row[config.skuField.excelCol] != null) {
                const skuVal = String(row[config.skuField.excelCol]).trim();
                createData[config.skuField.prismaField] = skuVal;
                updateData[config.skuField.prismaField] = skuVal;
            }
            // Name
            if (config.nameField && row[config.nameField.excelCol] != null) {
                const nameVal = String(row[config.nameField.excelCol]).trim();
                createData[config.nameField.prismaField] = nameVal;
                updateData[config.nameField.prismaField] = nameVal;
            }
            // Active
            const activeVal = config.activeField
                ? (config.activeField.transform
                    ? config.activeField.transform(row[config.activeField.excelCol], `${config.modelName} ${codeRaw}`)
                    : safeBoolean(row[config.activeField.excelCol], `${config.modelName} ${codeRaw}`))
                : true;
            createData[config.activeField?.prismaField ?? 'active'] = activeVal;
            updateData[config.activeField?.prismaField ?? 'active'] = activeVal;

            // Other fields
            if (config.otherFields) {
                for (const field of config.otherFields) {
                    const excelValue = row[field.excelCol];
                    const valueToUse = (excelValue === null || excelValue === undefined || String(excelValue).trim() === '') ? field.defaultValue : excelValue;
                    const prismaValue = field.transform
                        ? field.transform(valueToUse, `${config.modelName} ${codeRaw} ${field.prismaField}`)
                        : (valueToUse !== null && valueToUse !== undefined ? String(valueToUse).trim() : null);
                    if (prismaValue !== null || field.defaultValue !== undefined) {
                        createData[field.prismaField] = prismaValue;
                        updateData[field.prismaField] = prismaValue; // 
                    }
                }
            }

            // Выполняем Upsert
            upsertPromises.push(
                model.upsert({
                    where: { [config.codeField.prismaField]: codeRaw },
                    create: createData,
                    update: updateData,
                }).then((result: any) => {
                    idMap.set(codeLower, result.id);
                    upsertedCount++;
                }).catch((e: any) => {
                    console.error(`[${config.modelName} Upsert Error] Ошибка при обработке кода '${codeRaw}'. Данные Create:`, createData, "Update:", updateData, "Ошибка:", e);
                    skippedCount++;
                    processedKeysLower.delete(codeLower);
                })
            );

        }

        // Ожидаем завершения всех upsert операций для данной таблицы
        await Promise.all(upsertPromises);

        console.log(`  - ${config.modelName}: Обработано ${processedKeysLower.size} уникальных строк Excel.`);
        if (skippedCount > 0) {
            console.log(`    - Пропущено строк (пустой ключ или ошибка upsert): ${skippedCount}.`);
        }
        console.log(`    - Создано/Обновлено записей: ${upsertedCount}.`);
        console.log(`    - Карта ID '${modelMapKey}' содержит ${idMap.size} записей.`);


    }

    const endTime = Date.now();
    console.log(`✅ Заполнение основных сущностей завершено за ${(endTime - startTime) / 1000} сек.`);
}