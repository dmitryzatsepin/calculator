import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
const prisma = new PrismaClient();

// Проверка обязательных полей
function validateRequiredFields(data: Record<string, unknown>[], requiredFields: string[], sheetName: string): boolean {
  if (data.length === 0) {
    console.warn(`⚠️ Лист ${sheetName} пуст`);
    return false; // Лист пуст, но это не ошибка формата
  }

  // 1. Проверка наличия заголовков
  const firstRow = data[0];
  const missingHeaders = requiredFields.filter(field => !(field in firstRow));
  if (missingHeaders.length > 0) {
    console.error(`❌ В листе ${sheetName} отсутствуют обязательные колонки Excel: ${missingHeaders.join(', ')}`);
    return false; // Ошибка: нет нужных колонок
  }

  // 2. Проверка наличия данных в обязательных полях для КАЖДОЙ строки
  let allRowsValid = true; // Флаг, что все строки валидны
  // Добавляем явные типы для row и index
  data.forEach((row: Record<string, unknown>, index: number) => {
    for (const field of requiredFields) {
      // Проверяем 'name' как обязательное поле для PartPrice, если оно в requiredFields
      const isNameField = (sheetName === 'PartsPrice' && field === 'name');

      if (row[field] === null || row[field] === undefined || String(row[field]).trim() === '') {
         // Если это обязательное поле 'name' для PartsPrice - это ошибка
         if (isNameField) {
             console.error(`❌ Ошибка: В листе ${sheetName}, строка ${index + 2} (Excel нумерация), отсутствует значение в уникальной колонке '${field}'. Строка будет пропущена.`);
             allRowsValid = false; // Считаем это ошибкой для данной строки
         } else {
             // Для других полей просто предупреждаем
             console.warn(`⚠️ Предупреждение: В листе ${sheetName}, строка ${index + 2}, отсутствует значение в поле '${field}'.`);
         }
      }
    }
  });

  // Возвращаем true, только если все строки прошли валидацию обязательных полей (особенно 'name' для PartPrice)
  return allRowsValid;
}


async function importFromExcel(filePath: string): Promise<void> {
  try {
    console.log(`🔍 Импорт данных из файла: ${filePath}`);
    
    // Проверяем существование файла

    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    
    // Читаем Excel файл
    
    const workbook = XLSX.readFile(filePath);
    console.log('👀 Найденные листы в файле:', workbook.SheetNames);

    // Импортируем типы экранов

    try {
      const screenTypesSheetName = 'ScreenTypes';
      if (workbook.SheetNames.includes(screenTypesSheetName)) {
          const screenTypesSheet = workbook.Sheets[screenTypesSheetName];
          const screenTypes: Record<string, unknown>[] = XLSX.utils.sheet_to_json(screenTypesSheet);
          if (validateRequiredFields(screenTypes, ['name', 'material', 'option'], screenTypesSheetName)) { // Добавил material/option в проверку
              await prisma.screenType.deleteMany({});
              for (const row of screenTypes) {
                  const optionArray = row.option ? String(row.option).split(',').map(s => s.trim()) : [];
                  const materialArray = row.material ? String(row.material).split(',').map(s => s.trim()) : [];
                  await prisma.screenType.create({
                      data: {
                          name: String(row.name),
                          option: { set: optionArray },
                          material: { set: materialArray }
                      }
                  });
              }
              console.log('✅ Типы экранов успешно импортированы');
          }
      } else {
          console.warn(`⚠️ Лист ${screenTypesSheetName} не найден в Excel-файле`);
      }
    } catch (e) {
        console.error('❌ Ошибка при импорте ScreenTypes:', e);
    }
    
    // Импортируем шаги пикселей

    try {
      const pixelStepsSheetName = 'PixelSteps';
      if (workbook.SheetNames.includes(pixelStepsSheetName)) {
          const pixelStepsSheet = workbook.Sheets[pixelStepsSheetName];
          const pixelSteps: Record<string, unknown>[] = XLSX.utils.sheet_to_json(pixelStepsSheet);
           // Обновляем обязательные поля для PixelSteps
          const requiredPixelFields = ['name', 'type', 'width', 'height', 'location', 'brightness', 'refreshFreq', 'priceUsd'];
          if (validateRequiredFields(pixelSteps, requiredPixelFields, pixelStepsSheetName)) {
              await prisma.pixelStep.deleteMany({});
              for (const row of pixelSteps) {
                  const optionArray = row.option ? String(row.option).split(',').map(s => s.trim()) : [];
                  await prisma.pixelStep.create({
                      data: {
                          name: String(row.name),
                          type: String(row.type),
                          width: Number(row.width),
                          height: Number(row.height),
                          brightness: Number(row.brightness ?? 0),
                          refreshFreq: Number(row.refreshFreq ?? 60),
                          location: String(row.location),
                          option: { set: optionArray },
                          priceUsd: Number(row.priceUsd ?? 0) // Используем priceUsd (из Prisma) <= priceUsd (из Excel)
                      }
                  });
              }
              console.log('✅ Шаги пикселей успешно импортированы');
          }
      } else {
          console.warn(`⚠️ Лист ${pixelStepsSheetName} не найден в Excel-файле`);
      }
    } catch (e) {
        console.error('❌ Ошибка при импорте PixelSteps:', e);
    }
    
    // Импортируем кабинеты

    try {
      const cabinetsSheetName = 'Cabinets';
      if (workbook.SheetNames.includes(cabinetsSheetName)) {
          const cabinetsSheet = workbook.Sheets[cabinetsSheetName];
          const cabinets: Record<string, unknown>[] = XLSX.utils.sheet_to_json(cabinetsSheet);
          // Обновляем обязательные поля для Cabinets
          const requiredCabinetFields = [
              'name', 'width', 'height', 'powerUnit', 'powerUnitCapacity', 'powerUnitQ',
              'receiver', 'cooler', 'modulesQ', 'location', 'material', 'pixelStep',
              'placement', 'priceUsd', 'mountPriceRub', 'deliveryPriceRub', 'addPriceRub'
          ];
          if (validateRequiredFields(cabinets, requiredCabinetFields, cabinetsSheetName)) {
              await prisma.cabinet.deleteMany({});
              for (const row of cabinets) {
                  const pixelStepArray = row.pixelStep ? String(row.pixelStep).split(',').map(s => s.trim()) : [];
                  const materialArray = row.material ? String(row.material).split(',').map(s => s.trim()) : [];
                  await prisma.cabinet.create({
                      data: {
                          name: String(row.name),
                          width: Number(row.width),
                          height: Number(row.height),
                          modulesQ: Number(row.modulesQ),
                          powerUnit: String(row.powerUnit), // Убедитесь, что prisma generate выполнен!
                          powerUnitCapacity: Number(row.powerUnitCapacity),
                          powerUnitQ: Number(row.powerUnitQ),
                          receiver: Number(row.receiver),
                          cooler: Number(row.cooler),
                          location: String(row.location),
                          material: { set: materialArray },
                          placement: String(row.placement),
                          pixelStep: { set: pixelStepArray },
                          priceUsd: Number(row.priceUsd ?? 0),      // Используем priceUsd (из Prisma) <= priceUsd (из Excel)
                          mountPriceRub: Number(row.mountPriceRub ?? 0),
                          deliveryPriceRub: Number(row.deliveryPriceRub ?? 0),
                          addPriceRub: Number(row.addPriceRub ?? 0)
                      }
                  });
              }
              console.log('✅ Кабинеты успешно импортированы');
          }
      } else {
          console.warn(`⚠️ Лист ${cabinetsSheetName} не найден в Excel-файле`);
      }
    } catch (e) {
        console.error('❌ Ошибка при импорте Cabinets:', e);
    }
    
    // 🔥 Импортируем таблицу IP-кодов (защиты)

    try {
      const ipSheetName = 'IngressProtection';
      if (workbook.SheetNames.includes(ipSheetName)) {
          const ipProtectionSheet = workbook.Sheets[ipSheetName];
          const ipProtection: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ipProtectionSheet);
          if (validateRequiredFields(ipProtection, ['code', 'hardObjectProtection', 'waterProtection'], ipSheetName)) {
              await prisma.ingressProtection.deleteMany({});
              for (const row of ipProtection) {
                  await prisma.ingressProtection.create({
                      data: {
                          code: String(row.code),
                          hardObjectProtection: String(row.hardObjectProtection),
                          waterProtection: String(row.waterProtection),
                      }
                  });
              }
              console.log('✅ Данные IP-защиты успешно импортированы');
          }
      } else {
          console.warn(`⚠️ Лист ${ipSheetName} не найден в Excel-файле`);
      }
    } catch (e) {
        console.error('❌ Ошибка при импорте IngressProtection:', e);
    }

    // Импортируем цены на комплектующие

    try {
      const partsSheetName = 'PartsPrice';
      if (workbook.SheetNames.includes(partsSheetName)) {
          const sheet = workbook.Sheets[partsSheetName];
          const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: null });
          const requiredExcelCols = ['name', 'nameEn', 'priceUsd', 'priceRub'];

          if (validateRequiredFields(rows, requiredExcelCols, partsSheetName)) {
              console.log(`⏳ Очистка таблицы PartPrice...`);
              await prisma.partPrice.deleteMany({}); // Убедитесь, что prisma generate выполнен!

              console.log(`⏳ Запись данных из листа '${partsSheetName}'...`);
              let createdCount = 0;
              let skippedCount = 0;

              for (const row of rows) {
                  const nameValue = row.name ? String(row.name).trim() : null;
                  const nameEnValue = row.nameEn ? String(row.nameEn).trim() : "";
                  const priceUsdValue = (row.priceUsd != null) ? Number(row.priceUsd) : 0;
                  const priceRubValue = (row.priceRub != null) ? Number(row.priceRub) : 0;

                  // Пропускаем строку, если уникальное поле 'name' пустое
                  if (!nameValue) {
                      // Сообщение об ошибке уже выведено в validateRequiredFields
                      skippedCount++;
                      continue;
                  }

                  try {
                      await prisma.partPrice.create({ // Убедитесь, что prisma generate выполнен!
                          data: {
                              name: nameValue,           // Поле 'name' в Prisma <= колонка 'name' в Excel
                              nameEn: nameEnValue,       // Поле 'nameEn' в Prisma <= колонка 'nameEn' в Excel
                              priceUsd: priceUsdValue,   // Поле 'priceUsd' в Prisma <= колонка 'priceUsd' в Excel
                              priceRub: priceRubValue,   // Поле 'priceRub' в Prisma <= колонка 'priceRub' в Excel
                          }
                      });
                      createdCount++;
                  } catch (e: any) {
                      if (e.code === 'P2002' && e.meta?.target?.includes('name')) {
                          console.error(`❌ Ошибка уникальности: Попытка вставить дублирующую запись с name='${nameValue}'. Строка пропущена.`);
                      } else {
                          console.error(`❌ Ошибка при создании записи PartPrice для '${nameValue}':`, e);
                      }
                      skippedCount++;
                  }
              }
              console.log(`✅ Цены (${partsSheetName}): создано ${createdCount}, пропущено ${skippedCount}.`);
          }
      } else {
          console.warn(`⚠️ Лист ${partsSheetName} не найден.`);
      }
    } catch (e) {
        console.error('❌ Ошибка при импорте PartPrice:', e);
    }
    

    console.log('🎉 Импорт данных успешно завершен!');
  } catch (error) {
    console.error('❌ Ошибка при импорте данных:', error);
    throw error;
  }
}

// Основная функция
async function main() {
  try {
    const defaultPath = path.resolve(__dirname, '../data/database.xlsx');
    console.log(`🌱 Заполняем базу данных из Excel: ${defaultPath}`);
    
    await importFromExcel(defaultPath);
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем основную функцию
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });