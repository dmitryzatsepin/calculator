// src/types/calculationTypes.ts

// --- Форма ввода ---
export type CalculatorFormData = {
  selectedPlacement: string | null;          // Используется в calculateTechnicalSpecs, calculateCosts (для isOutdoor)
  selectedMaterialName: string | null;       // Используется в calculateTechnicalSpecs
  selectedProtectionCode: string | null;     // Используется в calculateTechnicalSpecs
  selectedBrightnessLabel: string | null;    // Используется в calculateTechnicalSpecs
  selectedRefreshRateLabel: string | null;   // Используется в calculateTechnicalSpecs
  selectedPitchValue: number;              // Используется в calculateTechnicalSpecs
  selectedScreenWidth: number;             // Используется в calculateTechnicalSpecs
  selectedScreenHeight: number;            // Используется в calculateTechnicalSpecs
  selectedScreenTypeCode: string;            // Используется в calculateTechnicalSpecs
  moduleItemComponents: {                  // Пока не используется в расчетах, но есть в типе ModuleData
    itemCode: string;
    itemName: string;
    countPerModule: number; // Убедитесь, что имя совпадает с тем, что приходит из ModuleData.components
  }[];
};

// --- Технические Характеристики (Результат calculateTechnicalSpecs) ---
export type TechnicalSpecsResult = {
  pixelPitch: string;                    // Форматированная строка (P-значение)
  placement: string;                     // Название расположения
  material: string;                      // Название материала или "Без кабинета"
  cabinetSize: string;                   // Форматированная строка (ШxВ мм) или "Без кабинета"
  cabinetsCountHorizontal: number;       // Кол-во кабинетов по горизонтали
  cabinetsCountVertical: number;         // Кол-во кабинетов по вертикали
  cabinetsCountTotal: number;            // Общее кол-во кабинетов
  modulesPerCabinet: number;             // Модулей в 1 кабинете
  modulesCountTotal: number;             // Общее количество модулей
  ipProtection: string;                  // Код IP защиты
  actualScreenWidthMm: number;           // Фактическая ширина (мм)
  actualScreenHeightMm: number;          // Фактическая высота (мм)
  actualScreenWidthM: number;            // Фактическая ширина (м)
  actualScreenHeightM: number;           // Фактическая высота (м)
  activeAreaM2: number;                  // Активная площадь (м²)
  brightness: string;                    // Яркость (строка с nit)
  refreshRate: string;                   // Частота (строка с Hz)
  horizontalViewingAngle: string;        // Горизонтальный угол обзора (строка с °)
  verticalViewingAngle: string;          // Вертикальный угол обзора (строка с °)
  averagePowerConsumption: number;       // Среднее энергопотребление (кВт)
  maxPowerConsumption: number;           // Максимальное энергопотребление (кВт)
  resolutionWidthPx: number;             // Разрешение по ширине (пикс)
  resolutionHeightPx: number;            // Разрешение по высоте (пикс)
  resolution: string;                    // Разрешение (формат "ШxВ")
  totalPixels: number;                   // Общее кол-во пикселей
  viewingDistanceMinM: number;           // Мин. дистанция просмотра (м)
  viewingDistanceOptimalM: number;       // Опт. дистанция просмотра (м)
  zipComponentList: {                    // Список ЗИП
    name: string;                      // Название компонента
    sku: string | null;                // Артикул компонента
    totalQuantity: number;             // Итоговое кол-во в ЗИП
  }[];
  // Поля, необходимые для последующего расчета стоимости
  moduleCode: string;                    // Код выбранного модуля
  cabinetCode: string | null;            // Код выбранного кабинета (или null)
  isCabinetType: boolean;                // Флаг кабинетного типа экрана
  pixelPitchValue: number;               // Числовое значение шага пикселя (мм)
};

// --- Расчет Стоимости ---

// Тип для детализации строки стоимости
export type CostLineItem = {
  label: string;        // Название (Модули, БП, ЗИП: Модули и т.д.)
  quantity: number;     // Количество единиц (шт, м² и т.д.)
  unitPriceRub?: number | null; // Цена за единицу в рублях (если применимо)
  totalPriceRub: number; // Общая стоимость строки в рублях
  details?: string;     // Доп. информация (например, код компонента, курс конвертации)
};

// Тип для итогового результата расчета стоимости
export type CostCalculationResult = {
  costItems: CostLineItem[];      // Массив строк основной комплектации
  zipItems: CostLineItem[];       // Массив строк ЗИП
  totalCostRub: number;          // Общая стоимость (основные + ЗИП) в рублях
  conversionRate?: number;
  additionalItems?: CostLineItem[];
};

// --- Тип для хранения цен (используется в контексте и сервисе) ---
export type PriceMap = Record<
  string, // Ключ - код элемента (модуля, кабинета, item)
  { usd: number | null; rub: number | null } // Объект с ценами USD и RUB
>;

// --- Дополнительные типы для данных из БД/GraphQL (можно оставить в calculatorService.ts или перенести сюда) ---

export type EnrichedModuleComponent = {
  itemCode: string;
  itemName: string;
  itemSku?: string | null;
  quantity: number; // Количество НА ОДИН модуль
};

export type ModuleData = {
  code: string;
  sku?: string | null;
  name?: string | null;
  width: number;
  height: number;
  powerConsumptionAvg?: number | null;
  powerConsumptionMax?: number | null;
  brightness?: number | null;
  refreshRate?: number | null;
  components: EnrichedModuleComponent[];
};

export type CabinetData = {
  code: string;
  sku?: string | null;
  name?: string | null;
  width: number;
  height: number;
};

export type SelectOption = {
  label: string;
  value: string;
};

import type { VideoProcessor as GqlVideoProcessor } from '../generated/graphql/graphql';

export type VideoProcessor = GqlVideoProcessor;