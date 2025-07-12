// prisma/seed/seedRelations.ts
import { PrismaClient, Prisma } from '../generated/client';
const prisma = new PrismaClient();
type PrismaModelName = keyof Omit<PrismaClient, `$${string}` | symbol>;
import * as XLSX from 'xlsx';
import { getDataFromSheet } from './utils';
import { relationMNConfigs, relationCountConfigs, IdMaps } from './config';
import type { SeedMode } from './index';

/**
 * Заполняет связующие таблицы M-N и таблицы с количеством.
 * Для простых M-N использует createMany({ skipDuplicates: true }) в обоих режимах.
 * Для связей с количеством использует createMany (clear) или upsert (upsert).
 * @param prisma Экземпляр PrismaClient
 * @param workbook Рабочая книга Excel
 * @param idMaps Объект с картами ID (содержащий Map'ы с lowercase ключами)
 * @param mode Режим сидинга ('clear' или 'upsert')
 */
export async function seedRelations(
    prisma: PrismaClient,
    workbook: XLSX.WorkBook,
    idMaps: IdMaps,
    mode: SeedMode
): Promise<void> {
    console.log('\n--- Начало заполнения связующих таблиц ---');
    const startTime = Date.now();
    const allPromises: Promise<any>[] = [];

    // --- Обработка простых связей M-N (таблицы без доп. полей) ---
    console.log('\n--- Обработка простых связей M-N (используется createMany+skipDuplicates) ---');
    for (const config of relationMNConfigs) {
        console.log(`\n--- Связь M-N: ${config.modelName} (Лист: ${config.sheetName}) ---`);

        // Проверка наличия обязательных полей в конфиге
        if (!config.field1 || !config.field2 || !config.field1.mapRef || !config.field2.mapRef || !config.field1.mapKey || !config.field2.mapKey) {
            console.error(`[${config.modelName} Config Error] Неполная конфигурация для связи M-N (отсутствует field1/field2 или mapRef/mapKey).`);
            continue;
        }

        const sheetData = getDataFromSheet(workbook, config.sheetName);
        if (sheetData.length === 0) {
            console.log(`  - ${config.modelName}: Лист '${config.sheetName}' пуст или не найден.`);
            continue;
        }

        // Получаем модель Prisma, используя as any для работы с динамическим доступом
        const model = prisma[config.modelName as PrismaModelName] as any;
        if (!model || typeof model.createMany !== 'function') {
            console.error(`[${config.modelName} Prisma Error] Модель Prisma '${config.modelName}' или метод createMany не найдены.`);
            continue;
        }

        // Получаем карты ID, используя mapRef (имя модели) как ключ для idMaps
        const mapRefKey1 = String(config.field1.mapRef).charAt(0).toLowerCase() + String(config.field1.mapRef).slice(1);
        const mapRefKey2 = String(config.field2.mapRef).charAt(0).toLowerCase() + String(config.field2.mapRef).slice(1);

        const map1 = (idMaps as any)[mapRefKey1] as Map<string, number> | undefined;
        const map2 = (idMaps as any)[mapRefKey2] as Map<string, number> | undefined;

        if (!map1 || !map2) {
            console.error(`[${config.modelName} Error] Не найдены карты в idMaps: Требуется карта '${mapRefKey1}' (для mapRef: '${config.field1.mapRef}') и карта '${mapRefKey2}' (для mapRef: '${config.field2.mapRef}').`);
            continue;
        }


        const dataToCreateMN: any[] = [];
        let skippedCountMN = 0;
        const processedPairsMN = new Set<string>();

        for (const row of sheetData) {
            const key1Raw = row[config.field1.excelCol] ? String(row[config.field1.excelCol]).trim() : null;
            const key2Raw = row[config.field2.excelCol] ? String(row[config.field2.excelCol]).trim() : null;

            // Пропускаем, если хотя бы один ключ пуст
            if (!key1Raw || !key2Raw) {
                continue;
            }

            // Используем lowercase ключи для проверки дубликатов и поиска в картах
            const lookupKey1Lower = key1Raw.toLowerCase();
            const lookupKey2Lower = key2Raw.toLowerCase();

            // Проверка дубликатов в Excel (по lowercase)
            const compositeKey = `${lookupKey1Lower}_${lookupKey2Lower}`;
            if (processedPairsMN.has(compositeKey)) {
                continue;
            }
            processedPairsMN.add(compositeKey);

            // Проверяем, существуют ли записи с такими lowercase ключами в картах
            const key1Exists = map1.has(lookupKey1Lower);
            const key2Exists = map2.has(lookupKey2Lower);

            if (key1Exists && key2Exists) {
                dataToCreateMN.push({
                    [config.field1.prismaField]: key1Raw,
                    [config.field2.prismaField]: key2Raw
                });
            } else {
                skippedCountMN++;
            }
        }

        if (skippedCountMN > 0) {
            console.warn(`  - ${config.modelName}: Пропущено ${skippedCountMN} строк (M-N) из-за отсутствия одного из ключей в картах ID.`);
        }

        // Вставляем все подготовленные данные для этой таблицы через createMany
        if (dataToCreateMN.length > 0) {
            allPromises.push(
                model.createMany({
                    data: dataToCreateMN,
                    skipDuplicates: true, // Важно для обоих режимов
                }).then((result: Prisma.BatchPayload) => {
                    console.log(`  - ${config.modelName}: Создано ${result.count} новых связей (M-N) (из ${dataToCreateMN.length} валидных).`);
                }).catch((e: any) => {
                    console.error(`[${config.modelName} createMany Error M-N]`, e.message || e);
                    // console.error(`[${config.modelName} createMany Error M-N Data]:`, dataToCreateMN.slice(0, 5)); // Лог данных для отладки
                })
            );
        } else {
            console.log(`  - ${config.modelName}: Нет валидных связей M-N для добавления.`);
        }
    } // --- конец цикла по конфигам M-N ---


    // --- Обработка связей с количеством ---
    console.log('\n--- Обработка связей с количеством ---');
    for (const config of relationCountConfigs) {
        console.log(`\n--- Связь с количеством: ${config.modelName} (Лист: ${config.sheetName}) ---`);

        // Проверка конфига
        if (!config.entityField || !config.itemField || !config.countField || !config.entityField.mapRef || !config.itemField.mapRef) {
            console.error(`[${config.modelName} Config Error] Неполная конфигурация для связи с количеством (отсутствует entityField/itemField/countField или mapRef).`);
            continue;
        }

        const sheetData = getDataFromSheet(workbook, config.sheetName);
        if (sheetData.length === 0) {
            console.log(`  - ${config.modelName}: Лист '${config.sheetName}' пуст или не найден.`);
            continue;
        }

        // Получаем модель Prisma
        const model = prisma[config.modelName as PrismaModelName] as any;
        if (!model || (mode === 'clear' && typeof model.createMany !== 'function') || (mode === 'upsert' && typeof model.upsert !== 'function')) {
            console.error(`[${config.modelName} Prisma Error] Модель Prisma '${config.modelName}' или необходимый метод (createMany/upsert для режима ${mode}) не найдены.`);
            continue;
        }

        // Получаем карты ID
        const entityMapKey = config.entityField.mapRef;
        const itemMapKey = config.itemField.mapRef;
        const entityMap = (idMaps as any)[entityMapKey] as Map<string, number> | undefined;
        const itemMap = (idMaps as any)[itemMapKey] as Map<string, number> | undefined;
        if (!entityMap || !itemMap) {
            console.error(`[${config.modelName} Error Count] Не найдены карты ID: '${entityMapKey}' или '${itemMapKey}'`);
            continue;
        }

        const dataToCreateCount: any[] = []; // Только для режима 'clear'
        const upsertPromisesCount: Promise<any>[] = []; // Только для режима 'upsert'
        let skippedCountCount = 0;
        let upsertedCount = 0; // Счетчик для upsert
        const processedPairsCount = new Set<string>(); // Для дубликатов Excel (lowercase)

        for (const row of sheetData) {
            // Получаем коды (оригинальный регистр)
            const entityCodeRaw = row[config.entityField.excelCol] ? String(row[config.entityField.excelCol]).trim() : null;
            const itemCodeRaw = row[config.itemField.excelCol] ? String(row[config.itemField.excelCol]).trim() : null;

            // Пропускаем, если коды пустые
            if (!entityCodeRaw || !itemCodeRaw) {
                continue;
            }

            // Получаем и проверяем количество
            const quantity = config.countField.transform(row[config.countField.excelCol], `${config.modelName} ${entityCodeRaw}-${itemCodeRaw}`);
            if (quantity === null || quantity <= 0) {
                continue;
            }

            // Ключи для поиска в картах и проверки дубликатов (lowercase)
            const entityKeyLower = entityCodeRaw.toLowerCase();
            const itemKeyLower = itemCodeRaw.toLowerCase();

            // Проверка дубликатов в Excel
            const compositeKey = `${entityKeyLower}_${itemKeyLower}`;
            if (processedPairsCount.has(compositeKey)) { continue; }
            processedPairsCount.add(compositeKey);

            // Проверяем существование связанных сущностей
            const entityExists = entityMap.has(entityKeyLower);
            const itemExists = itemMap.has(itemKeyLower);

            if (entityExists && itemExists) {
                // Данные для создания/обновления (используем оригинальные коды)
                const createPayload = {
                    [config.entityField.prismaField]: entityCodeRaw,
                    [config.itemField.prismaField]: itemCodeRaw,
                    [config.countField.prismaField]: quantity,
                };
                const updatePayload = { // Обновляем только количество
                    [config.countField.prismaField]: quantity,
                };

                if (mode === 'upsert') {
                    // Формируем where для upsert на основе @@id([field1, field2])
                    // Синтаксис: { field1_field2: { field1: val1, field2: val2 } }
                    const whereUniqueKey = `${config.entityField.prismaField}_${config.itemField.prismaField}`;
                    const whereUniquePayload = {
                        [whereUniqueKey]: {
                            [config.entityField.prismaField]: entityCodeRaw,
                            [config.itemField.prismaField]: itemCodeRaw,
                        }
                    };

                    upsertPromisesCount.push(
                        model.upsert({
                            where: whereUniquePayload,
                            create: createPayload,
                            update: updatePayload,
                        }).then(() => {
                            upsertedCount++;
                        }).catch((e: any) => {
                            console.error(`[${config.modelName} Upsert Error Count] Key: ${entityCodeRaw}-${itemCodeRaw}. Error:`, e.code, e.message);
                            skippedCountCount++;
                            processedPairsCount.delete(compositeKey); // Удаляем из обработанных при ошибке
                        })
                    );
                } else { // режим 'clear'
                    dataToCreateCount.push(createPayload);
                }
            } else {
                skippedCountCount++;
            }
        }

        if (skippedCountCount > 0) {
            console.warn(`  - ${config.modelName}: Пропущено ${skippedCountCount} строк (с количеством) из-за отсутствия ключей/ошибки upsert.`);
        }

        // Выполняем операции в зависимости от режима
        if (mode === 'upsert') {
            // Добавляем ожидание всех промисов upsert в общий массив
            allPromises.push(
                Promise.all(upsertPromisesCount).then(() => {
                    if (upsertedCount > 0) { // Логируем только если были операции
                        console.log(`  - ${config.modelName}: Создано/Обновлено ${upsertedCount} связей (с количеством).`);
                    } else if (processedPairsCount.size > 0 && skippedCountCount === 0) {
                        console.log(`  - ${config.modelName}: Все ${processedPairsCount.size} валидные связи (с количеством) уже существуют и актуальны.`);
                    } else if (processedPairsCount.size === 0 && skippedCountCount === 0) {
                        console.log(`  - ${config.modelName}: Нет валидных связей (с количеством) для создания/обновления.`);
                    }
                }).catch(e => {
                    // Эта ошибка не должна произойти, так как catch есть внутри push, но на всякий случай
                    console.error(`[${config.modelName} Promise.all Upsert Error Count]`, e);
                })
            );
        } else { // режим 'clear'
            if (dataToCreateCount.length > 0) {
                allPromises.push(
                    model.createMany({
                        data: dataToCreateCount,
                        skipDuplicates: true, // На случай, если дубликаты как-то просочились
                    }).then((result: Prisma.BatchPayload) => {
                        console.log(`  - ${config.modelName}: Создано ${result.count} новых связей (с количеством) (из ${dataToCreateCount.length} валидных).`);
                    }).catch((e: any) => {
                        console.error(`[${config.modelName} createMany Error Count]`, e.message || e);
                        // console.error(`[${config.modelName} createMany Error Count Data]:`, dataToCreateCount.slice(0, 5));
                    })
                );
            } else {
                console.log(`  - ${config.modelName}: Нет валидных связей (с количеством) для добавления.`);
            }
        }

    } // --- конец цикла по конфигам с количеством ---

    // Ожидаем завершения всех операций (createMany для M-N, createMany/Promise.all для связей с количеством)
    try {
        await Promise.all(allPromises);
    } catch (error) {
        // Ошибки должны быть пойманы внутри .catch() у каждого промиса, но добавим общий catch
        console.error("\n--- Произошла ошибка при ожидании завершения всех операций в seedRelations ---", error);
    }

    const endTime = Date.now();
    console.log(`\n✅ Заполнение связующих таблиц завершено за ${(endTime - startTime) / 1000} сек.`);
}