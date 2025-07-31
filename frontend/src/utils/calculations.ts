import type {
    CalculatorFormData,
    TechnicalSpecsResult,
    CostCalculationResult,
    CostLineItem,
    PriceMap,
    ModuleData,
    CabinetData,
    VideoProcessor,
} from '../types/calculationTypes';

const validateAndGetInitialParams = (
    formData: CalculatorFormData,
    moduleData: ModuleData | null,
    cabinetData: CabinetData | null
) => {
    if (!moduleData?.width || !moduleData.height || moduleData.width <= 0 || moduleData.height <= 0) {
        console.error("Ошибка расчета: Некорректные данные модуля.", moduleData);
        return null;
    }

    const isCabinetType = formData.selectedScreenTypeCode === "cabinet";
    if (isCabinetType && (!cabinetData?.width || !cabinetData.height || cabinetData.width <= 0 || cabinetData.height <= 0)) {
        console.error("Ошибка расчета: Некорректные данные кабинета для кабинетного типа.", cabinetData);
        return null;
    }

    if (formData.selectedPitchValue <= 0 || formData.selectedScreenWidth <= 0 || formData.selectedScreenHeight <= 0) {
        console.error("Ошибка расчета: Некорректные размеры экрана или шаг пикселя.");
        return null;
    }

    return {
        moduleWidthMm: moduleData.width,
        moduleHeightMm: moduleData.height,
        cabinetWidthMm: cabinetData?.width ?? 0,
        cabinetHeightMm: cabinetData?.height ?? 0,
        requestedScreenWidthMm: formData.selectedScreenWidth,
        requestedScreenHeightMm: formData.selectedScreenHeight,
        isCabinetType,
    };
};

const calculateDimensions = (params: ReturnType<typeof validateAndGetInitialParams>) => {
    if (!params) return null;

    const {
        moduleWidthMm, moduleHeightMm, cabinetWidthMm, cabinetHeightMm,
        requestedScreenWidthMm, requestedScreenHeightMm, isCabinetType
    } = params;

    let totalCabinets = 0, cabinetsX = 0, cabinetsY = 0, modulesPerCabinet = 0;
    let actualScreenWidthMm = 0, actualScreenHeightMm = 0, totalModules = 0;

    if (isCabinetType) {
        cabinetsX = Math.floor(requestedScreenWidthMm / cabinetWidthMm);
        cabinetsY = Math.floor(requestedScreenHeightMm / cabinetHeightMm);
        totalCabinets = cabinetsX * cabinetsY;
        if (totalCabinets === 0) return null;

        actualScreenWidthMm = cabinetsX * cabinetWidthMm;
        actualScreenHeightMm = cabinetsY * cabinetHeightMm;
        const modulesPerCabX = Math.round(cabinetWidthMm / moduleWidthMm);
        const modulesPerCabY = Math.round(cabinetHeightMm / moduleHeightMm);
        modulesPerCabinet = modulesPerCabX * modulesPerCabY;
        totalModules = totalCabinets * modulesPerCabinet;
    } else {
        const modulesX = Math.floor(requestedScreenWidthMm / moduleWidthMm);
        const modulesY = Math.floor(requestedScreenHeightMm / moduleHeightMm);
        totalModules = modulesX * modulesY;
        if (totalModules === 0) return null;

        actualScreenWidthMm = modulesX * moduleWidthMm;
        actualScreenHeightMm = modulesY * moduleHeightMm;
    }

    return {
        actualScreenWidthMm, actualScreenHeightMm, totalModules, cabinetsX, cabinetsY, totalCabinets, modulesPerCabinet
    };
};

export function calculateTechnicalSpecs(
    formData: CalculatorFormData,
    moduleData: ModuleData | null,
    cabinetData: CabinetData | null
): TechnicalSpecsResult | null {
    const initialParams = validateAndGetInitialParams(formData, moduleData, cabinetData);
    if (!initialParams) return null;

    const dimensions = calculateDimensions(initialParams);
    if (!dimensions || (!dimensions.totalCabinets && !dimensions.totalModules)) return null;

    const {
        actualScreenWidthMm, actualScreenHeightMm, totalModules, cabinetsX, cabinetsY, totalCabinets, modulesPerCabinet
    } = dimensions;
    const { moduleWidthMm, moduleHeightMm, isCabinetType } = initialParams;
    const { selectedPitchValue, selectedPlacement } = formData;

    const activeAreaM2 = (actualScreenWidthMm * actualScreenHeightMm) / 1_000_000;
    const actualScreenWidthM = actualScreenWidthMm / 1000;
    const actualScreenHeightM = actualScreenHeightMm / 1000;

    const modulePixelsX = Math.round(moduleWidthMm / selectedPitchValue);
    const modulePixelsY = Math.round(moduleHeightMm / selectedPitchValue);
    const totalModulesX = Math.round(actualScreenWidthMm / moduleWidthMm);
    const totalModulesY = Math.round(actualScreenHeightMm / moduleHeightMm);
    const resolutionWidthPx = totalModulesX * modulePixelsX;
    const resolutionHeightPx = totalModulesY * modulePixelsY;

    const isOutdoor = selectedPlacement?.toLowerCase().includes('уличн') || selectedPlacement?.toLowerCase().includes('outdoor');
    const avgBasePowerPerModule = isOutdoor ? 45 : 25;
    const averagePowerConsumptionW = (totalModules * avgBasePowerPerModule) / 0.87;
    const maxPowerConsumptionW = averagePowerConsumptionW * 2.5;

    const viewingDistanceMinM = selectedPitchValue / 1000;
    const viewingDistanceOptimalM = selectedPitchValue * 1.5 / 1000;

    const zipComponentList = (moduleData?.components || []).map(comp => {
        const totalRequired = totalModules * comp.quantity;
        const zipQuantity = Math.ceil(totalRequired * 0.05);
        return { name: comp.itemName, sku: comp.itemSku ?? null, totalQuantity: zipQuantity };
    }).filter(item => item.totalQuantity > 0);

    return {
        pixelPitch: `${selectedPitchValue} мм (P${selectedPitchValue})`,
        placement: formData.selectedPlacement || '-',
        material: isCabinetType ? (formData.selectedMaterialName || '-') : 'Без кабинета',
        cabinetSize: isCabinetType && cabinetData ? `${cabinetData.width} x ${cabinetData.height} мм` : 'Без кабинета',
        cabinetsCountHorizontal: cabinetsX, cabinetsCountVertical: cabinetsY, cabinetsCountTotal: totalCabinets,
        modulesPerCabinet: modulesPerCabinet, modulesCountTotal: totalModules,
        ipProtection: formData.selectedProtectionCode || '-',
        actualScreenWidthMm: Number(actualScreenWidthMm.toFixed(0)), actualScreenHeightMm: Number(actualScreenHeightMm.toFixed(0)),
        actualScreenWidthM: Number(actualScreenWidthM.toFixed(2)), actualScreenHeightM: Number(actualScreenHeightM.toFixed(2)),
        activeAreaM2: Number(activeAreaM2.toFixed(2)),
        brightness: formData.selectedBrightnessLabel || '-', refreshRate: formData.selectedRefreshRateLabel || '-',
        horizontalViewingAngle: '140°', verticalViewingAngle: '140°',
        averagePowerConsumption: Number((averagePowerConsumptionW / 1000).toFixed(2)),
        maxPowerConsumption: Number((maxPowerConsumptionW / 1000).toFixed(2)),
        resolutionWidthPx, resolutionHeightPx, resolution: `${resolutionWidthPx} x ${resolutionHeightPx}`, totalPixels: resolutionWidthPx * resolutionHeightPx,
        viewingDistanceMinM: Number(viewingDistanceMinM.toFixed(1)),
        viewingDistanceOptimalM: Number(viewingDistanceOptimalM.toFixed(1)),
        zipComponentList,
        moduleCode: moduleData!.code,
        cabinetCode: isCabinetType && cabinetData ? cabinetData.code : null,
        isCabinetType: isCabinetType,
        pixelPitchValue: selectedPitchValue,
    };
}

export function calculateCosts(
    techSpecs: TechnicalSpecsResult,
    prices: PriceMap,
    dollarRate: number,
    selectedMaterialCode: string | null,
    allProcessors: VideoProcessor[] // <-- Типизируем allProcessors
): CostCalculationResult | null {
    if (!techSpecs || !prices || !dollarRate || dollarRate <= 0) {
        console.error("calculateCosts: Отсутствуют необходимые данные для расчета.");
        return null;
    }

    const conversionRate = dollarRate * 1.02;

    const getPriceRub = (code: string | null): number | null => {
        if (!code) return null;
        const priceInfo = prices[code];
        if (!priceInfo) return null;
        if (priceInfo.rub !== null && priceInfo.rub > 0) return priceInfo.rub;
        if (priceInfo.usd !== null && priceInfo.usd > 0) return priceInfo.usd * conversionRate;
        return 0;
    };

    const ITEM_CODE_PSU = "bp300";
    const ITEM_CODE_RCV_CARD = "receiver";
    const ITEM_CODE_MAGNET = "magnets";
    const ITEM_CODE_STEEL_M2 = 'steel_cab_price_m2';

    const costItems: CostLineItem[] = [];
    let totalCostRub = 0;

    const modulePriceRub = getPriceRub(techSpecs.moduleCode);
    if (modulePriceRub !== null) {
        const total = techSpecs.modulesCountTotal * modulePriceRub;
        costItems.push({ label: 'Модули', quantity: techSpecs.modulesCountTotal, unitPriceRub: modulePriceRub, totalPriceRub: total, details: `(${techSpecs.moduleCode})` });
        totalCostRub += total;
    }

    const psuPriceRub = getPriceRub(ITEM_CODE_PSU);
    if (psuPriceRub !== null) {
        const psuCount = Math.ceil(techSpecs.modulesCountTotal / 4);
        const total = psuCount * psuPriceRub;
        costItems.push({ label: 'Блоки питания', quantity: psuCount, unitPriceRub: psuPriceRub, totalPriceRub: total, details: `(${ITEM_CODE_PSU})` });
        totalCostRub += total;
    }

    const rcvCardPriceRub = getPriceRub(ITEM_CODE_RCV_CARD);
    if (rcvCardPriceRub !== null) {
        const cardsX = Math.ceil(techSpecs.resolutionWidthPx / 256);
        const cardsY = Math.ceil(techSpecs.resolutionHeightPx / 256);
        const rcvCardCount = cardsX * cardsY;
        const total = rcvCardCount * rcvCardPriceRub;
        costItems.push({ label: 'Приемные карты', quantity: rcvCardCount, unitPriceRub: rcvCardPriceRub, totalPriceRub: total, details: `(${ITEM_CODE_RCV_CARD})` });
        totalCostRub += total;
    }

    if (techSpecs.isCabinetType && techSpecs.cabinetsCountTotal > 0) {
        if (selectedMaterialCode === 'steel') {
            const priceM2Rub = getPriceRub(ITEM_CODE_STEEL_M2);
            if (priceM2Rub !== null) {
                const total = techSpecs.activeAreaM2 * priceM2Rub;
                costItems.push({ label: 'Кабинет (сталь)', quantity: techSpecs.activeAreaM2, unitPriceRub: priceM2Rub, totalPriceRub: total, details: `(${techSpecs.activeAreaM2.toFixed(2)} м²)` });
                totalCostRub += total;
            }
        } else if (techSpecs.cabinetCode) {
            const cabinetPriceRub = getPriceRub(techSpecs.cabinetCode);
            if (cabinetPriceRub !== null) {
                const total = techSpecs.cabinetsCountTotal * cabinetPriceRub;
                costItems.push({ label: 'Кабинет (алюм./др.)', quantity: techSpecs.cabinetsCountTotal, unitPriceRub: cabinetPriceRub, totalPriceRub: total, details: `(${techSpecs.cabinetCode})` });
                totalCostRub += total;
            }
        }
    }

    const magnetPriceRub = getPriceRub(ITEM_CODE_MAGNET);
    if (magnetPriceRub !== null) {
        const magnetCount = techSpecs.modulesCountTotal * 4;
        const total = magnetCount * magnetPriceRub;
        costItems.push({ label: 'Магниты', quantity: magnetCount, unitPriceRub: magnetPriceRub, totalPriceRub: total, details: `(${ITEM_CODE_MAGNET})` });
        totalCostRub += total;
    }

    const zipItems: CostLineItem[] = [];
    let totalZipCostRub = 0;

    if (modulePriceRub !== null) {
        const zipModulesCount = Math.max(1, Math.floor(techSpecs.modulesCountTotal * 0.05));
        const total = zipModulesCount * modulePriceRub;
        zipItems.push({ label: 'ЗИП: Модули', quantity: zipModulesCount, unitPriceRub: modulePriceRub, totalPriceRub: total });
        totalZipCostRub += total;
    }
    if (psuPriceRub !== null) {
        const zipModulesCount = Math.max(1, Math.floor(techSpecs.modulesCountTotal * 0.05));
        const zipPsuCount = Math.max(1, Math.floor(zipModulesCount * 0.2));
        const total = zipPsuCount * psuPriceRub;
        zipItems.push({ label: 'ЗИП: Блоки питания', quantity: zipPsuCount, unitPriceRub: psuPriceRub, totalPriceRub: total });
        totalZipCostRub += total;
    }
    if (rcvCardPriceRub !== null) {
        const totalRcvCardCount = Math.ceil(techSpecs.resolutionWidthPx / 256) * Math.ceil(techSpecs.resolutionHeightPx / 256);
        if (totalRcvCardCount >= 5) {
            const zipRcvCardCount = Math.max(1, Math.floor(totalRcvCardCount * 0.2));
            const total = zipRcvCardCount * rcvCardPriceRub;
            zipItems.push({ label: 'ЗИП: Приемные карты', quantity: zipRcvCardCount, unitPriceRub: rcvCardPriceRub, totalPriceRub: total });
            totalZipCostRub += total;
        }
    }

    const additionalItems: CostLineItem[] = [];
    let additionalTotalRub = 0;

    if (allProcessors && allProcessors.length > 0) {
        const requiredPixels = techSpecs.totalPixels;
        const suitableProcessors = allProcessors.filter(p => p.maxResolutionX * p.maxResolutionY >= requiredPixels);
        const selectedProcessor = suitableProcessors[0];

        if (selectedProcessor) {
            const processorPriceRub = getPriceRub(selectedProcessor.code);
            if (processorPriceRub !== null) {
                additionalItems.push({
                    label: `Процессор: ${selectedProcessor.name}`,
                    quantity: 1,
                    unitPriceRub: processorPriceRub,
                    totalPriceRub: processorPriceRub,
                    details: `(${selectedProcessor.code})`
                });
                additionalTotalRub += processorPriceRub;
            }
        }
    }

    const montazhCost = techSpecs.activeAreaM2 * 10000;
    additionalItems.push({ label: 'Монтаж', quantity: 1, unitPriceRub: montazhCost, totalPriceRub: montazhCost });
    additionalTotalRub += montazhCost;

    const konstrukciyaCost = techSpecs.activeAreaM2 * 10000;
    additionalItems.push({ label: 'Металлоконструкция', quantity: 1, unitPriceRub: konstrukciyaCost, totalPriceRub: konstrukciyaCost });
    additionalTotalRub += konstrukciyaCost;

    const dostavkaCost = 10000;
    additionalItems.push({ label: 'Доставка', quantity: 1, unitPriceRub: dostavkaCost, totalPriceRub: dostavkaCost });
    additionalTotalRub += dostavkaCost;

    const finalTotalCost = totalCostRub + totalZipCostRub + additionalTotalRub;

    return {
        costItems,
        zipItems,
        additionalItems,
        totalCostRub: Number(finalTotalCost.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(4)),
    };
}