// src/services/calculatorService.ts

import { CalculatorFormData } from '../types/calculationTypes';
// Добавляем Prisma для примера, откуда могут прийти компоненты
// (Этот импорт может быть не нужен здесь, если типы определены глобально или в другом месте)
// import type { Item, ModuleItemComponent as PrismaModuleItemComponent } from '@prisma/client';

// Определяем более полный тип для компонентов модуля,
// включая информацию о самом элементе (Item)
export type EnrichedModuleComponent = {
    itemCode: string;
    itemName: string; // Имя из связанного Item
    itemSku?: string | null; // Артикул из связанного Item
    quantity: number; // Количество на модуль (было countPerModule)
    // Можно добавить и другие поля Item при необходимости
};

export type ModuleData = {
    code: string;
    sku?: string | null; // Добавим SKU
    name?: string | null; // Добавим Name
    width: number; // Обязательно - размер модуля в мм
    height: number; // Обязательно - размер модуля в мм
    powerConsumptionAvg?: number | null; // Среднее потребление (если есть) в Ваттах
    powerConsumptionMax?: number | null; // Макс потребление (если есть) в Ваттах
    // Заменяем ModuleComponent на EnrichedModuleComponent
    components: EnrichedModuleComponent[]; // Компоненты модуля с деталями
    // Добавим другие поля, если они нужны для расчета или отображения
    // Например, viewingAngleHorizontal, viewingAngleVertical, etc.
};

export type CabinetData = {
    code: string;
    sku?: string | null; // Добавим SKU
    name?: string | null; // Добавим Name
    width: number; // Обязательно - размер кабинета в мм
    height: number; // Обязательно - размер кабинета в мм
    // moduleSizeCode?: string; // Может быть полезно для проверки совместимости, но не для расчета размера
    // Добавим другие поля, если нужны
};

// --- Тип результата расчета ---
export type TechnicalSpecsResult = {
    pixelPitch: string;              // Шаг пикселя (мм и P-значение)
    placement: string;               // Расположение (название)
    material: string;                // Материал кабинета или "Без кабинета"
    cabinetSize: string;             // Размер кабинета (ШxВ мм) или "Без кабинета"
    cabinetsCountHorizontal: number; // Кол-во кабинетов по горизонтали
    cabinetsCountVertical: number;   // Кол-во кабинетов по вертикали
    cabinetsCountTotal: number;      // Общее кол-во кабинетов
    modulesPerCabinet: number;       // Модулей в 1 кабинете (0 если бескабинетный)
    modulesCountTotal: number;       // Общее количество модулей
    ipProtection: string;            // IP защита (код)
    actualScreenWidthMm: number;     // Фактическая ширина экрана (мм)
    actualScreenHeightMm: number;    // Фактическая высота экрана (мм)
    actualScreenWidthM: number;      // Фактическая ширина экрана (м)
    actualScreenHeightM: number;     // Фактическая высота экрана (м)
    activeAreaM2: number;            // Активная площадь (м²)
    brightness: string;              // Яркость (нит)
    refreshRate: string;             // Частота обновления (Гц)
    horizontalViewingAngle: string;  // Горизонтальный угол обзора (°)
    verticalViewingAngle: string;    // Вертикальный угол обзора (°)
    averagePowerConsumption: number; // Среднее энергопотребление (кВт)
    maxPowerConsumption: number;     // Максимальное энергопотребление (кВт)
    resolutionWidthPx: number;       // Разрешение по ширине (пикс)
    resolutionHeightPx: number;      // Разрешение по высоте (пикс)
    resolution: string;              // Разрешение (ШxВ пикс)
    totalPixels: number;             // Общее кол-во пикселей
    //viewingDistanceMinM: number;     // Мин. дистанция просмотра (м)
    //viewingDistanceOptimalM: number; // Опт. дистанция просмотра (м)
    //viewingDistanceMaxM: number;     // Макс. дистанция просмотра (м)
    viewingDistanceBasedOnPitch: number; // Дистанция = значению шага пикселя
    zipComponentList: { name: string; sku: string | null; totalQuantity: number }[]; // Список ЗИП компонентов
};


/**
 * Основная функция расчёта технических характеристик
 */
export function calculateTechnicalSpecs(
    formData: CalculatorFormData,
    moduleData: ModuleData | null, // Используем обновленный тип
    cabinetData: CabinetData | null // Используем обновленный тип
): TechnicalSpecsResult | null { // Может вернуть null если данных недостаточно
    const {
        selectedPlacement,
        selectedMaterialName,
        selectedProtectionCode,
        selectedBrightnessLabel,
        selectedRefreshRateLabel,
        selectedPitchValue,
        selectedScreenWidth, // в мм
        selectedScreenHeight, // в мм
        selectedScreenTypeCode,
        // moduleItemComponents больше не используется напрямую, берем из moduleData.components
    } = formData;

    // --- Валидация входных данных ---
    if (!moduleData || !moduleData.width || !moduleData.height || moduleData.width <= 0 || moduleData.height <= 0) {
        console.error("Ошибка расчета: Некорректные данные модуля (особенно размеры).", moduleData);
        return null;
    }

    const cabinetScreenTypeCode = "cabinet";
    const isCabinetType = selectedScreenTypeCode === cabinetScreenTypeCode;

    if (isCabinetType && (!cabinetData || !cabinetData.width || !cabinetData.height || cabinetData.width <= 0 || cabinetData.height <= 0)) {
        console.error("Ошибка расчета: Некорректные данные кабинета для кабинетного типа.", cabinetData);
        return null;
    }
    if (selectedPitchValue <= 0 || selectedScreenWidth <= 0 || selectedScreenHeight <= 0) {
         console.error("Ошибка расчета: Некорректные размеры экрана или шаг пикселя.");
         return null;
    }

    // --- Размеры и количество Модуля ---
    const pixelPitchMm = selectedPitchValue;
    const moduleWidthMm = moduleData.width;
    const moduleHeightMm = moduleData.height;

    // --- Запрошенные размеры экрана ---
    const requestedScreenWidthMm = selectedScreenWidth;
    const requestedScreenHeightMm = selectedScreenHeight;

    // --- Переменные для результатов расчета ---
    let totalCabinets = 0;
    let cabinetsX = 0;
    let cabinetsY = 0;
    let modulesPerCabinet = 0;
    let actualScreenWidthMm = 0;
    let actualScreenHeightMm = 0;
    let totalModules = 0;

    // --- Логика расчета в зависимости от типа экрана ---
    if (isCabinetType && cabinetData) {
        const cabinetWidthMm = cabinetData.width;
        const cabinetHeightMm = cabinetData.height;
        cabinetsX = cabinetWidthMm > 0 ? Math.floor(requestedScreenWidthMm / cabinetWidthMm) : 0;
        cabinetsY = cabinetHeightMm > 0 ? Math.floor(requestedScreenHeightMm / cabinetHeightMm) : 0;
        totalCabinets = cabinetsX * cabinetsY;
        if (totalCabinets === 0) {
             console.warn("Расчет: Не помещается ни одного кабинета в заданные размеры.");
             return null;
        }
        actualScreenWidthMm = cabinetsX * cabinetWidthMm;
        actualScreenHeightMm = cabinetsY * cabinetHeightMm;
        const modulesPerCabX = moduleWidthMm > 0 ? Math.round(cabinetWidthMm / moduleWidthMm) : 0;
        const modulesPerCabY = moduleHeightMm > 0 ? Math.round(cabinetHeightMm / moduleHeightMm) : 0;
        modulesPerCabinet = modulesPerCabX * modulesPerCabY;
        totalModules = totalCabinets * modulesPerCabinet;
    } else if (!isCabinetType) {
         const modulesX = moduleWidthMm > 0 ? Math.floor(requestedScreenWidthMm / moduleWidthMm) : 0;
         const modulesY = moduleHeightMm > 0 ? Math.floor(requestedScreenHeightMm / moduleHeightMm) : 0;
         totalModules = modulesX * modulesY;
         if (totalModules === 0) {
            console.warn("Расчет: Не помещается ни одного модуля в заданные размеры.");
            return null;
         }
         actualScreenWidthMm = modulesX * moduleWidthMm;
         actualScreenHeightMm = modulesY * moduleHeightMm;
         totalCabinets = 0;
         cabinetsX = 0;
         cabinetsY = 0;
         modulesPerCabinet = 0;
    } else {
         console.error("Ошибка расчета: Непредвиденное состояние данных кабинета.");
         return null;
    }

    if (totalModules === 0 && totalCabinets === 0 && isCabinetType) { // Добавил проверку для кабинетного типа, т.к. totalCabinets может быть 0, а totalModules - нет
        console.error("Ошибка расчета: Не удалось рассчитать ни модули, ни кабинеты.");
        return null;
    } else if (totalModules === 0 && !isCabinetType) { // Для бескабинетного проверяем только модули
         console.error("Ошибка расчета: Не удалось рассчитать модули.");
         return null;
    }

    // --- Расчет остальных характеристик ---

    // Площадь
    const activeAreaM2 = (actualScreenWidthMm * actualScreenHeightMm) / 1_000_000;
    const actualScreenWidthM = actualScreenWidthMm / 1000;
    const actualScreenHeightM = actualScreenHeightMm / 1000;

    // Разрешение
    const modulePixelsX = moduleWidthMm > 0 ? Math.round(moduleWidthMm / pixelPitchMm) : 0;
    const modulePixelsY = moduleHeightMm > 0 ? Math.round(moduleHeightMm / pixelPitchMm) : 0;
    const totalModulesX = moduleWidthMm > 0 ? Math.round(actualScreenWidthMm / moduleWidthMm) : 0;
    const totalModulesY = moduleHeightMm > 0 ? Math.round(actualScreenHeightMm / moduleHeightMm) : 0;
    const resolutionWidthPx = totalModulesX * modulePixelsX;
    const resolutionHeightPx = totalModulesY * modulePixelsY;
    const resolution = `${resolutionWidthPx} x ${resolutionHeightPx}`;
    const totalPixels = resolutionWidthPx * resolutionHeightPx;

    // <<< НАЧАЛО ИСПРАВЛЕННОГО БЛОКА РАСЧЕТА МОЩНОСТИ >>>
    // Расчет мощности
    const avgBasePowerPerModuleIndoor = 25; // Ваша базовая цифра для средней мощности (Интерьер)
    const avgBasePowerPerModuleOutdoor = 45; // Ваша базовая цифра для средней мощности (Уличный)
    const powerFactor = 0.87; // Ваш коэффициент
    const peakFactor = 2.5;  // Ваш коэффициент для пиковой мощности

    const isOutdoor = selectedPlacement?.toLowerCase().includes('уличн') || selectedPlacement?.toLowerCase().includes('outdoor');

    // Определяем базовую среднюю мощность на модуль
    const avgBasePowerPerModule = isOutdoor ? avgBasePowerPerModuleOutdoor : avgBasePowerPerModuleIndoor;

    // Рассчитываем СРЕДНЮЮ суммарную мощность в Ваттах с учетом коэффициента
    const averagePowerConsumptionW = (totalModules * avgBasePowerPerModule) / powerFactor;

    // Рассчитываем МАКСИМАЛЬНУЮ мощность на основе средней
    const maxPowerConsumptionW = averagePowerConsumptionW * peakFactor;
    // <<< КОНЕЦ ИСПРАВЛЕННОГО БЛОКА РАСЧЕТА МОЩНОСТИ >>>

    // Дистанция обзора
    //const viewingDistanceMinM = pixelPitchMm / 1000;
    //const viewingDistanceOptimalM = pixelPitchMm * 1.5 / 1000;
    //const viewingDistanceMaxM = pixelPitchMm * 3 / 1000;

    // ЗИП комплект
    const zipComponentList = moduleData.components.map(comp => {
        const totalRequired = totalModules * comp.quantity;
        const zipQuantity = Math.ceil(totalRequired * 0.05);
        return {
            name: comp.itemName,
            sku: comp.itemSku ?? null,
            totalQuantity: zipQuantity,
        };
    }).filter(item => item.totalQuantity > 0);

    // Углы обзора
    const horizontalViewingAngle = '140°';
    const verticalViewingAngle = '140°';

    // --- Сборка результата ---
    return {
        pixelPitch: `${pixelPitchMm} мм (P${pixelPitchMm})`,
        placement: selectedPlacement || '-',
        material: isCabinetType ? (selectedMaterialName || '-') : 'Без кабинета',
        cabinetSize: isCabinetType && cabinetData ? `${cabinetData.width} x ${cabinetData.height} мм` : 'Без кабинета', // Добавлены пробелы
        cabinetsCountHorizontal: cabinetsX,
        cabinetsCountVertical: cabinetsY,
        cabinetsCountTotal: totalCabinets,
        modulesPerCabinet: modulesPerCabinet,
        modulesCountTotal: totalModules,
        ipProtection: selectedProtectionCode || '-',
        actualScreenWidthMm: Number(actualScreenWidthMm.toFixed(0)),
        actualScreenHeightMm: Number(actualScreenHeightMm.toFixed(0)),
        actualScreenWidthM: Number(actualScreenWidthM.toFixed(2)),
        actualScreenHeightM: Number(actualScreenHeightM.toFixed(2)),
        activeAreaM2: Number(activeAreaM2.toFixed(2)),
        brightness: selectedBrightnessLabel || '-',
        refreshRate: selectedRefreshRateLabel || '-',
        horizontalViewingAngle,
        verticalViewingAngle,
        averagePowerConsumption: Number((averagePowerConsumptionW / 1000).toFixed(2)), // Перевод в кВт и округление
        maxPowerConsumption: Number((maxPowerConsumptionW / 1000).toFixed(2)), // Перевод в кВт и округление
        resolutionWidthPx,
        resolutionHeightPx,
        resolution,
        totalPixels,
        //viewingDistanceMinM: Number(viewingDistanceMinM.toFixed(1)), // Округление
        viewingDistanceBasedOnPitch: selectedPitchValue,
        //viewingDistanceOptimalM: Number(viewingDistanceOptimalM.toFixed(1)), // Округление
        //viewingDistanceMaxM: Number(viewingDistanceMaxM.toFixed(1)), // Округление
        zipComponentList,
    };
}