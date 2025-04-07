// src/seed.ts
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
    // Используем header: 1 чтобы получить массив массивов, так проще пропустить вторую строку
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    if (rows.length < 3) { // Должно быть как минимум 2 строки заголовка + 1 строка данных
        console.warn(`⚠️ Лист ${sheetName} пуст или содержит только заголовки (или меньше 3 строк). Пропуск.`);
        return [];
    }

    const header = rows[0];
    // Пропускаем вторую строку (rows[1])
    const dataRows = rows.slice(2);

    // Фильтруем строки, где все значения null или пустые строки
    const filteredRows = dataRows.filter(row => 
        row.some(cell => cell !== null && cell !== '')
    );

    const jsonData = filteredRows.map(row => {
        const rowData: { [key: string]: any } = {};
        header.forEach((key: any, index: number) => {
            if (key != null) { // Пропускаем пустые заголовки
               rowData[String(key)] = row[index];
            }
        });
        return rowData;
    });

    if (dataRows.length !== filteredRows.length) {
        console.log(`  - Пропущено ${dataRows.length - filteredRows.length} пустых строк в ${sheetName}`);
    }
    console.log(`  - Прочитано строк из ${sheetName} (после пропуска 2-го заголовка): ${jsonData.length}`);
    return jsonData;
}


// --- Вспомогательные функции (без изменений) ---
function safeDecimal(value: any, context: string): Decimal | null {
    if (value == null || value === '') { return null; }
    const normalizedValue = typeof value === 'string' ? value.replace(',', '.') : value;
    if (typeof normalizedValue === 'number' || (typeof normalizedValue === 'string' && !isNaN(parseFloat(normalizedValue)) && isFinite(Number(normalizedValue)))) {
        try { return new Decimal(normalizedValue); }
        catch (e) { console.error(`❌ ${context}: Ошибка конвертации значения '${value}' (норм: '${normalizedValue}') в Decimal`, e); return null; }
    } else { console.warn(`⚠️ ${context}: Некорректное значение для Decimal: '${value}'. Будет использовано null.`); return null; }
}

function safeInt(value: any, context: string, allowZero: boolean = true, allowNull: boolean = true): number | null {
     if (value == null || value === '') { return allowNull ? null : (allowZero ? 0 : null); }
     const trimmedValue = typeof value === 'string' ? String(value).trim() : value; // Добавили trim для строк
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

    // --- 0. Чтение данных (Обновлено) ---
    console.log("Чтение данных из Excel...");
    const screenTypeData = getDataFromSheet(workbook, 'screen_type');
    const locationData = getDataFromSheet(workbook, 'location');
    const materialsData = getDataFromSheet(workbook, 'materials');
    const refreshRateData = getDataFromSheet(workbook, 'refresh_rate');
    const brightnessData = getDataFromSheet(workbook, 'brightness');
    const manufacturersData = getDataFromSheet(workbook, 'manufacturers');
    const cabinetPlacementData = getDataFromSheet(workbook, 'cabinet_placement');
    const pitchData = getDataFromSheet(workbook, 'pitch');
    const pitchTypeData = getDataFromSheet(workbook, 'pitch_type');
    const screenTypeLocationData = getDataFromSheet(workbook, 'screen_type>location');
    const screenTypePitchData = getDataFromSheet(workbook, 'screen_type>pitch');
    const locationMaterialsData = getDataFromSheet(workbook, 'location>materials');
    const locationPitchData = getDataFromSheet(workbook, 'location>pitch');
    const locationCabinetData = getDataFromSheet(workbook, 'location>cabinet');
    const materialCabinetData = getDataFromSheet(workbook, 'material>cabinet');
    const cabinetPlacementCabinetData = getDataFromSheet(workbook, 'cabinet_placement>cabinet');
    const pitchTypePitchData = getDataFromSheet(workbook, 'pitch_type>pitch');
    const modulesData = getDataFromSheet(workbook, 'modules');
    const cabinetsData = getDataFromSheet(workbook, 'cabinets');
    const componentPriceData = getDataFromSheet(workbook, 'component_and_service_price');
    const cabinetComponentsData = getDataFromSheet(workbook, 'cabinet>components');
    const ipProtectionData = getDataFromSheet(workbook, 'ip_protection');
    console.log("Чтение Excel завершено.");


    // --- 1. Очистка таблиц (Обновлен порядок, добавлены новые) ---
    console.log('Очистка таблиц (в правильном порядке)...');
    try {
        await prisma.cabinetComponent.deleteMany();
        await prisma.pitchTypePitch.deleteMany();
        await prisma.cabinetPlacementCabinet.deleteMany();
        await prisma.materialCabinet.deleteMany();
        await prisma.locationCabinet.deleteMany();
        await prisma.locationPitch.deleteMany();
        await prisma.locationMaterial.deleteMany();
        await prisma.screenTypePitch.deleteMany();
        await prisma.screenTypeLocation.deleteMany();
        await prisma.module.deleteMany();
        await prisma.cabinet.deleteMany();
        await prisma.pitch.deleteMany();
        await prisma.screenType.deleteMany();
        await prisma.pitchType.deleteMany();
        await prisma.cabinetPlacement.deleteMany();
        await prisma.location.deleteMany();
        await prisma.manufacturer.deleteMany();
        await prisma.material.deleteMany();
        await prisma.componentService.deleteMany();
        await prisma.ipProtection.deleteMany();
        await prisma.refreshRate.deleteMany();
        await prisma.brightness.deleteMany();
        console.log('Очистка таблиц завершена.');
    } catch(e) { console.error("❌ Ошибка при очистке таблиц:", e); throw e; }

    // --- 2. Заполнение справочников и карт (Обновлено с .trim()) ---
    console.log('Заполнение базовых справочников и создание карт ID...');
    const materialMap = new Map<string, number>();
    const manufacturerCodeMap = new Map<string, number>();
    const manufacturerNameMap = new Map<string, string>(); // name -> code
    const locationMap = new Map<string, number>(); // code -> id
    const locationNameMap = new Map<string, string>(); // name -> code
    const cabinetPlacementMap = new Map<string, number>();
    const pitchTypeMap = new Map<string, number>(); // name -> id
    const screenTypeMap = new Map<string, number>(); // code -> id
    const pitchMap = new Map<string, number>(); // code -> id
    const ipCodeMap = new Map<string, number>();
    const componentCodeMap = new Map<string, number>();
    const cabinetSkuMap = new Map<string, number>(); // sku -> id
    const refreshRateMap = new Map<number, number>();
    const brightnessMap = new Map<number, number>();

    try {
        // --- Material ---
        for (const row of materialsData) {
            const code = row.material_code ? String(row.material_code).trim() : null;
            if (!code) continue;
            if (materialMap.has(code)) { console.warn(`[Material Duplicate] Код '${code}'...`); continue; }
            try {
                const created = await prisma.material.create({ data: { code: code, name: String(row.material_name ?? '').trim() } });
                materialMap.set(created.code, created.id);
            } catch(e) { console.error(`[Material Error] '${code}'`, e); }
        }
        console.log(`  - Создано Material: ${materialMap.size}`);

        // --- Manufacturer ---
        for (const row of manufacturersData) {
            const code = row.manufacturer_code ? String(row.manufacturer_code).trim() : null;
            const name = row.manufacturer_name ? String(row.manufacturer_name).trim() : null;
            if (!code || !name) { console.warn(`[Manufacturer] Пропуск: нет code или name`, row); continue; }
             if (manufacturerCodeMap.has(code)) { console.warn(`[Manufacturer Duplicate] Код '${code}'...`); continue; }
             if (manufacturerNameMap.has(name)) { console.warn(`[Manufacturer Duplicate] Имя '${name}'...`); continue; }
            try {
                const created = await prisma.manufacturer.create({ data: { code: code, name: name } });
                manufacturerCodeMap.set(created.code, created.id);
                manufacturerNameMap.set(created.name, created.code);
            } catch(e) { console.error(`[Manufacturer Error] '${code}' / '${name}'`, e); }
        }
        console.log(`  - Создано Manufacturer: ${manufacturerCodeMap.size}`);

        // --- Location ---
        for (const row of locationData) {
            const code = row.location_code ? String(row.location_code).trim() : null;
            const name = row.location_name ? String(row.location_name).trim() : null;
            if (!code || !name) continue;
             if (locationMap.has(code)) { console.warn(`[Location Duplicate Code] Код '${code}'...`); continue; }
             if (locationNameMap.has(name)) { console.warn(`[Location Duplicate Name] Имя '${name}'...`); continue; }
            try {
                const created = await prisma.location.create({ data: { code: code, name: name } });
                locationMap.set(created.code, created.id);
                locationNameMap.set(created.name, created.code);
            } catch(e) { console.error(`[Location Error] '${code}'/'${name}'`, e); }
        }
        console.log(`  - Создано Location: ${locationMap.size}`);

        // --- CabinetPlacement ---
        for (const row of cabinetPlacementData) {
            const code = row.cabinet_placement_code ? String(row.cabinet_placement_code).trim() : null;
            if (!code) continue;
             if (cabinetPlacementMap.has(code)) { console.warn(`[CabinetPlacement Duplicate] Код '${code}'...`); continue; }
            try {
                const created = await prisma.cabinetPlacement.create({ data: { code: code, name: String(row.cabinet_placement_name ?? '').trim() } });
                cabinetPlacementMap.set(created.code, created.id);
            } catch(e) { console.error(`[CabinetPlacement Error] '${code}'`, e); }
        }
        console.log(`  - Создано CabinetPlacement: ${cabinetPlacementMap.size}`);

        // --- PitchType ---
        for (const row of pitchTypeData) {
            const name = row.pitch_type ? String(row.pitch_type).trim() : null;
            if (!name) continue;
             if (pitchTypeMap.has(name)) { console.warn(`[PitchType Duplicate] Имя '${name}'...`); continue; }
            try {
                const created = await prisma.pitchType.create({ data: { name: name } });
                pitchTypeMap.set(created.name, created.id);
            } catch(e) { console.error(`[PitchType Error] '${name}'`, e); }
        }
        console.log(`  - Создано PitchType: ${pitchTypeMap.size}`);

        // --- ScreenType ---
        for (const row of screenTypeData) {
            const code = row.screen_type_code ? String(row.screen_type_code).trim() : null;
            if (!code) continue;
             if (screenTypeMap.has(code)) { console.warn(`[ScreenType Duplicate] Код '${code}'...`); continue; }
            try {
                const created = await prisma.screenType.create({ data: { code: code, name: String(row.screen_type ?? '').trim() } });
                screenTypeMap.set(created.code, created.id);
            } catch(e) { console.error(`[ScreenType Error] '${code}'`, e); }
        }
        console.log(`  - Создано ScreenType: ${screenTypeMap.size}`);

        // --- Pitch ---
        for (const row of pitchData) {
            const code = row.pitch_code ? String(row.pitch_code).trim() : null;
            if (!code) continue;
             if (pitchMap.has(code)) { console.warn(`[Pitch Duplicate] Код '${code}'...`); continue; }
            const pitchVal = safeDecimal(row.pitch, `Pitch ${code} value`);
            const modWidth = safeInt(row.module_width, `Pitch ${code} modWidth`, false, false);
            const modHeight = safeInt(row.module_height, `Pitch ${code} modHeight`, false, false);
            if (pitchVal === null || modWidth === null || modHeight === null) {
                console.warn(`[Pitch] Пропуск '${code}': неверные pitch, width или height.`); continue;
            }
            try {
                const created = await prisma.pitch.create({ data: { code, pitchValue: pitchVal, moduleWidth: modWidth, moduleHeight: modHeight } });
                pitchMap.set(created.code, created.id);
            } catch(e) { console.error(`[Pitch Error] '${code}'`, e); }
        }
        console.log(`  - Создано Pitch: ${pitchMap.size}`);

        // --- RefreshRate ---
        for (const row of refreshRateData) {
            const value = safeInt(row.refresh_rate, `RefreshRate value`, false, true);
            if (value === null) { continue; }
             if (refreshRateMap.has(value)) { continue; }
            try {
                await prisma.refreshRate.upsert({ where: { value: value }, update: {}, create: { value: value } });
                refreshRateMap.set(value, value);
            } catch(e) { console.error(`[RefreshRate Error] '${value}'`, e); }
        }
        console.log(`  - Создано/Обновлено RefreshRate: ${refreshRateMap.size}`);

        // --- Brightness ---
        for (const row of brightnessData) {
            const value = safeInt(row.brightness, `Brightness value`, false, true);
            if (value === null) { continue; }
            if (brightnessMap.has(value)) { continue; }
            try {
                 await prisma.brightness.upsert({ where: { value: value }, update: {}, create: { value: value } });
                brightnessMap.set(value, value);
            } catch(e) { console.error(`[Brightness Error] '${value}'`, e); }
        }
        console.log(`  - Создано/Обновлено Brightness: ${brightnessMap.size}`);

        // --- IpProtection ---
        for (const row of ipProtectionData) {
            const code = row.ip_code ? String(row.ip_code).trim() : null;
            if (!code) continue;
             if (ipCodeMap.has(code)) { console.warn(`[IpProtection Duplicate] Код '${code}'...`); continue; }
            try {
                const created = await prisma.ipProtection.create({ data: { code, protectionSolid: String(row.protection_solid ?? '').trim(), protectionWater: String(row.protection_water ?? '').trim() }});
                ipCodeMap.set(created.code, created.id);
            } catch(e) { console.error(`[IpProtection Error] '${code}'`, e); }
        }
        console.log(`  - Создано IpProtection: ${ipCodeMap.size}`);

        // --- ComponentService ---
        for (const row of componentPriceData) {
             const code = row.component_code ? String(row.component_code).trim() : null;
             if (!code) continue;
             if (componentCodeMap.has(code)) { console.warn(`[ComponentService Duplicate] Код '${code}'...`); continue; }
             const priceUsd = safeDecimal(row.price_usd, `Component ${code} price_usd`);
             const priceRub = safeDecimal(row.price_rub, `Component ${code} price_rub`);
             try {
                 const created = await prisma.componentService.create({ data: {
                     category: row.component_category ? String(row.component_category).trim() : null,
                     code: code, name: String(row.component_name ?? '').trim(), priceUsd: priceUsd, priceRub: priceRub,
                 }});
                 componentCodeMap.set(created.code, created.id);
             } catch(dbError) { console.error(`[ComponentService Error] '${code}'`, dbError); }
         }
        console.log(`  - Создано ComponentService: ${componentCodeMap.size}`);

        console.log('Заполнение базовых справочников завершено.');


        // --- 3. Заполнение зависимых таблиц (Cabinet, Module) ---
        console.log('Заполнение зависимых таблиц...');

        // --- Cabinet ---
        let cabinetsCreatedCount = 0;
        for (const row of cabinetsData) {
            const cabinetSku = row.cabinet_sku ? String(row.cabinet_sku).trim() : null;
            if (!cabinetSku) { console.warn("[Cabinet] Пропуск: нет sku.", row); continue; }
            if (cabinetSkuMap.has(cabinetSku)) { console.warn(`[Cabinet Duplicate] SKU '${cabinetSku}'...`); continue; }
            const priceUsd = safeDecimal(row.price_usd, `Cabinet ${cabinetSku} price_usd`);
            const width = safeInt(row.cabinet_width, `Cabinet ${cabinetSku} width`);
            const height = safeInt(row.cabinet_height, `Cabinet ${cabinetSku} height`);
            const moduleWidth = safeInt(row.module_width, `Cabinet ${cabinetSku} module_width`);
            const moduleHeight = safeInt(row.module_height, `Cabinet ${cabinetSku} module_height`);
            const modulesCount = safeInt(row.modules_count, `Cabinet ${cabinetSku} modules_count`);

            const cabinetData: Prisma.CabinetCreateInput = {
               sku: cabinetSku, name: row.cabinet_name ? String(row.cabinet_name).trim() : null,
               width: width, height: height,
               moduleWidth: moduleWidth, moduleHeight: moduleHeight,
               modulesCount: modulesCount,
               priceUsd: priceUsd,
            };

            try {
                const created = await prisma.cabinet.create({ data: cabinetData });
                cabinetSkuMap.set(created.sku, created.id);
                cabinetsCreatedCount++;
            } catch (e) { console.error(`[Cabinet Error] Ошибка создания '${cabinetSku}'`, e); }
        }
        console.log(`  - Создано Cabinet: ${cabinetsCreatedCount}`);


        // --- Module ---
        let modulesCreatedCount = 0;
        for (const row of modulesData) {
            const moduleSku = row.module_sku ? String(row.module_sku).trim() : null;
            if (!moduleSku) { console.warn("[Module] Пропуск: нет sku.", row); continue; }

            const locationName = row.location_name ? String(row.location_name).trim() : null;
            const locationCode = locationName ? locationNameMap.get(locationName) : null;

            const manufacturerName = row.manufacturer_name ? String(row.manufacturer_name).trim() : null;
            const manufacturerCode = manufacturerName ? manufacturerNameMap.get(manufacturerName) : null;

            const pitchCode = row.pitch_code ? String(row.pitch_code).trim() : null;
            const refreshRateValue = safeInt(row.refresh_rate, `Module ${moduleSku} refresh_rate`, false, true);
            const brightnessValue = safeInt(row.brightness, `Module ${moduleSku} brightness`, false, true);

            // --- Проверки связей ---
            if (!locationCode /* && связь обязательна */) {
                console.warn(`(Module ${moduleSku}) Location с именем '${locationName ?? 'null'}' не найден. Пропуск/Связь не установлена.`);
                // continue; // Раскомментируй, если связь обязательна
            }
            if (!pitchCode || !pitchMap.has(pitchCode)) {
                console.warn(`(Module ${moduleSku}) Pitch с кодом '${pitchCode ?? 'null'}' не найден. Пропуск.`); continue;
            }
            if (manufacturerName && !manufacturerCode) { console.warn(`(Module ${moduleSku}) Manufacturer с именем '${manufacturerName}' не найден.`); }
            if (refreshRateValue !== null && !refreshRateMap.has(refreshRateValue)) { console.warn(`(Module ${moduleSku}) RefreshRate со значением '${refreshRateValue}' не найден.`); }
            if (brightnessValue !== null && !brightnessMap.has(brightnessValue)) { console.warn(`(Module ${moduleSku}) Brightness со значением '${brightnessValue}' не найден.`); }

            const priceUsd = safeDecimal(row.price_usd, `Module ${moduleSku} price_usd`);

            const moduleData: Prisma.ModuleCreateInput = {
                 sku: moduleSku,
                 type: row.module_type ? String(row.module_type).trim() : null,
                 priceUsd: priceUsd,
                 ...(locationCode && { location: { connect: { code: locationCode } } }),
                 pitch:      { connect: { code: pitchCode } },
                 ...(manufacturerCode && { manufacturer: { connect: { code: manufacturerCode } } }),
                 ...(refreshRateValue !== null && refreshRateMap.has(refreshRateValue) && { refreshRate: { connect: { value: refreshRateValue } } }),
                 ...(brightnessValue !== null && brightnessMap.has(brightnessValue) && { brightness: { connect: { value: brightnessValue } } }),
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
        console.log('Заполнение зависимых таблиц завершено.');


        // --- 4. Заполнение связующих таблиц (Добавлен .trim()) ---
        console.log('Заполнение связующих таблиц...');
        // ScreenTypeLocation
        for (const row of screenTypeLocationData) {
            const stCode = row.screen_type_code ? String(row.screen_type_code).trim() : null;
            const locCode = row.location_code ? String(row.location_code).trim() : null;
            if (stCode && locCode && screenTypeMap.has(stCode) && locationMap.has(locCode)) {
                try { await prisma.screenTypeLocation.create({ data: { screenTypeCode: stCode, locationCode: locCode } }); }
                catch(e) { if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) console.error("[ScreenTypeLocation Error]", row, e); }
            } else { console.warn(`[ScreenTypeLocation] Пропуск: не найдены ScreenType ('${stCode}') или Location ('${locCode}')`, row); }
        }
        console.log(`  - Заполнено ScreenTypeLocation`);

        // ScreenTypePitch
         for (const row of screenTypePitchData) {
             const stCode = row.screen_type_code ? String(row.screen_type_code).trim() : null;
             const pCode = row.pitch_code ? String(row.pitch_code).trim() : null;
             if (stCode && pCode && screenTypeMap.has(stCode) && pitchMap.has(pCode)) {
                 try { await prisma.screenTypePitch.create({ data: { screenTypeCode: stCode, pitchCode: pCode } }); }
                 catch(e) { if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) console.error("[ScreenTypePitch Error]", row, e); }
             } else { console.warn(`[ScreenTypePitch] Пропуск: не найдены ScreenType ('${stCode}') или Pitch ('${pCode}')`, row); }
         }
         console.log(`  - Заполнено ScreenTypePitch`);

        // LocationMaterial
         for (const row of locationMaterialsData) {
             const locCode = row.location_code ? String(row.location_code).trim() : null;
             const matCode = row.material_code ? String(row.material_code).trim() : null;
             if (locCode && matCode && locationMap.has(locCode) && materialMap.has(matCode)) {
                 try { await prisma.locationMaterial.create({ data: { locationCode: locCode, materialCode: matCode } }); }
                 catch(e) { if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) console.error("[LocationMaterial Error]", row, e); }
             } else { console.warn(`[LocationMaterial] Пропуск: не найдены Location ('${locCode}') или Material ('${matCode}')`, row); }
         }
         console.log(`  - Заполнено LocationMaterial`);

        // LocationPitch
        for (const row of locationPitchData) {
            const locCode = row.location_code ? String(row.location_code).trim() : null;
            const pCode = row.pitch_code ? String(row.pitch_code).trim() : null;
            if (locCode && pCode && locationMap.has(locCode) && pitchMap.has(pCode)) {
                try { await prisma.locationPitch.create({ data: { locationCode: locCode, pitchCode: pCode } }); }
                catch(e) { if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) console.error("[LocationPitch Error]", row, e); }
            } else { console.warn(`[LocationPitch] Пропуск: не найдены Location ('${locCode}') или Pitch ('${pCode}')`, row); }
        }
        console.log(`  - Заполнено LocationPitch`);

        // LocationCabinet
        let emptyRowsCount = 0;
        for (const row of locationCabinetData) {
            const locCode = row.location_code ? String(row.location_code).trim() : null;
            const cabSku = row.cabinet_sku ? String(row.cabinet_sku).trim() : null;
            if (!locCode || !cabSku) {
                emptyRowsCount++;
                continue;
            }
            if (locationMap.has(locCode) && cabinetSkuMap.has(cabSku)) {
                try { await prisma.locationCabinet.create({ data: { locationCode: locCode, cabinetSku: cabSku } }); }
                catch(e) { if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) console.error("[LocationCabinet Error]", row, e); }
            } else { console.warn(`[LocationCabinet] Пропуск: не найдены Location ('${locCode}') или Cabinet ('${cabSku}')`, row); }
        }
        if (emptyRowsCount > 0) {
            console.log(`  - Пропущено ${emptyRowsCount} пустых строк в LocationCabinet`);
        }
        console.log(`  - Заполнено LocationCabinet`);

        // MaterialCabinet
        for (const row of materialCabinetData) {
            const matCode = row.material_code ? String(row.material_code).trim() : null;
            const cabSku = row.cabinet_sku ? String(row.cabinet_sku).trim() : null;
            
            if (!matCode || !cabSku) {
                console.warn(`[MaterialCabinet] Пропуск: пустые значения matCode='${matCode}', cabSku='${cabSku}'`, row);
                continue;
            }
            
            const hasMaterial = materialMap.has(matCode);
            const hasCabinet = cabinetSkuMap.has(cabSku);
            
            if (!hasMaterial || !hasCabinet) {
                console.warn(`[MaterialCabinet] Пропуск: не найдены Material (${matCode}, exists=${hasMaterial}) или Cabinet (${cabSku}, exists=${hasCabinet})`);
                if (!hasMaterial) {
                    console.warn(`  - Доступные материалы:`, Array.from(materialMap.keys()));
                }
                if (!hasCabinet) {
                    console.warn(`  - Доступные кабинеты:`, Array.from(cabinetSkuMap.keys()));
                }
                continue;
            }
            
            try {
                await prisma.materialCabinet.create({ data: { materialCode: matCode, cabinetSku: cabSku } });
            } catch(e) {
                if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) {
                    console.error("[MaterialCabinet Error]", row, e);
                }
            }
        }
        console.log(`  - Заполнено MaterialCabinet`);

        // CabinetPlacementCabinet
        for (const row of cabinetPlacementCabinetData) {
            const placeCode = row.cabinet_placement_code ? String(row.cabinet_placement_code).trim() : null;
            const cabSku = row.cabinet_sku ? String(row.cabinet_sku).trim() : null;
            if (placeCode && cabSku && cabinetPlacementMap.has(placeCode) && cabinetSkuMap.has(cabSku)) {
                try { await prisma.cabinetPlacementCabinet.create({ data: { cabinetPlacementCode: placeCode, cabinetSku: cabSku } }); }
                catch(e) { if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) console.error("[CabinetPlacementCabinet Error]", row, e); }
            } else { console.warn(`[CabinetPlacementCabinet] Пропуск: не найдены Placement ('${placeCode}') или Cabinet ('${cabSku}')`, row); }
        }
        console.log(`  - Заполнено CabinetPlacementCabinet`);

        // PitchTypePitch
        for (const row of pitchTypePitchData) {
            const typeName = row.pitch_type ? String(row.pitch_type).trim() : null;
            const pCode = row.pitch_code ? String(row.pitch_code).trim() : null;
            if (typeName && pCode && pitchTypeMap.has(typeName) && pitchMap.has(pCode)) {
                try { await prisma.pitchTypePitch.create({ data: { pitchTypeName: typeName, pitchCode: pCode } }); }
                catch(e) { if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) console.error("[PitchTypePitch Error]", row, e); }
            } else { console.warn(`[PitchTypePitch] Пропуск: не найдены PitchType ('${typeName}') или Pitch ('${pCode}')`, row); }
        }
        console.log(`  - Заполнено PitchTypePitch`);

        // CabinetComponent (Используем ID, полученные при создании/поиске кабинетов)
        for(const row of cabinetComponentsData) {
            const cabinetSku = row.cabinet_sku ? String(row.cabinet_sku).trim() : null;
            const cabinetId = cabinetSku ? cabinetSkuMap.get(cabinetSku) : null;
            const componentCode = row.component_code ? String(row.component_code).trim() : null;
            const componentId = componentCode ? componentCodeMap.get(componentCode) : null;
            const quantity = safeInt(row.component_count, `CabinetComponent ${cabinetSku}-${componentCode} quantity`, true, false);

            if (!(cabinetId && componentId)) {
                 console.warn(`[CabinetComponent] Пропуск: не найден ID Cabinet ('${cabinetSku}') или Component ('${componentCode}')`, row);
                 continue;
            }
            if (quantity === null) {
                 console.warn(`[CabinetComponent] Пропуск: количество (${row.component_count}) не является валидным целым числом для cabinet ${cabinetSku}, component ${componentCode}`);
                 continue;
            }
            try {
                await prisma.cabinetComponent.create({ data: { cabinetId: cabinetId, componentId: componentId, quantity: quantity } });
            } catch (e) {
                 if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'))
                     console.error(`[CabinetComponent Error] Ошибка создания связи для cabinet ID ${cabinetId}, component ID ${componentId}, quantity ${quantity}`, e);
            }
        }
        console.log(`  - Заполнено CabinetComponent`);

        console.log('Заполнение связующих таблиц завершено.');

    } catch (processingError) {
        console.error('❌ Критическая ошибка во время обработки данных и заполнения таблиц:', processingError);
        throw processingError;
    }

    console.log('🎉 Импорт данных успешно завершен!');
}


// --- Основная функция запуска (без изменений) ---
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