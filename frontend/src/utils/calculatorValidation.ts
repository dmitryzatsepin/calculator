// frontend/src/utils/calculatorValidation.ts

import type { ModuleData, CabinetData, PriceMap } from '../types/calculationTypes'; // Путь к вашим типам

// Определяем интерфейс для параметров, необходимых для проверки
interface CalculationReadinessParams {
  selectedScreenTypeCode: string | null;
  widthMm: string | number;
  heightMm: string | number;
  selectedLocationCode: string | null;
  selectedMaterialCode: string | null;
  selectedProtectionCode: string | null;
  selectedPitchCode: string | null;
  selectedBrightnessCode: string | null;
  selectedRefreshRateCode: string | null;
  selectedModuleCode: string | null;
  selectedCabinetCode: string | null;
  localDollarRateInput: number | string;
  isCalculating: boolean;
  isCabinetScreenTypeSelected: boolean;
  selectedModuleDetailsState: ModuleData | null;
  isLoadingModuleDetails: boolean;
  isErrorModuleDetails: boolean;
  selectedCabinetDetailsState: CabinetData | null;
  isLoadingCabinetDetails: boolean;
  isErrorCabinetDetails: boolean;
  isLoadingPrices: boolean;
  isErrorPrices: boolean;
  priceMap: PriceMap;
}

export function checkCalculationReadiness(params: CalculationReadinessParams): boolean {
  const {
    selectedScreenTypeCode,
    widthMm,
    heightMm,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode,
    selectedPitchCode,
    selectedBrightnessCode,
    selectedRefreshRateCode,
    selectedModuleCode,
    selectedCabinetCode,
    localDollarRateInput,
    isCalculating,
    isCabinetScreenTypeSelected,
    selectedModuleDetailsState,
    isLoadingModuleDetails,
    isErrorModuleDetails,
    selectedCabinetDetailsState,
    isLoadingCabinetDetails,
    isErrorCabinetDetails,
    isLoadingPrices,
    isErrorPrices,
    priceMap,
  } = params;

  const widthVal = Number(widthMm);
  const heightVal = Number(heightMm);
  const rateVal = Number(localDollarRateInput);

  const baseChecks =
    !!selectedScreenTypeCode &&
    widthVal > 0 &&
    heightVal > 0 &&
    !!selectedLocationCode &&
    !!selectedProtectionCode &&
    !!selectedPitchCode &&
    !!selectedBrightnessCode &&
    !!selectedRefreshRateCode &&
    !!selectedModuleCode &&
    !!selectedModuleDetailsState && !isLoadingModuleDetails && !isErrorModuleDetails &&
    rateVal > 0 &&
    !isCalculating &&
    !isLoadingPrices && !isErrorPrices && Object.keys(priceMap).length > 0;

  if (!baseChecks) {
    return false;
  }

  if (isCabinetScreenTypeSelected) {
    return (
      !!selectedMaterialCode &&
      !!selectedCabinetCode &&
      !!selectedCabinetDetailsState && !isLoadingCabinetDetails && !isErrorCabinetDetails
    );
  }

  return true; // Для не-кабинетных типов остальные специфичные проверки не нужны
}