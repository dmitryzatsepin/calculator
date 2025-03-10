import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
const prisma = new PrismaClient();

// Проверка обязательных полей
function validateRequiredFields(data: Record<string, unknown>[], requiredFields: string[], sheetName: string): boolean {
  if (data.length === 0) {
    console.warn(`⚠️ Лист ${sheetName} пуст`);
    return false;
  }
  
  const firstRow = data[0];
  const missingFields = requiredFields.filter(field => !(field in firstRow));
  
  if (missingFields.length > 0) {
    console.error(`❌ В листе ${sheetName} отсутствуют обязательные поля: ${missingFields.join(', ')}`);
    return false;
  }
  
  return true;
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
    
    // Импортируем типы экранов
    if (workbook.SheetNames.includes('ScreenTypes')) {
      const screenTypesSheet = workbook.Sheets['ScreenTypes'];
      const screenTypes: Record<string, unknown>[] = XLSX.utils.sheet_to_json(screenTypesSheet);
      
      // Проверяем обязательные поля
      if (validateRequiredFields(screenTypes, ['name'], 'ScreenTypes')) {
        // Очищаем таблицу перед вставкой
        await prisma.screenType.deleteMany({});
        
        // Вставляем данные по одному
        for (const row of screenTypes) {
          // Преобразуем option и material в массивы строк
          const optionArray = row.option 
            ? String(row.option).split(',').map(s => s.trim()) 
            : [];
          const materialArray = row.material 
            ? String(row.material).split(',').map(s => s.trim()) 
            : [];
            
          await prisma.screenType.create({
            data: {
              name: String(row.name),
              option: {set: optionArray},
              material: {set: materialArray}
            }
          });
        }
        
        console.log('✅ Типы экранов успешно импортированы');
      }
    } else {
      console.warn('⚠️ Лист ScreenTypes не найден в Excel-файле');
    }
    
    // Импортируем шаги пикселей
    if (workbook.SheetNames.includes('PixelSteps')) {
      const pixelStepsSheet = workbook.Sheets['PixelSteps'];
      const pixelSteps: Record<string, unknown>[] = XLSX.utils.sheet_to_json(pixelStepsSheet);
      
      // Проверяем обязательные поля
      if (validateRequiredFields(pixelSteps, ['name', 'type', 'width', 'height'], 'PixelSteps')) {
        // Очищаем таблицу перед вставкой
        await prisma.pixelStep.deleteMany({});
        
        // Вставляем данные по одному
        for (const row of pixelSteps) {
          // Преобразуем option в массив строк
          const optionArray = row.option 
            ? String(row.option).split(',').map(s => s.trim()) 
            : [];
            
          await prisma.pixelStep.create({
            data: {
              name: String(row.name),
              type: String(row.type),
              width: Number(row.width),
              height: Number(row.height),
              brightness: row.brightness ? Number(row.brightness) : 0,  // ✅ Проверяем, есть ли значение
              refreshFreq: row.refreshFreq ? Number(row.refreshFreq) : 60, // ✅ Если NaN, ставим 60 Гц
              location: String(row.location),
              option: {set: optionArray},
              priceUsd: row.priceUsd ? Number(row.priceUsd) : 0
            }
          });
        }
        
        console.log('✅ Шаги пикселей успешно импортированы');
      }
    } else {
      console.warn('⚠️ Лист PixelSteps не найден в Excel-файле');
    }
    
    // Импортируем кабинеты
    if (workbook.SheetNames.includes('Cabinets')) {
      const cabinetsSheet = workbook.Sheets['Cabinets'];
      const cabinets: Record<string, unknown>[] = XLSX.utils.sheet_to_json(cabinetsSheet);
      
      // Проверяем обязательные поля
      const requiredCabinetFields = ['name', 'width', 'height', 'modulesQ', 'powerUnitCapacity', 'powerUnitQ', 'receiver', 'cooler'];
      
      if (validateRequiredFields(cabinets, requiredCabinetFields, 'Cabinets')) {
        // Очищаем таблицу перед вставкой
        await prisma.cabinet.deleteMany({});
        
        // Вставляем данные по одному
        for (const row of cabinets) {
          // Преобразуем pixelStep в массив строк
          const pixelStepArray = row.pixelStep 
            ? String(row.pixelStep).split(',').map(s => s.trim()) 
            : [];
            const materialArray = row.material 
            ? String(row.material).split(',').map(s => s.trim()) 
            : [];  
            
          await prisma.cabinet.create({
            data: {
              name: String(row.name),
              width: Number(row.width),
              height: Number(row.height),
              modulesQ: Number(row.modulesQ),
              powerUnitCapacity: Number(row.powerUnitCapacity),
              powerUnitQ: Number(row.powerUnitQ),
              receiver: Number(row.receiver),
              cooler: Number(row.cooler),
              location: String(row.location),
              material: {set: materialArray},
              placement: String(row.placement),
              pixelStep: {set: pixelStepArray},
              priceUsd: row.priceUsd ? Number(row.priceUsd) : 0,
              mountPriceRub: row.mountPriceRub ? Number(row.mountPriceRub) : 0,
              deliveryPriceRub: row.deliveryPriceRub ? Number(row.deliveryPriceRub) : 0,
              addPriceRub: row.addPriceRub ? Number(row.addPriceRub) : 0
            }
          });
        }
        
        console.log('✅ Кабинеты успешно импортированы');
      }
    } else {
      console.warn('⚠️ Лист Cabinets не найден в Excel-файле');
    }
    
        // 🔥 Импортируем таблицу IP-кодов (защиты)
        if (workbook.SheetNames.includes('IngressProtection')) {
          const ipProtectionSheet = workbook.Sheets['IngressProtection'];
          const ipProtection: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ipProtectionSheet);
    
          // Проверяем обязательные поля
          if (validateRequiredFields(ipProtection, ['code', 'hardObjectProtection', 'waterProtection'], 'IPProtection')) {
            // Очищаем таблицу перед вставкой
            await prisma.ingressProtection.deleteMany({});
    
            // Вставляем данные по одному
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
          console.warn('⚠️ Лист IngressProtection не найден в Excel-файле');
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