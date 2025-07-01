// frontend/src/hooks/useCalculationPerformer.ts
import { useCallback } from 'react';
import type {
  CalculatorFormData,
  TechnicalSpecsResult,
  CostCalculationResult,
  ModuleData,
  CabinetData,
  PriceMap,
} from '../types/calculationTypes';
import {
  calculateTechnicalSpecs,
  calculateCosts,
} from '../utils/calculations';

// Определяем интерфейс для параметров, которые хук будет принимать
interface CalculationParams {
  isCalculationReady: boolean;
  selectedModuleDetails: ModuleData | null;
  isCabinetScreenTypeSelected: boolean;
  selectedCabinetDetails: CabinetData | null;
  priceMap: PriceMap;
  gqlFilteredPitches: Array<{ code?: string | null, pitchValue?: number | null, [key: string]: any } | null>; // Упрощенный тип для питчей
  selectedPitchCode: string | null;
  locationSelectOptions: Array<{ value: string, label: string }>;
  selectedLocationCode: string | null;
  materialSelectOptions: Array<{ value: string, label: string }>;
  selectedMaterialCode: string | null;
  protectionSelectOptions: Array<{ value: string, label: string }>; // Если protectionSelectOptions не используется, можно убрать
  selectedProtectionCode: string | null;
  brightnessSelectOptions: Array<{ value: string, label: string }>;
  selectedBrightnessCode: string | null;
  refreshRateSelectOptions: Array<{ value: string, label: string }>;
  selectedRefreshRateCode: string | null;
  widthMm: string | number;
  heightMm: string | number;
  selectedScreenTypeCode: string | null;
  localDollarRateInput: number | string;
}

// Определяем интерфейс для функций обратного вызова (сеттеров состояния из контекста)
interface CalculationSetters {
  setIsCalculatingState: (isCalculating: boolean) => void;
  setCalculationResultState: (result: TechnicalSpecsResult | null) => void;
  setCostDetailsState: (costs: CostCalculationResult | null) => void;
  setIsDrawerOpenState: (isOpen: boolean) => void;
}

export function useCalculationPerformer(
  params: CalculationParams,
  setters: CalculationSetters
): () => Promise<void> {
  const {
    isCalculationReady,
    selectedModuleDetails,
    isCabinetScreenTypeSelected,
    selectedCabinetDetails,
    priceMap,
    gqlFilteredPitches,
    selectedPitchCode,
    locationSelectOptions,
    selectedLocationCode,
    materialSelectOptions,
    selectedMaterialCode,
    selectedProtectionCode,
    brightnessSelectOptions,
    selectedBrightnessCode,
    refreshRateSelectOptions,
    selectedRefreshRateCode,
    widthMm,
    heightMm,
    selectedScreenTypeCode,
    localDollarRateInput,
  } = params;

  const {
    setIsCalculatingState,
    setCalculationResultState,
    setCostDetailsState,
    setIsDrawerOpenState,
  } = setters;

  const performCalculation = useCallback(async () => {
    if (
      !isCalculationReady ||
      !selectedModuleDetails ||
      (isCabinetScreenTypeSelected && !selectedCabinetDetails) ||
      !priceMap // priceMap здесь уже результат select из useComponentPrices, т.е. PriceMap
    ) {
      console.warn(
        "Calculation prerequisites not met or essential data missing (performCalculation). Details:",
        {
          isCalculationReady,
          selectedModuleDetails,
          isCabinetScreenTypeSelected,
          selectedCabinetDetails,
          priceMap,
        }
      );
      return;
    }

    setIsCalculatingState(true);
    setCalculationResultState(null);
    setCostDetailsState(null);

    try {
      const pitchObject = gqlFilteredPitches.find(p => p?.code === selectedPitchCode);
      const pitchValue = pitchObject?.pitchValue;

      if (typeof pitchValue !== 'number') { // Строгая проверка
        console.error("Pitch object or value not found:", { pitchObject, selectedPitchCode, gqlFilteredPitches });
        throw new Error(`Pitch value for code '${selectedPitchCode}' not found or not a number.`);
      }

      const formData: CalculatorFormData = {
        selectedPlacement: locationSelectOptions.find(l => l.value === selectedLocationCode)?.label ?? selectedLocationCode ?? "",
        selectedMaterialName: materialSelectOptions.find(m => m.value === selectedMaterialCode)?.label ?? selectedMaterialCode ?? "",
        selectedProtectionCode: selectedProtectionCode ?? "",
        selectedBrightnessLabel: brightnessSelectOptions.find(b => b.value === selectedBrightnessCode)?.label ?? selectedBrightnessCode ?? "",
        selectedRefreshRateLabel: refreshRateSelectOptions.find(r => r.value === selectedRefreshRateCode)?.label ?? selectedRefreshRateCode ?? "",
        selectedPitchValue: pitchValue, // Теперь это гарантированно number
        selectedScreenWidth: Number(widthMm) || 0,
        selectedScreenHeight: Number(heightMm) || 0,
        selectedScreenTypeCode: selectedScreenTypeCode ?? "",
        moduleItemComponents: selectedModuleDetails.components?.map(c => ({
          itemCode: c.itemCode,
          itemName: c.itemName,
          countPerModule: c.quantity,
        })) ?? [],
      };

      const techSpecResult = calculateTechnicalSpecs(
        formData,
        selectedModuleDetails,
        isCabinetScreenTypeSelected ? selectedCabinetDetails : null
      );

      if (!techSpecResult) {
        throw new Error("Technical spec calculation failed or returned null.");
      }
      setCalculationResultState(techSpecResult);

      const costResult = calculateCosts(
        techSpecResult,
        priceMap,
        Number(localDollarRateInput), // Убедитесь, что это число
        isCabinetScreenTypeSelected ? selectedMaterialCode : null
      );
      setCostDetailsState(costResult);
      setIsDrawerOpenState(true);

    } catch (calcError: any) {
      console.error("❌ Calculation failed in useCalculationPerformer:", calcError?.message ?? calcError);
      setCalculationResultState(null);
      setCostDetailsState(null);
      // Возможно, стоит также setIsDrawerOpenState(false) или показать ошибку пользователю
    } finally {
      setIsCalculatingState(false);
    }
  }, [ // Тщательно проверьте и дополните этот массив зависимостей!
    isCalculationReady, selectedModuleDetails, isCabinetScreenTypeSelected, selectedCabinetDetails, priceMap,
    gqlFilteredPitches, selectedPitchCode, locationSelectOptions, selectedLocationCode, materialSelectOptions, selectedMaterialCode,
    selectedProtectionCode, brightnessSelectOptions, selectedBrightnessCode, refreshRateSelectOptions, selectedRefreshRateCode,
    widthMm, heightMm, selectedScreenTypeCode, localDollarRateInput,
    setIsCalculatingState, setCalculationResultState, setCostDetailsState, setIsDrawerOpenState,
    calculateTechnicalSpecs, calculateCosts // Если они импортированы и являются стабильными ссылками, их можно не включать, но ESLint может потребовать
  ]);

  return performCalculation;
}