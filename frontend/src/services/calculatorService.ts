// src/services/calculatorService.ts

import type {
    CalculatorFormData,
    TechnicalSpecsResult,
    CostCalculationResult,
    CostLineItem,
    PriceMap,
    // Типы данных модуля и кабинета
    ModuleData,
    CabinetData,
} from '../types/calculationTypes';

/**
 * Основная функция расчёта технических характеристик
 */
export function calculateTechnicalSpecs(
    formData: CalculatorFormData,
    moduleData: ModuleData | null,
    cabinetData: CabinetData | null
): TechnicalSpecsResult | null {
    const {
        selectedPlacement,
        selectedMaterialName,
        selectedProtectionCode,
        selectedBrightnessLabel,
        selectedRefreshRateLabel,
        selectedPitchValue,
        selectedScreenWidth,
        selectedScreenHeight,
        selectedScreenTypeCode,
    } = formData;

    // Валидация входных данных
    if (!moduleData || !moduleData.width || !moduleData.height || moduleData.width <= 0 || moduleData.height <= 0) { console.error("Ошибка расчета: Некорректные данные модуля (особенно размеры).", moduleData); return null; }
    const cabinetScreenTypeCode = "cabinet";
    const isCabinetType = selectedScreenTypeCode === cabinetScreenTypeCode;
    if (isCabinetType && (!cabinetData || !cabinetData.width || !cabinetData.height || cabinetData.width <= 0 || cabinetData.height <= 0)) { console.error("Ошибка расчета: Некорректные данные кабинета для кабинетного типа.", cabinetData); return null; }
    if (selectedPitchValue <= 0 || selectedScreenWidth <= 0 || selectedScreenHeight <= 0) { console.error("Ошибка расчета: Некорректные размеры экрана или шаг пикселя."); return null; }

    // --- Расчеты размеров, модулей, кабинетов ---
    const pixelPitchMm = selectedPitchValue;
    const moduleWidthMm = moduleData.width; const moduleHeightMm = moduleData.height;
    const requestedScreenWidthMm = selectedScreenWidth; const requestedScreenHeightMm = selectedScreenHeight;
    let totalCabinets = 0, cabinetsX = 0, cabinetsY = 0, modulesPerCabinet = 0;
    let actualScreenWidthMm = 0, actualScreenHeightMm = 0, totalModules = 0;
    if (isCabinetType && cabinetData) { const cabinetWidthMm = cabinetData.width; const cabinetHeightMm = cabinetData.height; cabinetsX = cabinetWidthMm > 0 ? Math.floor(requestedScreenWidthMm / cabinetWidthMm) : 0; cabinetsY = cabinetHeightMm > 0 ? Math.floor(requestedScreenHeightMm / cabinetHeightMm) : 0; totalCabinets = cabinetsX * cabinetsY; if (totalCabinets === 0) { console.warn("Расчет: Не помещается ни одного кабинета."); return null; } actualScreenWidthMm = cabinetsX * cabinetWidthMm; actualScreenHeightMm = cabinetsY * cabinetHeightMm; const modulesPerCabX = moduleWidthMm > 0 ? Math.round(cabinetWidthMm / moduleWidthMm) : 0; const modulesPerCabY = moduleHeightMm > 0 ? Math.round(cabinetHeightMm / moduleHeightMm) : 0; modulesPerCabinet = modulesPerCabX * modulesPerCabY; totalModules = totalCabinets * modulesPerCabinet; }
    else if (!isCabinetType) { const modulesX = moduleWidthMm > 0 ? Math.floor(requestedScreenWidthMm / moduleWidthMm) : 0; const modulesY = moduleHeightMm > 0 ? Math.floor(requestedScreenHeightMm / moduleHeightMm) : 0; totalModules = modulesX * modulesY; if (totalModules === 0) { console.warn("Расчет: Не помещается ни одного модуля."); return null; } actualScreenWidthMm = modulesX * moduleWidthMm; actualScreenHeightMm = modulesY * moduleHeightMm; totalCabinets = 0; cabinetsX = 0; cabinetsY = 0; modulesPerCabinet = 0; }
    else { console.error("Ошибка расчета: Непредвиденное состояние данных кабинета."); return null; }
    if ((isCabinetType && totalCabinets === 0 && totalModules === 0) || (!isCabinetType && totalModules === 0) ) { console.error("Ошибка расчета: Не удалось рассчитать ни модули, ни кабинеты."); return null; }

    // Расчет остальных характеристик
    const activeAreaM2 = (actualScreenWidthMm * actualScreenHeightMm) / 1_000_000;
    const actualScreenWidthM = actualScreenWidthMm / 1000; const actualScreenHeightM = actualScreenHeightMm / 1000;
    const modulePixelsX = moduleWidthMm > 0 ? Math.round(moduleWidthMm / pixelPitchMm) : 0;
    const modulePixelsY = moduleHeightMm > 0 ? Math.round(moduleHeightMm / pixelPitchMm) : 0;
    const totalModulesX = moduleWidthMm > 0 ? Math.round(actualScreenWidthMm / moduleWidthMm) : 0;
    const totalModulesY = moduleHeightMm > 0 ? Math.round(actualScreenHeightMm / moduleHeightMm) : 0;
    const resolutionWidthPx = totalModulesX * modulePixelsX; const resolutionHeightPx = totalModulesY * modulePixelsY;
    const resolution = `${resolutionWidthPx} x ${resolutionHeightPx}`; const totalPixels = resolutionWidthPx * resolutionHeightPx;

    // Расчет мощности
    const avgBasePowerPerModuleIndoor = 25; const avgBasePowerPerModuleOutdoor = 45;
    const powerFactor = 0.87; const peakFactor = 2.5;
    const isOutdoor = selectedPlacement?.toLowerCase().includes('уличн') || selectedPlacement?.toLowerCase().includes('outdoor');
    const avgBasePowerPerModule = isOutdoor ? avgBasePowerPerModuleOutdoor : avgBasePowerPerModuleIndoor;
    const averagePowerConsumptionW = (totalModules * avgBasePowerPerModule) / powerFactor;
    const maxPowerConsumptionW = averagePowerConsumptionW * peakFactor;

    // <<< ИСПРАВЛЕНО: Расчет дистанций просмотра >>>
    const viewingDistanceMinM = pixelPitchMm / 1000;
    const viewingDistanceOptimalM = pixelPitchMm * 1.5 / 1000;

    // ЗИП комплект
    const zipComponentList = moduleData.components.map(comp => {
        const totalRequired = totalModules * comp.quantity;
        const zipQuantity = Math.ceil(totalRequired * 0.05);
        return { name: comp.itemName, sku: comp.itemSku ?? null, totalQuantity: zipQuantity };
    }).filter(item => item.totalQuantity > 0);

    // Углы обзора
    const horizontalViewingAngle = '140°'; const verticalViewingAngle = '140°';

    // Сборка результата
    return {
        pixelPitch: `${pixelPitchMm} мм (P${pixelPitchMm})`,
        placement: selectedPlacement || '-',
        material: isCabinetType ? (selectedMaterialName || '-') : 'Без кабинета',
        cabinetSize: isCabinetType && cabinetData ? `${cabinetData.width} x ${cabinetData.height} мм` : 'Без кабинета',
        cabinetsCountHorizontal: cabinetsX, cabinetsCountVertical: cabinetsY, cabinetsCountTotal: totalCabinets,
        modulesPerCabinet: modulesPerCabinet, modulesCountTotal: totalModules,
        ipProtection: selectedProtectionCode || '-',
        actualScreenWidthMm: Number(actualScreenWidthMm.toFixed(0)), actualScreenHeightMm: Number(actualScreenHeightMm.toFixed(0)),
        actualScreenWidthM: Number(actualScreenWidthM.toFixed(2)), actualScreenHeightM: Number(actualScreenHeightM.toFixed(2)),
        activeAreaM2: Number(activeAreaM2.toFixed(2)),
        brightness: selectedBrightnessLabel || '-', refreshRate: selectedRefreshRateLabel || '-',
        horizontalViewingAngle, verticalViewingAngle,
        averagePowerConsumption: Number((averagePowerConsumptionW / 1000).toFixed(2)),
        maxPowerConsumption: Number((maxPowerConsumptionW / 1000).toFixed(2)),
        resolutionWidthPx, resolutionHeightPx, resolution, totalPixels,
        viewingDistanceMinM: Number(viewingDistanceMinM.toFixed(1)),
        viewingDistanceOptimalM: Number(viewingDistanceOptimalM.toFixed(1)),
        zipComponentList,
        moduleCode: moduleData.code,
        cabinetCode: isCabinetType && cabinetData ? cabinetData.code : null,
        isCabinetType: isCabinetType,
        pixelPitchValue: pixelPitchMm,
    };
}

/**
 * Рассчитывает стоимость компонентов и ЗИП.
 */
export function calculateCosts(
    techSpecs: TechnicalSpecsResult,
    prices: PriceMap,
    dollarRate: number,
    selectedMaterialCode: string | null
): CostCalculationResult | null {
    console.log("Calculating costs with:", { techSpecs, prices, dollarRate, selectedMaterialCode });

    if (!techSpecs || !prices || !dollarRate || dollarRate <= 0) { console.error("calculateCosts: Missing required data."); return null; }
    console.log("Received Price Map:", JSON.stringify(prices, null, 2)); // Логируем полученные цены
    console.log("Dollar Rate:", dollarRate);
    console.log("Material Code:", selectedMaterialCode);
    console.log("Tech Specs:", techSpecs);
    const conversionRate = dollarRate * 1.02;
    // console.log(`Using conversion rate: ${conversionRate.toFixed(4)}`); // Можно раскомментировать для отладки

    const getPriceRub = (code: string | null, itemType: string): number | null => {
        if (!code) return null; // Добавили проверку на null для code
        const priceInfo = prices[code];
        if (!priceInfo) { console.warn(`Price not found for ${itemType} with code: ${code}`); return null; }
        if (priceInfo.rub !== null && priceInfo.rub !== undefined && priceInfo.rub > 0) { return priceInfo.rub; } // Используем RUB если > 0
        if (priceInfo.usd !== null && priceInfo.usd !== undefined && priceInfo.usd > 0) { return priceInfo.usd * conversionRate; } // Конвертируем USD если > 0
        // console.warn(`No valid positive price (USD or RUB) found for ${itemType} with code: ${code}`); // Убрали лог для 0 цены
        return 0; // Возвращаем 0, если цены null или 0
    };

    const ITEM_CODE_PSU = "bp300"; const ITEM_CODE_RCV_CARD = "receiver"; const ITEM_CODE_MAGNET = "magnets";

    const modulePriceRub = getPriceRub(techSpecs.moduleCode, 'Module');
    const cabinetPriceRub = getPriceRub(techSpecs.cabinetCode, 'Cabinet'); // Будет null если код null
    const psuPriceRub = getPriceRub(ITEM_CODE_PSU, 'PSU');
    const rcvCardPriceRub = getPriceRub(ITEM_CODE_RCV_CARD, 'Receiver Card');
    const magnetPriceRub = getPriceRub(ITEM_CODE_MAGNET, 'Magnet');

    const costItems: CostLineItem[] = [];
    const zipItems: CostLineItem[] = [];
    let totalCostRub = 0; let totalZipCostRub = 0;

    // 1. Модули
    if (modulePriceRub !== null) { const total = techSpecs.modulesCountTotal * modulePriceRub; costItems.push({ label: 'Модули', quantity: techSpecs.modulesCountTotal, unitPriceRub: modulePriceRub, totalPriceRub: total, details: `(${techSpecs.moduleCode})` }); totalCostRub += total; }
    else { console.error("Module price not found."); }
    // 2. Блоки питания
    if (psuPriceRub !== null) { const psuCount = Math.ceil(techSpecs.modulesCountTotal / 4); const total = psuCount * psuPriceRub; costItems.push({ label: 'Блоки питания', quantity: psuCount, unitPriceRub: psuPriceRub, totalPriceRub: total, details: `(${ITEM_CODE_PSU})` }); totalCostRub += total; }
    else { console.warn("PSU price not found."); }
    // 3. Приемные карты
    if (rcvCardPriceRub !== null && techSpecs.resolutionWidthPx > 0 && techSpecs.resolutionHeightPx > 0 && techSpecs.pixelPitchValue > 0) { const cardsX = Math.ceil(techSpecs.resolutionWidthPx / 256); const cardsY = Math.ceil(techSpecs.resolutionHeightPx / 256); const rcvCardCount = cardsX * cardsY; const total = rcvCardCount * rcvCardPriceRub; costItems.push({ label: 'Приемные карты', quantity: rcvCardCount, unitPriceRub: rcvCardPriceRub, totalPriceRub: total, details: `(${ITEM_CODE_RCV_CARD})` }); totalCostRub += total; }
    else { console.warn("Receiver card price/data invalid."); }
    // 4. Кабинет
    if (techSpecs.isCabinetType && techSpecs.cabinetsCountTotal > 0 && techSpecs.cabinetCode) { if (selectedMaterialCode === 'steel') { const steelPriceM2Code = 'steel_cab_price_m2'; const priceM2Rub = getPriceRub(steelPriceM2Code, 'Steel Cabinet M2'); if (priceM2Rub !== null) { const total = techSpecs.activeAreaM2 * priceM2Rub; costItems.push({ label: 'Кабинет (сталь)', quantity: techSpecs.activeAreaM2, unitPriceRub: priceM2Rub, totalPriceRub: total, details: `(${techSpecs.activeAreaM2.toFixed(2)} м²)` }); totalCostRub += total; } else { console.warn(`Price per m² for steel cabinet (code: ${steelPriceM2Code}) not found.`); } } else if (cabinetPriceRub !== null) { const total = techSpecs.cabinetsCountTotal * cabinetPriceRub; costItems.push({ label: 'Кабинет (алюм./др.)', quantity: techSpecs.cabinetsCountTotal, unitPriceRub: cabinetPriceRub, totalPriceRub: total, details: `(${techSpecs.cabinetCode})` }); totalCostRub += total; } else { console.warn("Cabinet price not found."); } }
    // 5. Магниты
    if (magnetPriceRub !== null) { const magnetCount = techSpecs.modulesCountTotal * 4; const total = magnetCount * magnetPriceRub; costItems.push({ label: 'Магниты', quantity: magnetCount, unitPriceRub: magnetPriceRub, totalPriceRub: total, details: `(${ITEM_CODE_MAGNET})` }); totalCostRub += total; }
    else { console.warn("Magnet price not found."); }

    // --- Расчет ЗИП ---
    if (modulePriceRub !== null) { const zipModulesCount = Math.max(1, Math.floor(techSpecs.modulesCountTotal * 0.05)); const total = zipModulesCount * modulePriceRub; zipItems.push({ label: 'ЗИП: Модули', quantity: zipModulesCount, unitPriceRub: modulePriceRub, totalPriceRub: total }); totalZipCostRub += total; }
    if (psuPriceRub !== null) { const zipModulesCount = Math.max(1, Math.floor(techSpecs.modulesCountTotal * 0.05)); const zipPsuCount = Math.max(1, Math.floor(zipModulesCount * 0.2)); const total = zipPsuCount * psuPriceRub; zipItems.push({ label: 'ЗИП: Блоки питания', quantity: zipPsuCount, unitPriceRub: psuPriceRub, totalPriceRub: total }); totalZipCostRub += total; }
    if (rcvCardPriceRub !== null) { const cardsX = Math.ceil(techSpecs.resolutionWidthPx / 256); const cardsY = Math.ceil(techSpecs.resolutionHeightPx / 256); const totalRcvCardCount = cardsX * cardsY; if (totalRcvCardCount >= 5) { const zipRcvCardCount = Math.max(1, Math.floor(totalRcvCardCount * 0.2)); const total = zipRcvCardCount * rcvCardPriceRub; zipItems.push({ label: 'ЗИП: Приемные карты', quantity: zipRcvCardCount, unitPriceRub: rcvCardPriceRub, totalPriceRub: total }); totalZipCostRub += total; } else { zipItems.push({ label: 'ЗИП: Приемные карты', quantity: 0, totalPriceRub: 0, details: 'Менее 5 шт. в экране' }); } }

    const finalTotalCost = totalCostRub + totalZipCostRub;
    return { costItems, zipItems, totalCostRub: Number(finalTotalCost.toFixed(2)), conversionRate: Number(conversionRate.toFixed(4)), };
}