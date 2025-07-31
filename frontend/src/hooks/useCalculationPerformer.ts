import { useCallback } from 'react';
import type {
  CalculatorFormData,
  TechnicalSpecsResult,
  CostCalculationResult,
  ModuleData,
  CabinetData,
  PriceMap,
  VideoProcessor,
} from '../types/calculationTypes';
import {
  calculateTechnicalSpecs,
  calculateCosts,
} from '../utils/calculations';

interface CalculationParams {
  isCalculationReady: boolean;
  selectedModuleDetails: ModuleData | null;
  isCabinetScreenTypeSelected: boolean;
  selectedCabinetDetails: CabinetData | null;
  priceMap: PriceMap;
  gqlFilteredPitches: Array<{ code?: string | null, pitchValue?: number | null, [key: string]: any } | null>;
  selectedPitchCode: string | null;
  locationSelectOptions: Array<{ value: string, label: string }>;
  selectedLocationCode: string | null;
  materialSelectOptions: Array<{ value: string, label: string }>;
  selectedMaterialCode: string | null;
  protectionSelectOptions: Array<{ value: string, label: string }>;
  selectedProtectionCode: string | null;
  widthMm: string | number;
  heightMm: string | number;
  selectedScreenTypeCode: string | null;
  localDollarRateInput: number | string;
  allProcessors: VideoProcessor[];
}

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
    widthMm,
    heightMm,
    selectedScreenTypeCode,
    localDollarRateInput,
    allProcessors,
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
      !priceMap
    ) {
      console.warn(
        "Calculation prerequisites not met or essential data missing (performCalculation).",
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

      if (typeof pitchValue !== 'number') {
        throw new Error(`Pitch value for code '${selectedPitchCode}' not found or not a number.`);
      }

      const formData: CalculatorFormData = {
        selectedPlacement: locationSelectOptions.find(l => l.value === selectedLocationCode)?.label ?? selectedLocationCode ?? "",
        selectedMaterialName: materialSelectOptions.find(m => m.value === selectedMaterialCode)?.label ?? selectedMaterialCode ?? "",
        selectedProtectionCode: selectedProtectionCode ?? "",
        selectedBrightnessLabel: selectedModuleDetails.brightness?.toString() ?? "-",
        selectedRefreshRateLabel: selectedModuleDetails.refreshRate?.toString() ?? "-",
        selectedPitchValue: pitchValue,
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
        Number(localDollarRateInput),
        isCabinetScreenTypeSelected ? selectedMaterialCode : null,
        allProcessors
      );
      setCostDetailsState(costResult);
      setIsDrawerOpenState(true);

    } catch (calcError: any) {
      console.error("❌ Calculation failed in useCalculationPerformer:", calcError?.message ?? calcError);
      setCalculationResultState(null);
      setCostDetailsState(null);
    } finally {
      setIsCalculatingState(false);
    }
  }, [
    isCalculationReady, selectedModuleDetails, isCabinetScreenTypeSelected, selectedCabinetDetails, priceMap,
    gqlFilteredPitches, selectedPitchCode, locationSelectOptions, selectedLocationCode, materialSelectOptions, selectedMaterialCode,
    selectedProtectionCode, widthMm, heightMm, selectedScreenTypeCode, localDollarRateInput, allProcessors,
    setIsCalculatingState, setCalculationResultState, setCostDetailsState, setIsDrawerOpenState,
  ]);

  return performCalculation;
}