// frontend/src/context/CalculatorFormProvider.tsx
import { createContext, useState, useMemo, useCallback, useContext, ReactNode } from "react";

// Состояние формы
interface FormState {
    selectedScreenTypeCode: string | null;
    isFlexSelected: boolean;
    widthMm: string | number;
    heightMm: string | number;
    selectedLocationCode: string | null;
    selectedMaterialCode: string | null;
    selectedProtectionCode: string | null;
    selectedBrightnessCode: string | null;
    selectedRefreshRateCode: string | null;
    selectedSensorCodes: string[];
    selectedControlTypeCodes: string[];
    selectedPitchCode: string | null;
    selectedModuleCode: string | null;
    selectedCabinetCode: string | null;
    localDollarRateInput: number | string;
    isCabinetScreenTypeSelected: boolean;
}

// Функции для изменения состояния формы
interface FormActions {
    setSelectedScreenTypeCode: (code: string | null) => void;
    setIsFlexSelected: (selected: boolean) => void;
    // ... все остальные сеттеры
    setWidthMm: (value: string | number) => void;
    setHeightMm: (value: string | number) => void;
    setSelectedLocationCode: (code: string | null) => void;
    setSelectedMaterialCode: (code: string | null) => void;
    setSelectedProtectionCode: (code: string | null) => void;
    setSelectedBrightnessCode: (code: string | null) => void;
    setSelectedRefreshRateCode: (code: string | null) => void;
    setSelectedSensorCodes: (codes: string[]) => void;
    setSelectedControlTypeCodes: (codes: string[]) => void;
    setSelectedPitchCode: (code: string | null) => void;
    setSelectedModuleCode: (code: string | null) => void;
    setSelectedCabinetCode: (code: string | null) => void;
    setLocalDollarRateInput: (rate: number | string) => void;
}

// Тип контекста
type CalculatorFormContextType = FormState & FormActions;

const CalculatorFormContext = createContext<CalculatorFormContextType | undefined>(undefined);

export const useCalculatorForm = () => {
    const context = useContext(CalculatorFormContext);
    if (!context) {
        throw new Error("useCalculatorForm must be used within a CalculatorFormProvider");
    }
    return context;
};

export const CalculatorFormProvider = ({ children }: { children: ReactNode }) => {
    const [selectedScreenTypeCode, setSelectedScreenTypeCodeState] = useState<string | null>(null);
    const [widthMm, setWidthMmState] = useState<string | number>("");
    const [heightMm, setHeightMmState] = useState<string | number>("");
    const [selectedLocationCode, setSelectedLocationCodeState] = useState<string | null>(null);
    const [selectedMaterialCode, setSelectedMaterialCodeState] = useState<string | null>(null);
    const [selectedProtectionCode, setSelectedProtectionCodeState] = useState<string | null>(null);
    const [selectedBrightnessCode, setSelectedBrightnessCodeState] = useState<string | null>(null);
    const [selectedRefreshRateCode, setSelectedRefreshRateCodeState] = useState<string | null>(null);
    const [selectedSensorCodes, setSelectedSensorCodesState] = useState<string[]>([]);
    const [selectedControlTypeCodes, setSelectedControlTypeCodesState] = useState<string[]>([]);
    const [selectedPitchCode, setSelectedPitchCodeState] = useState<string | null>(null);
    const [selectedModuleCode, setSelectedModuleCodeState] = useState<string | null>(null);
    const [selectedCabinetCode, setSelectedCabinetCodeState] = useState<string | null>(null);
    const [isFlexSelected, setIsFlexSelectedState] = useState<boolean>(false);
    const [localDollarRateInput, setLocalDollarRateInputState] = useState<number | string>("");

    // Сеттеры с логикой сброса зависимых полей
    const setSelectedScreenTypeCode = useCallback((value: string | null) => {
        setSelectedScreenTypeCodeState(value);
        setSelectedLocationCodeState(null);
        setSelectedMaterialCodeState(null);
        setSelectedProtectionCodeState(null);
        setSelectedBrightnessCodeState(null);
        setSelectedRefreshRateCodeState(null);
        setSelectedSensorCodesState([]);
        setSelectedControlTypeCodesState([]);
        setSelectedPitchCodeState(null);
        setSelectedModuleCodeState(null);
        setSelectedCabinetCodeState(null);
        setIsFlexSelectedState(false);
    }, []);

    const setSelectedLocationCode = useCallback((value: string | null) => {
        setSelectedLocationCodeState(value);
        setSelectedMaterialCodeState(null);
        setSelectedBrightnessCodeState(null);
        setSelectedRefreshRateCodeState(null);
        setSelectedPitchCodeState(null);
        setSelectedModuleCodeState(null);
        setSelectedCabinetCodeState(null);
    }, []);

    // ... остальные сеттеры ...
    const setSelectedMaterialCode = useCallback((value: string | null) => { setSelectedMaterialCodeState(value); setSelectedCabinetCodeState(null); }, []);
    const setSelectedProtectionCode = useCallback((value: string | null) => setSelectedProtectionCodeState(value), []);
    const setSelectedBrightnessCode = useCallback((value: string | null) => { setSelectedBrightnessCodeState(value); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); }, []);
    const setSelectedRefreshRateCode = useCallback((value: string | null) => { setSelectedRefreshRateCodeState(value); setSelectedBrightnessCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); }, []);
    const setSelectedSensorCodes = useCallback((value: string[]) => setSelectedSensorCodesState(value), []);
    const setSelectedControlTypeCodes = useCallback((value: string[]) => setSelectedControlTypeCodesState(value), []);
    const setSelectedPitchCode = useCallback((value: string | null) => { setSelectedPitchCodeState(value); setSelectedRefreshRateCodeState(null); setSelectedBrightnessCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); }, []);
    const setSelectedModuleCode = useCallback((value: string | null) => { setSelectedModuleCodeState(value); setSelectedCabinetCodeState(null); }, []);
    const setSelectedCabinetCode = useCallback((value: string | null) => setSelectedCabinetCodeState(value), []);
    const setIsFlexSelected = useCallback((selected: boolean) => setIsFlexSelectedState(selected), []);
    const setLocalDollarRateInput = useCallback((value: number | string) => setLocalDollarRateInputState(value), []);
    const setWidthMm = useCallback((value: string | number) => setWidthMmState(value), []);
    const setHeightMm = useCallback((value: string | number) => setHeightMmState(value), []);

    const isCabinetScreenTypeSelected = selectedScreenTypeCode === "cabinet";

    const value = useMemo(() => ({
        selectedScreenTypeCode, widthMm, heightMm, selectedLocationCode, selectedMaterialCode,
        selectedProtectionCode, selectedBrightnessCode, selectedRefreshRateCode, selectedSensorCodes,
        selectedControlTypeCodes, selectedPitchCode, selectedModuleCode, selectedCabinetCode,
        isFlexSelected, localDollarRateInput, isCabinetScreenTypeSelected,
        setSelectedScreenTypeCode, setWidthMm, setHeightMm, setSelectedLocationCode,
        setSelectedMaterialCode, setSelectedProtectionCode, setSelectedBrightnessCode,
        setSelectedRefreshRateCode, setSelectedSensorCodes, setSelectedControlTypeCodes,
        setSelectedPitchCode, setSelectedModuleCode, setSelectedCabinetCode, setIsFlexSelected,
        setLocalDollarRateInput,
    }), [
        selectedScreenTypeCode, widthMm, heightMm, selectedLocationCode, selectedMaterialCode,
        selectedProtectionCode, selectedBrightnessCode, selectedRefreshRateCode, selectedSensorCodes,
        selectedControlTypeCodes, selectedPitchCode, selectedModuleCode, selectedCabinetCode,
        isFlexSelected, localDollarRateInput, isCabinetScreenTypeSelected,
        setSelectedScreenTypeCode, setWidthMm, setHeightMm, setSelectedLocationCode,
        setSelectedMaterialCode, setSelectedProtectionCode, setSelectedBrightnessCode,
        setSelectedRefreshRateCode, setSelectedSensorCodes, setSelectedControlTypeCodes,
        setSelectedPitchCode, setSelectedModuleCode, setSelectedCabinetCode, setIsFlexSelected,
        setLocalDollarRateInput,
    ]);

    return (
        <CalculatorFormContext.Provider value={value}>
            {children}
        </CalculatorFormContext.Provider>
    );
};