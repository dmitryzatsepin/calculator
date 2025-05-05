// prisma/seed/index.ts
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

// Импортируем наши модули сидинга
import { clearDatabase } from '../seed/clearDatabase';
import { createIdMaps } from './config'; // Импортируем функцию создания карт
import { seedReferences } from '../seed/seedReferences';
import { seedEntities } from '../seed/seedEntities';
import { seedRelations } from '../seed/seedRelations';
import { seedPrices } from './seedPrices';

const prisma = new PrismaClient();

// Определяем режим сидинга
export type SeedMode = 'clear' | 'upsert';
let seedMode: SeedMode = 'clear'; // Режим по умолчанию

// Простой парсер аргументов
const args = process.argv.slice(2);
const modeArg = args.find(arg => arg.startsWith('--mode=') || arg.startsWith('-m='));
if (modeArg) {
    const modeValue = modeArg.split('=')[1];
    if (modeValue === 'upsert') {
        seedMode = 'upsert';
    } else if (modeValue !== 'clear') {
        console.warn(`⚠️ Неизвестный режим '--mode=${modeValue}'. Используется режим по умолчанию: 'clear'.`);
    }
} else if (args.includes('--upsert') || args.includes('-u')) { // Альтернативный флаг
     seedMode = 'upsert';
}

console.log(`🌱 Начало выполнения скрипта сидинга в режиме: ${seedMode.toUpperCase()}`);


async function main() {
    const startTime = Date.now();

    // 1. Проверка и чтение Excel файла
    const excelFilePath = path.resolve(__dirname, '../../data/database.xlsx');
    console.log(`[Main] Используется Excel файл: ${excelFilePath}`);
    if (!fs.existsSync(excelFilePath)) {
        console.error(`❌ КРИТИЧЕСКАЯ ОШИБКА: Файл Excel не найден по пути: ${excelFilePath}`);
        process.exit(1);
    }
    let workbook: XLSX.WorkBook;
    try {
        workbook = XLSX.readFile(excelFilePath);
        console.log('[Main] Файл Excel успешно прочитан.');
    } catch (e) {
         console.error(`❌ КРИТИЧЕСКАЯ ОШИБКА: Не удалось прочитать файл Excel:`, e);
         process.exit(1);
    }

    // 2. Очистка базы данных (ТОЛЬКО В РЕЖИМЕ 'clear')
    if (seedMode === 'clear') {
        try {
            await clearDatabase(prisma);
        } catch (e) {
            console.error(`❌ Ошибка на этапе очистки базы данных. Выполнение прервано.`);
            process.exit(1);
        }
    } else {
        console.log(`ℹ️ Пропуск очистки базы данных (режим: ${seedMode.toUpperCase()}).`);
    }


    // 3. Создание карт ID (всегда нужно)
    const idMaps = createIdMaps();
    console.log('[Main] Карты ID созданы (будут заполнены/использованы).');

    // 4. Сидинг Справочников (использует upsert в соответствующем режиме)
    try {
        // Передаем режим в функцию сидинга
        await seedReferences(prisma, workbook, idMaps, seedMode);
    } catch (e) {
         console.error(`❌ Ошибка на этапе сидинга справочников. Выполнение прервано.`);
         process.exit(1);
    }

    // 5. Сидинг Основных Сущностей (использует upsert в соответствующем режиме)
    try {
         // Передаем режим в функцию сидинга
        await seedEntities(prisma, workbook, idMaps, seedMode);
    } catch (e) {
         console.error(`❌ Ошибка на этапе сидинга основных сущностей. Выполнение прервано.`);
         process.exit(1);
    }

    // 6. Сидинг Связей (использует upsert/createMany в соответствующем режиме)
    try {
        // Передаем режим в функцию сидинга
        await seedRelations(prisma, workbook, idMaps, seedMode);
        await seedPrices(prisma, workbook, idMaps, seedMode);
    } catch (e) {
         console.error(`❌ Ошибка на этапе сидинга связей. Выполнение прервано.`);
         process.exit(1);
    }

    const endTime = Date.now();
    console.log(`\n🏁 Общее время выполнения сидинга (${seedMode.toUpperCase()}): ${(endTime - startTime) / 1000} сек.`);
    console.log('🎉 Скрипт сидинга успешно завершен!');
}

// Запуск и обработка финальных ошибок/отключения
main()
  .catch((e) => {
    console.error('\n💥 НЕПРЕДВИДЕННАЯ ОШИБКА В main():', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('--- [Main] Отключение от БД ---');
    await prisma.$disconnect();
    console.log('--- [Main] Отключение от БД завершено ---');
  });