// src/types/calculationTypes.ts

export type CalculatorFormData = {
    selectedPlacement: string | null;
    selectedMaterialName: string | null;
    selectedProtectionCode: string | null;
    selectedBrightnessLabel: string | null;
    selectedRefreshRateLabel: string | null;
    selectedPitchValue: number;
    selectedScreenWidth: number;
    selectedScreenHeight: number;
    selectedScreenTypeCode: string;
    moduleItemComponents: {
      itemCode: string;
      itemName: string;
      countPerModule: number;
    }[];
  };