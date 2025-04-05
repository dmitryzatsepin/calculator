import { PrismaClient, Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

console.log('--- Используемая строка подключения DATABASE_URL:', process.env.DATABASE_URL?.replace(/:(.+?)@/, ':*****@') ?? 'Не установлена!');

// --- Функция чтения листа (игнорирует вторую строку заголовка) ---
function getDataFromSheet(workbook: XLSX.WorkBook, sheetName: string): any[] {
    if (!workbook.SheetNames.includes(sheetName)) {
        console.warn(`⚠️ Лист ${sheetName} не найден в Excel-файле. Пропуск.`);
        return [];
    }
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null });
    // *** Игнорируем вторую строку Excel (первый элемент в jsonData) ***
    const dataWithoutSecondHeader = jsonData.slice(1);
    console.log(`  - Прочитано строк из ${sheetName} (после пропуска 2-го заголовка): ${dataWithoutSecondHeader.length}`);
    return dataWithoutSecondHeader;
}

// --- Вспомогательные функции для безопасного преобразования ---
function safeDecimal(value: any, context: string): Decimal | null {
    if (value == null || value === '') { return null; }
    // Попробуем заменить запятую на точку для десятичных разделителей
    const normalizedValue = typeof value === 'string' ? value.replace(',', '.') : value;
    if (typeof normalizedValue === 'number' || (typeof normalizedValue === 'string' && !isNaN(parseFloat(normalizedValue)) && isFinite(Number(normalizedValue)))) {
        try { return new Decimal(normalizedValue); }
        catch (e) { console.error(`❌ ${context}: Ошибка конвертации значения '${value}' (норм: '${normalizedValue}') в Decimal`, e); return null; }
    } else { console.warn(`⚠️ ${context}: Некорректное значение для Decimal: '${value}'. Будет использовано null.`); return null; }
}
function safeInt(value: any, context: string, allowZero: boolean = true, allowNull: boolean = true): number | null {
     if (value == null || value === '') { return allowNull ? null : (allowZero ? 0 : null); }
     // Убираем возможные пробелы
     const trimmedValue = typeof value === 'string' ? value.trim() : value;
     const num = Number(trimmedValue);
     if (!isNaN(num) && Number.isInteger(num)) {
         if (!allowZero && num === 0) { console.warn(`⚠️ ${context}: Нулевое значение не разрешено для '${value}'. Будет использовано null.`); return null; }
         return num;
     } else { console.warn(`⚠️ ${context}: Некорректное целочисленное значение: '${value}'. Будет использовано ${allowNull ? 'null' : (allowZero ? '0' : 'null')}.`); return allowNull ? null : (allowZero ? 0 : null); }
}

// --- Основная функция импорта ---
async function importDataFromExcel(filePath: string): Promise<void> {
    console.log(`🔍 Начало импорта из файла: ${filePath}`);
    if (!fs.existsSync(filePath)) throw new Error(`Файл не найден: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log('👀 Найденные листы:', sheetNames);

    // --- 0. Чтение данных ---
    console.log("Чтение данных из Excel...");
    const materialsData = getDataFromSheet(workbook, 'materials');
    const optionsData = getDataFromSheet(workbook, 'options');
    const manufacturersData = getDataFromSheet(workbook, 'manufacturers');
    const screenTypesData = getDataFromSheet(workbook, 'screen_types');
    const screenTypeMaterialsData = getDataFromSheet(workbook, 'screen_type_materials');
    const screenTypeOptionsData = getDataFromSheet(workbook, 'screen_type_options');
    const cabinetsData = getDataFromSheet(workbook, 'cabinets');
    const cabinetOptionsSheetName = sheetNames.includes('cabinet_options') ? 'cabinet_options' : 'cabinet_materials';
    if (!sheetNames.includes('cabinet_options') && sheetNames.includes('cabinet_materials')) console.warn("ℹ️ Лист 'cabinet_options' не найден, используется 'cabinet_materials'.");
    else if (!sheetNames.includes('cabinet_options') && !sheetNames.includes('cabinet_materials')) console.warn("⚠️ Листы 'cabinet_options' и 'cabinet_materials' не найдены.");
    const cabinetOptionsData = getDataFromSheet(workbook, cabinetOptionsSheetName);
    const cabinetComponentsData = getDataFromSheet(workbook, 'cabinet_components');
    const modulesData = getDataFromSheet(workbook, 'modules');
    const pixelStepsData = getDataFromSheet(workbook, 'pixel_steps');       // code @unique + step (Decimal)
    const pixelTypesData = getDataFromSheet(workbook, 'pixel_types');       // type @unique + frequency
    const pixelOptionsData = getDataFromSheet(workbook, 'pixel_options');   // code + type + width + height + screen_type + option_name
    const ipProtectionData = getDataFromSheet(workbook, 'ip_protection');
    const componentPriceData = getDataFromSheet(workbook, 'component_and_service_price');
    console.log("Чтение Excel завершено.");

    // --- 1. Очистка таблиц ---
    console.log('Очистка таблиц...');
    try {
        // Сначала зависимые от PixelStepDefinition
        await prisma.module.deleteMany();
        await prisma.pixelOption.deleteMany();
        // Затем сам PixelStepDefinition
        await prisma.pixelStepDefinition.deleteMany(); // Новая модель
        // Остальные зависимости
        await prisma.cabinetComponent.deleteMany();
        await prisma.cabinetMaterial.deleteMany(); // Использует таблицу cabinet_materials
        await prisma.screenTypeOption.deleteMany();
        await prisma.screenTypeMaterial.deleteMany();
        await prisma.cabinet.deleteMany();
        await prisma.pixelType.deleteMany();
        await prisma.componentService.deleteMany();
        await prisma.ipProtection.deleteMany();
        await prisma.screenType.deleteMany();
        await prisma.manufacturer.deleteMany();
        await prisma.option.deleteMany();
        await prisma.material.deleteMany();
        console.log('Очистка таблиц завершена.');
    } catch(e) { console.error("❌ Ошибка при очистке таблиц:", e); throw e; }

    // --- 2. Заполнение справочников и карт ---
    console.log('Заполнение базовых справочников...');
    const materialMap = new Map<string, number>(); // code -> id
    const optionMap = new Map<string, number>(); // code -> id
    const optionNameMap = new Map<string, number>(); // name -> id (Для связи из pixel_options)
    const manufacturerMap = new Map<string, number>(); // code -> id
    const screenTypeMap = new Map<string, number>(); // name -> id
    const ipCodeMap = new Map<string, number>(); // code -> id
    const componentCodeMap = new Map<string, number>(); // code -> id
    const pixelTypeMap = new Map<string, number>(); // type -> id (SMD -> 1)
    // Карта для PixelStepDefinition (уникальные шаги)
    const pixelStepDefinitionMap = new Map<string, number>(); // code -> id
    const cabinetSkuMap = new Map<string, number>(); // sku -> id

    try {
        // --- Material ---
        for (const row of materialsData) {
            const code = row.material_code ? String(row.material_code) : null;
            if (!code) { console.warn("[Material] Пропуск: нет code"); continue; }
            try {
                const created = await prisma.material.create({ data: { code: code, name: String(row.material_name ?? '') } });
                materialMap.set(created.code, created.id);
            } catch(e) { console.error(`[Material Error] '${code}'`, e); }
        }
        console.log(`  - Создано Material: ${materialMap.size}`);

        // --- Option ---
        for (const row of optionsData) {
            const code = row.option_code ? String(row.option_code) : null;
            const name = row.option_name ? String(row.option_name) : null;
            if (!code || !name) { console.warn("[Option] Пропуск: нет code или name", row); continue; }
             try {
                // Проверяем уникальность имени перед добавлением
                if (optionNameMap.has(name)) {
                    console.error(`[Option Error] Дублирующееся имя опции '${name}'. Пропуск строки:`, row);
                    continue;
                }
                const created = await prisma.option.create({ data: { code: code, name: name } });
                optionMap.set(created.code, created.id);
                optionNameMap.set(created.name, created.id); // Заполняем карту имен
            } catch(e) { console.error(`[Option Error] Ошибка создания code:'${code}', name:'${name}'`, e); }
        }
        console.log(`  - Создано Option: ${optionMap.size}`);

        // --- Manufacturer ---
        for (const row of manufacturersData) {
            const code = row.manufacturer_code ? String(row.manufacturer_code) : null;
            if (!code) { console.warn("[Manufacturer] Пропуск: нет code"); continue; }
            try {
                const created = await prisma.manufacturer.create({ data: { code: code, name: String(row.manufacturer_name ?? '') } });
                manufacturerMap.set(created.code, created.id);
            } catch(e) { console.error(`[Manufacturer Error] '${code}'`, e); }
        }
        console.log(`  - Создано Manufacturer: ${manufacturerMap.size}`);

        // --- ScreenType ---
        for (const row of screenTypesData) {
            const name = row.screen_type ? String(row.screen_type) : null;
            if (!name) { console.warn("[ScreenType] Пропуск: нет name"); continue; }
            const brightness = safeInt(row.screen_brightness, `ScreenType ${name} brightness`);
            try {
                const created = await prisma.screenType.create({ data: { name: name, brightness: brightness } });
                screenTypeMap.set(created.name, created.id);
            } catch(e) { console.error(`[ScreenType Error] '${name}'`, e); }
        }
        console.log(`  - Создано ScreenType: ${screenTypeMap.size}`);

        // --- IpProtection ---
        for (const row of ipProtectionData) {
            const code = row.ip_code ? String(row.ip_code) : null;
            if (!code) { console.warn("[IpProtection] Пропуск: нет code"); continue; }
            try {
                const created = await prisma.ipProtection.create({ data: {
                    code: code, protectionSolid: String(row.protection_solid ?? ''), protectionWater: String(row.protection_water ?? '')
                }});
                ipCodeMap.set(created.code, created.id);
            } catch(e) { console.error(`[IpProtection Error] '${code}'`, e); }
        }
        console.log(`  - Создано IpProtection: ${ipCodeMap.size}`);

        // --- ComponentService ---
        for (const row of componentPriceData) {
             const code = row.component_code ? String(row.component_code) : null;
             if (!code) { console.warn("[ComponentService] Пропуск: нет code", row); continue; }
             const priceUsd = safeDecimal(row.price_usd, `Component ${code} price_usd`);
             const priceRub = safeDecimal(row.price_rub, `Component ${code} price_rub`);
             try {
                 const created = await prisma.componentService.create({ data: {
                     category: row.component_category ? String(row.component_category) : null,
                     code: code, name: String(row.component_name ?? ''), priceUsd: priceUsd, priceRub: priceRub,
                 }});
                 componentCodeMap.set(created.code, created.id);
             } catch(dbError) { console.error(`[ComponentService Error] '${code}'`, dbError); }
         }
        console.log(`  - Создано ComponentService: ${componentCodeMap.size}`);

        // --- PixelType ---
        for (const row of pixelTypesData) {
            const type = row.pixel_type ? String(row.pixel_type) : null;
            if (!type) { console.warn("[PixelType] Пропуск: нет type.", row); continue; }
            const frequency = safeInt(row.pixel_frequency, `PixelType ${type} frequency`);
            try {
                const created = await prisma.pixelType.create({ data: { type: type, frequency: frequency } });
                pixelTypeMap.set(created.type, created.id); // Сохраняем по имени типа
            } catch(e) {
                 if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                     console.warn(`[PixelType Warn] Тип '${type}' уже существует. Получаем ID.`);
                     const existing = await prisma.pixelType.findUnique({ where: { type: type } });
                     if (existing) pixelTypeMap.set(existing.type, existing.id);
                 } else { console.error(`[PixelType Error] Ошибка создания '${type}'`, e); }
            }
        }
        console.log(`  - Создано/Загружено PixelType: ${pixelTypeMap.size}`);

        // --- PixelStepDefinition (из листа pixel_steps) ---
        console.log(`--- Начало создания PixelStepDefinition ---`);
        for (const row of pixelStepsData) {
            const code = row.pixel_code ? String(row.pixel_code) : null;
            if (!code) { console.warn("[PixelStepDefinition] Пропуск: нет pixel_code.", row); continue; }

            const stepDecimal = safeDecimal(row.pixel_step, `PixelStep ${code} stepValue`);
            if (stepDecimal === null) {
                console.warn(`[PixelStepDefinition] Пропуск '${code}': pixel_step не является числом (${row.pixel_step}).`);
                continue;
            }

            try {
                const created = await prisma.pixelStepDefinition.create({
                    data: { code: code, stepValue: stepDecimal }
                });
                pixelStepDefinitionMap.set(created.code, created.id);
            } catch (e) {
                 if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                     console.warn(`[PixelStepDefinition Warn] Код '${code}' уже существует. Получаем ID.`);
                     const existing = await prisma.pixelStepDefinition.findUnique({ where: { code: code } });
                     if (existing) pixelStepDefinitionMap.set(existing.code, existing.id);
                 } else { console.error(`[PixelStepDefinition Error] Ошибка создания '${code}'`, e); }
            }
        }
        console.log(`--- Завершение создания PixelStepDefinition ---`);
        console.log(`  - Создано/Загружено PixelStepDefinition: ${pixelStepDefinitionMap.size}`);


        // --- PixelOption (из листа pixel_options) ---
        console.log(`--- Начало создания PixelOption ---`);
        let pixelOptionsCreatedCount = 0;
        for (const row of pixelOptionsData) {
            const pixelCode = row.pixel_code ? String(row.pixel_code) : null;
            if (!pixelCode) { console.warn("[PixelOption] Пропуск: нет pixel_code.", row); continue; }

            // Проверяем, существует ли pixelCode в PixelStepDefinition (критично для связи)
            if (!pixelStepDefinitionMap.has(pixelCode)) {
                console.warn(`[PixelOption] Пропуск: pixel_code '${pixelCode}' не найден в справочнике PixelStepDefinition.`, row);
                continue;
            }

            const pixelTypeName = row.pixel_type ? String(row.pixel_type) : null;
            const pixelTypeId = pixelTypeName ? pixelTypeMap.get(pixelTypeName) : undefined;
            if (pixelTypeName && pixelTypeId === undefined) { console.warn(`[PixelOption] pixel_code '${pixelCode}': не найден ID для pixel_type '${pixelTypeName}'.`); }

            const screenTypeName = row.screen_type ? String(row.screen_type) : null;
            const screenTypeId = screenTypeName ? screenTypeMap.get(screenTypeName) : undefined;
            if (screenTypeName && screenTypeId === undefined) { console.warn(`[PixelOption] pixel_code '${pixelCode}': не найден ID для screen_type '${screenTypeName}'.`); }

            const moduleWidth = safeInt(row.module_width, `PixelOption ${pixelCode} module_width`, false, false);
            const moduleHeight = safeInt(row.module_height, `PixelOption ${pixelCode} module_height`, false, false);
            if (moduleWidth === null || moduleHeight === null) { console.warn(`[PixelOption] Пропуск '${pixelCode}': невалидные module_width/height.`); continue; }

            const optionNameFromExcel = row.option_name ? String(row.option_name) : null;
            if (optionNameFromExcel && !optionNameMap.has(optionNameFromExcel)) { console.warn(`[PixelOption] pixel_code '${pixelCode}': опция '${optionNameFromExcel}' не найдена в справочнике.`); }

            const dataToCreate: Prisma.PixelOptionCreateInput = {
                stepDefinition: { connect: { code: pixelCode } }, // Связь по УНИКАЛЬНОМУ коду
                moduleWidth: moduleWidth,
                moduleHeight: moduleHeight,
                optionName: optionNameFromExcel,
                ...(pixelTypeId !== undefined && { pixelType: { connect: { id: pixelTypeId } } }),
                ...(screenTypeId !== undefined && { screenType: { connect: { id: screenTypeId } } }),
            };

            // console.log(`[PixelOption Debug] Попытка создания для '${pixelCode}' с данными: ${JSON.stringify(dataToCreate)}`); // Можно раскомментировать для отладки

            try {
                // ID не сохраняем, он автоинкрементный
                await prisma.pixelOption.create({ data: dataToCreate });
                pixelOptionsCreatedCount++;
            } catch (e) {
                 console.error(`[PixelOption Error] Ошибка создания для pixel_code '${pixelCode}'`, e);
            }
        }
        console.log(`--- Завершение создания PixelOption ---`);
        console.log(`  - Создано PixelOption: ${pixelOptionsCreatedCount}`);

        console.log('Заполнение базовых справочников завершено.');


        // --- 3. Заполнение зависимых таблиц (Module, Cabinet) ---
        console.log('Заполнение зависимых таблиц...');

        let modulesCreatedCount = 0;
        for (const row of modulesData) {
            const moduleSku = row.module_sku ? String(row.module_sku) : null;
            if (!moduleSku) { console.warn("[Module] Пропуск: нет sku.", row); continue; }

            const screenTypeName = row.screen_type ? String(row.screen_type) : null;
            const screenTypeId = screenTypeName ? screenTypeMap.get(screenTypeName) : null;

            const manufacturerCode = row.manufacturer ? String(row.manufacturer) : null;
            const pixelCode = row.pixel_code ? String(row.pixel_code) : null; // Уникальный код шага

            // Критичные проверки
            if (!screenTypeId) { console.warn(`(Module ${moduleSku}) ScreenType '${screenTypeName ?? 'null'}' не найден. Пропуск.`); continue; }
            // Проверяем наличие УНИКАЛЬНОГО pixelCode в PixelStepDefinition
            if (!pixelCode || !pixelStepDefinitionMap.has(pixelCode)) {
                console.warn(`(Module ${moduleSku}) PixelStepDefinition с кодом '${pixelCode ?? 'null'}' не найден. Пропуск.`);
                continue;
            }
            if (manufacturerCode && !manufacturerMap.has(manufacturerCode)) { console.warn(`(Module ${moduleSku}) Manufacturer '${manufacturerCode}' не найден.`); }

            const priceUsd = safeDecimal(row.price_usd, `Module ${moduleSku} price_usd`);
            // Берем размеры из самого модуля
            const moduleWidth = safeInt(row.module_width, `Module ${moduleSku} module_width`, false, false);
            const moduleHeight = safeInt(row.module_height, `Module ${moduleSku} module_height`, false, false);
            if (moduleWidth === null || moduleHeight === null) { console.warn(`(Module ${moduleSku}) Пропуск: невалидные module_width/height.`); continue; }
            const moduleFrequency = safeInt(row.module_frequency, `Module ${moduleSku} frequency`);
            const moduleBrightness = safeInt(row.module_brightness, `Module ${moduleSku} brightness`);

            const moduleData: Prisma.ModuleCreateInput = {
                 sku: moduleSku, type: row.module_type ? String(row.module_type) : null,
                 moduleWidth: moduleWidth, moduleHeight: moduleHeight, // Размеры из модуля
                 moduleFrequency: moduleFrequency, moduleBrightness: moduleBrightness,
                 priceUsd: priceUsd,
                 screenType: { connect: { id: screenTypeId } },
                 stepDefinition: { connect: { code: pixelCode } }, // Связь с УНИКАЛЬНЫМ шагом
                 ...(manufacturerCode && manufacturerMap.has(manufacturerCode) && { manufacturer: { connect: { code: manufacturerCode } } })
             };

            try {
                 await prisma.module.create({ data: moduleData });
                 modulesCreatedCount++;
            } catch (e) {
                 if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                     console.warn(`[Module Warn] Модуль SKU '${moduleSku}' уже существует. Пропуск.`);
                 } else { console.error(`[Module Error] Ошибка создания '${moduleSku}'`, e); }
            }
        }
        console.log(`  - Создано Module: ${modulesCreatedCount}`);

        // --- Cabinet ---
        let cabinetsCreatedCount = 0;
        for (const row of cabinetsData) {
            const cabinetSku = row.cabinet_sku ? String(row.cabinet_sku) : null;
            if (!cabinetSku) { console.warn("[Cabinet] Пропуск: нет sku.", row); continue; }
            const screenTypeName = row.screen_type ? String(row.screen_type) : null;
            const screenTypeId = screenTypeName ? screenTypeMap.get(screenTypeName) : null;
            const priceUsd = safeDecimal(row.price_usd, `Cabinet ${cabinetSku} price_usd`);
            const width = safeInt(row.cabinet_width, `Cabinet ${cabinetSku} width`);
            const height = safeInt(row.cabinet_height, `Cabinet ${cabinetSku} height`);
            const moduleWidth = safeInt(row.module_width, `Cabinet ${cabinetSku} module_width`);
            const moduleHeight = safeInt(row.module_height, `Cabinet ${cabinetSku} module_height`);
            const modulesCount = safeInt(row.modules_count, `Cabinet ${cabinetSku} modules_count`);
            const placement = row.cabinet_placement ? String(row.cabinet_placement) : null;

            const cabinetData: Prisma.CabinetCreateInput = {
               sku: cabinetSku, name: row.cabinet_name ? String(row.cabinet_name) : null,
               width: width, height: height, placement: placement,
               moduleWidth: moduleWidth, moduleHeight: moduleHeight, modulesCount: modulesCount,
               priceUsd: priceUsd,
               ...(screenTypeId !== null && { screenType: { connect: { id: screenTypeId } } })
            };

            try {
                const created = await prisma.cabinet.create({ data: cabinetData });
                cabinetSkuMap.set(created.sku, created.id);
                cabinetsCreatedCount++;
            } catch (e) {
                 if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                     console.warn(`[Cabinet Warn] Кабинет SKU '${cabinetSku}' уже существует. Пропуск.`);
                 } else { console.error(`[Cabinet Error] Ошибка создания '${cabinetSku}'`, e); }
            }
        }
        console.log(`  - Создано Cabinet: ${cabinetsCreatedCount}`);
        console.log('Заполнение зависимых таблиц завершено.');

        // --- 4. Заполнение связующих таблиц ---
        console.log('Заполнение связующих таблиц...');
        // ScreenTypeMaterial
        for(const row of screenTypeMaterialsData) {
            const screenTypeName = row.screen_type ? String(row.screen_type) : null;
            const screenTypeId = screenTypeName ? screenTypeMap.get(screenTypeName) : null;
            const materialCode = row.material_code ? String(row.material_code) : null;
            const materialId = materialCode ? materialMap.get(materialCode) : null;
            if (screenTypeId && materialId) {
                try { await prisma.screenTypeMaterial.create({ data: { screenTypeId, materialId } }); }
                catch(e) { console.error("[ScreenTypeMaterial Error]", row, e); }
            } else { console.warn(`[ScreenTypeMaterial] Пропуск: не найден ID ScreenType ('${screenTypeName}') или Material ('${materialCode}')`, row); }
        }
        // ScreenTypeOption
        for(const row of screenTypeOptionsData) {
            const screenTypeName = row.screen_type ? String(row.screen_type) : null;
            const screenTypeId = screenTypeName ? screenTypeMap.get(screenTypeName) : null;
            const optionCode = row.option_code ? String(row.option_code) : null;
            const optionId = optionCode ? optionMap.get(optionCode) : null;
            if (screenTypeId && optionId) {
                 try { await prisma.screenTypeOption.create({ data: { screenTypeId, optionId } }); }
                 catch(e) { console.error("[ScreenTypeOption Error]", row, e); }
            } else { console.warn(`[ScreenTypeOption] Пропуск: не найден ID ScreenType ('${screenTypeName}') или Option ('${optionCode}')`, row); }
        }
        // CabinetMaterial (читает из cabinetOptionsData)
        console.log(`--- Начало заполнения CabinetMaterial (из листа ${cabinetOptionsSheetName}) ---`);
        for(const row of cabinetOptionsData) { // Используем прочитанные данные
             const cabinetSku = row.cabinet_sku ? String(row.cabinet_sku) : null;
             const cabinetId = cabinetSku ? cabinetSkuMap.get(cabinetSku) : null;
             const materialCode = row.material_code ? String(row.material_code) : null; // Ожидаем material_code
             const materialId = materialCode ? materialMap.get(materialCode) : null;

             if (!materialCode) {
                 console.warn(`[CabinetMaterial] Пропуск строки в листе '${cabinetOptionsSheetName}': отсутствует material_code`, row);
                 continue;
             }

             if (cabinetId && materialId) {
                  try { await prisma.cabinetMaterial.create({ data: { cabinetId, materialId } }); }
                  catch(e) { console.error(`[CabinetMaterial Error] Cabinet:'${cabinetSku}', Material:'${materialCode}'`, e); }
             } else { console.warn(`[CabinetMaterial] Пропуск: не найден ID Cabinet ('${cabinetSku}') или Material ('${materialCode}')`, row); }
         }
         console.log(`--- Завершение заполнения CabinetMaterial ---`);
        // CabinetComponent
        for(const row of cabinetComponentsData) {
            const cabinetSku = row.cabinet_sku ? String(row.cabinet_sku) : null;
            const cabinetId = cabinetSku ? cabinetSkuMap.get(cabinetSku) : null;
            const componentCode = row.component_code ? String(row.component_code) : null;
            const componentId = componentCode ? componentCodeMap.get(componentCode) : null;
            const quantity = safeInt(row.component_count, `CabinetComponent ${cabinetSku}-${componentCode} quantity`, true, false);
            if (!(cabinetId && componentId)) {
                 console.warn(`[CabinetComponent] Пропуск: не найден ID Cabinet ('${cabinetSku}') или Component ('${componentCode}')`, row);
                 continue;
            }
            if (quantity === null || quantity <= 0) {
                 console.warn(`[CabinetComponent] Пропуск: количество (${row.component_count} -> ${quantity}) не является положительным числом для cabinet ${cabinetSku}, component ${componentCode}`);
                 continue;
            }
            try {
                await prisma.cabinetComponent.create({ data: { cabinetId, componentId, quantity } });
            } catch (e) {
                console.error(`[CabinetComponent Error] Ошибка создания связи для cabinet ${cabinetSku}, component ${componentCode}, quantity ${quantity}`, e);
            }
        }

        console.log('Заполнение связующих таблиц завершено.');

    } catch (processingError) {
        console.error('❌ Критическая ошибка во время обработки данных и заполнения таблиц:', processingError);
    }

    console.log('🎉 Импорт данных успешно завершен!');
}


// --- Основная функция запуска ---
async function main() {
    try {
        const excelFilePath = path.resolve(__dirname, '../data/database.xlsx');
        await importDataFromExcel(excelFilePath);
    } catch (error) {
        console.error('❌ Ошибка при выполнении скрипта seed:', error);
        process.exit(1);
    } finally {
        console.log('--- Отключение от БД ---');
        await prisma.$disconnect();
    }
}

// Запускаем скрипт
main();