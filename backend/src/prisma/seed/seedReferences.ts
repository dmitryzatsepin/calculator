// prisma/seed/seedReferences.ts
import { PrismaClient } from '../generated/client';
const prisma = new PrismaClient();
type PrismaModelName = keyof Omit<PrismaClient, `$${string}` | symbol>;
import * as XLSX from 'xlsx';
import { getDataFromSheet, safeBoolean, safeInt, safeDecimal } from './utils';
import { referenceConfigs, IdMaps } from './config';
import type { SeedMode } from './index'; // Импортируем тип режима

/**
 * Заполняет справочные таблицы.
 * В режиме 'clear' использует createMany (хотя upsert тоже будет работать).
 * В режиме 'upsert' использует prisma.upsert для каждой строки.
 * Заполняет карты ID в обоих режимах.
 */
export async function seedReferences(
    prisma: PrismaClient,
    workbook: XLSX.WorkBook,
    idMaps: IdMaps,
    mode: SeedMode // Принимаем режим
): Promise<void> {
    console.log('\n--- Начало заполнения справочников ---');
    const startTime = Date.now();

    for (const config of referenceConfigs) {
        console.log(`\n--- Обработка: ${config.modelName} (Лист: ${config.sheetName}) ---`);
        const sheetData = getDataFromSheet(workbook, config.sheetName);
        if (sheetData.length === 0) continue;

        const model = prisma[config.modelName as PrismaModelName] as any;
        const modelMapKey = String(config.modelName).charAt(0).toLowerCase() + String(config.modelName).slice(1);
        const idMap = (idMaps as any)[modelMapKey] as Map<string, number> | undefined;

        if (!idMap) {
            console.error(`[${config.modelName} Error] Карта ID для '${modelMapKey}' не найдена в idMaps.`);
            continue;
        }

        const processedKeysLower = new Set<string>(); // Для дубликатов в Excel
        let upsertedCount = 0;
        let skippedCount = 0;
        const upsertPromises: Promise<any>[] = []; // Массив для промисов upsert

        for (const row of sheetData) {
            const keyField = config.codeField;
            if (!keyField) {
                console.error(`[${config.modelName} Config Error] Не указано обязательное поле codeField`);
                continue;
            }

            const rawValue = row[keyField.excelCol];
            const uniqueKeyRaw = rawValue; // Оригинальное значение
            const uniqueKeyLower = rawValue ? String(rawValue).trim().toLowerCase() : null; // Ключ для карты и проверки дублей

            if (uniqueKeyLower === null) {
                // console.warn(`[${config.modelName}] Пропуск строки: ключ '${keyField.excelCol}' пуст`, row);
                skippedCount++;
                continue;
            }
            if (processedKeysLower.has(uniqueKeyLower)) {
                // console.warn(`[${config.modelName} Duplicate Excel] Ключ '${uniqueKeyRaw}' уже обработан из этого листа.`);
                continue;
            }
            processedKeysLower.add(uniqueKeyLower);

            // Собираем данные для create и update
            const createData: { [key: string]: any } = {};
            const updateData: { [key: string]: any } = {};

            // Ключ (code) - только для create, не для update
            createData[keyField.prismaField] = String(uniqueKeyRaw).trim();

            // Имя
            if (config.nameField) {
                const nameVal = String(row[config.nameField.excelCol] ?? '').trim();
                createData[config.nameField.prismaField] = nameVal;
                updateData[config.nameField.prismaField] = nameVal;
            }

            // Значение (value)
            if (config.valueField) {
                const value = config.valueField.transform
                    ? config.valueField.transform(row[config.valueField.excelCol], `${config.modelName} ${uniqueKeyRaw} ${config.valueField.prismaField}`)
                    : row[config.valueField.excelCol];
                if (value === null || value === undefined) {
                    console.warn(`[${config.modelName}] Пропуск (значение): некорректное значение '${row[config.valueField.excelCol]}' для '${uniqueKeyRaw}'.`);
                    processedKeysLower.delete(uniqueKeyLower); // Не считать обработанным
                    skippedCount++;
                    continue;
                }
                createData[config.valueField.prismaField] = value;
                updateData[config.valueField.prismaField] = value;
            }

            // Active
            const activeVal = config.activeField
                ? (config.activeField.transform
                    ? config.activeField.transform(row[config.activeField.excelCol], `${config.modelName} ${uniqueKeyRaw}`)
                    : safeBoolean(row[config.activeField.excelCol], `${config.modelName} ${uniqueKeyRaw}`))
                : true;
            createData[config.activeField?.prismaField ?? 'active'] = activeVal;
            updateData[config.activeField?.prismaField ?? 'active'] = activeVal;

            // Другие поля
            if (config.otherFields) {
                for (const field of config.otherFields) {
                    const excelValue = row[field.excelCol];
                    const valueToUse = (excelValue === null || excelValue === undefined || String(excelValue).trim() === '') ? field.defaultValue : excelValue;
                    const prismaValue = field.transform
                        ? field.transform(valueToUse, `${config.modelName} ${uniqueKeyRaw} ${field.prismaField}`)
                        : (valueToUse !== null && valueToUse !== undefined ? String(valueToUse).trim() : null);
                    if (prismaValue !== null || field.defaultValue !== undefined) {
                        createData[field.prismaField] = prismaValue;
                        updateData[field.prismaField] = prismaValue; // Обновляем и другие поля
                    }
                }
            }

            // Выполняем Upsert
            upsertPromises.push(
                (prisma[config.modelName as PrismaModelName] as any).upsert({
                    where: { [keyField.prismaField]: String(uniqueKeyRaw).trim() }, // Ищем по уникальному коду
                    create: createData,
                    update: updateData,
                }).then((result: any) => {
                    idMap.set(uniqueKeyLower, result.id); // Сразу заполняем карту ID
                    upsertedCount++;
                }).catch((e: any) => {
                    console.error(`[${config.modelName} Upsert Error] Ошибка при обработке кода '${uniqueKeyRaw}'. Данные Create:`, createData, "Update:", updateData, "Ошибка:", e);
                    skippedCount++;
                    processedKeysLower.delete(uniqueKeyLower); // Удаляем из обработанных при ошибке
                })
            );

        } // конец цикла по строкам Excel

        // Ожидаем завершения всех upsert операций для данной таблицы
        await Promise.all(upsertPromises);

        console.log(`  - ${config.modelName}: Обработано ${processedKeysLower.size} уникальных строк Excel.`);
        if (skippedCount > 0) {
            console.log(`    - Пропущено строк (пустой ключ или ошибка значения/upsert): ${skippedCount}.`);
        }
        console.log(`    - Создано/Обновлено записей: ${upsertedCount}.`);
        console.log(`    - Карта ID '${modelMapKey}' содержит ${idMap.size} записей.`);

    } // конец цикла по конфигурациям

    const endTime = Date.now();
    console.log(`✅ Заполнение справочников завершено за ${(endTime - startTime) / 1000} сек.`);
}