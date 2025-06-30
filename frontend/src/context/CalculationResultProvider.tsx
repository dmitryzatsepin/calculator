// frontend/src/context/CalculationResultProvider.tsx
import {
    createContext,
    useState,
    useMemo,
    useCallback,
    useContext,
    ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

// --- Импорты типов ---
import type {
    TechnicalSpecsResult,
    CostCalculationResult,
    ModuleData,
    CabinetData,
} from "../types/calculationTypes";

import type {
    ModuleDetailsData,
    CabinetDetailsData,
} from '../graphql/calculator.types';

// --- Импорты хуков и утилит ---
import { useCalculatorForm } from "./CalculatorFormProvider";
import { useCalculatorData } from "./CalculatorDataProvider";
import { useCalculationPerformer } from "../hooks/useCalculationPerformer";
import { checkCalculationReadiness } from "../utils/calculatorValidation";

// --- Интерфейс для этого контекста ---
interface CalculationResultContextType {
    isCalculating: boolean;
    isDrawerOpen: boolean;
    calculationResult: TechnicalSpecsResult | null;
    costDetails: CostCalculationResult | null;
    isCalculationReady: boolean;
    performCalculation: () => Promise<void>;
    setIsDrawerOpen: (open: boolean) => void;
    resetQuery: () => void;
}

const CalculationResultContext = createContext<CalculationResultContextType | undefined>(undefined);

export const useCalculationResult = () => {
    const context = useContext(CalculationResultContext);
    if (!context) {
        throw new Error("useCalculationResult must be used within a CalculationResultProvider");
    }
    return context;
};

export const CalculationResultProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();

    // --- Получаем данные из других контекстов ---
    const formState = useCalculatorForm();
    const dataState = useCalculatorData();

    // --- Трансформация данных для расчетов ---
    const processedModuleData = useMemo((): ModuleData | null => {
        const details: ModuleDetailsData | null = dataState.moduleDetails;
        if (!details || !details.sizes || details.sizes.length === 0) {
            return null;
        }
        // Берем первый размер из массива
        const size = details.sizes[0];
        if (!size) return null;

        return {
            code: details.code,
            sku: details.sku,
            name: details.name,
            width: size.width,
            height: size.height,
            powerConsumptionAvg: details.powerConsumptionAvg,
            powerConsumptionMax: details.powerConsumptionMax,
            components: [], // Пока оставляем пустым, т.к. `items` не запрашиваются
        };
    }, [dataState.moduleDetails]);

    const processedCabinetData = useMemo((): CabinetData | null => {
        const details: CabinetDetailsData | null = dataState.cabinetDetails;
        // Проверяем всю цепочку вложенности
        if (!details || !details.sizes || details.sizes.length === 0) {
            return null;
        }
        const sizeLink = details.sizes[0];
        if (!sizeLink || !sizeLink.size) return null;

        return {
            code: details.code,
            sku: details.sku,
            name: details.name,
            width: sizeLink.size.width,
            height: sizeLink.size.height,
        };
    }, [dataState.cabinetDetails]);

    // --- Локальные состояния для результатов ---
    const [isCalculating, setIsCalculatingState] = useState<boolean>(false);
    const [isDrawerOpen, setIsDrawerOpenState] = useState<boolean>(false);
    const [calculationResult, setCalculationResultState] = useState<TechnicalSpecsResult | null>(null);
    const [costDetails, setCostDetailsState] = useState<CostCalculationResult | null>(null);

    // --- Логика isCalculationReady ---
    const isCalculationReady = useMemo((): boolean => {
        return checkCalculationReadiness({
            ...formState,
            selectedModuleDetailsState: processedModuleData,
            isLoadingModuleDetails: dataState.isLoadingModuleDetails,
            isErrorModuleDetails: dataState.isErrorModuleDetails,
            selectedCabinetDetailsState: processedCabinetData,
            isLoadingCabinetDetails: dataState.isLoadingCabinetDetails,
            isErrorCabinetDetails: dataState.isErrorCabinetDetails,
            isLoadingPrices: dataState.isLoadingPrices,
            isErrorPrices: dataState.isErrorPrices,
            priceMap: dataState.priceMap,
            isCalculating,
        });
    }, [formState, dataState, isCalculating]);

    // --- performCalculation (используем кастомный хук) ---
    const calculationParams = useMemo(() => ({
        isCalculationReady,
        selectedModuleDetails: processedModuleData,
        selectedCabinetDetails: processedCabinetData,
        priceMap: dataState.priceMap,
        gqlFilteredPitches: dataState.pitchOptionsData,
        locationSelectOptions: dataState.locationSelectOptions,
        materialSelectOptions: dataState.materialSelectOptions,
        protectionSelectOptions: dataState.protectionSelectOptions,
        brightnessSelectOptions: dataState.brightnessSelectOptions,
        refreshRateSelectOptions: dataState.refreshRateSelectOptions,
        ...formState,
    }), [isCalculationReady, dataState, formState]);

    const calculationSetters = useMemo(() => ({
        setIsCalculatingState,
        setCalculationResultState,
        setCostDetailsState,
        setIsDrawerOpenState,
    }), []); // Сеттеры стабильны

    const performCalculation = useCalculationPerformer(calculationParams, calculationSetters);

    // --- resetQuery ---
    const resetQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["calculatorInitialData"] });
        queryClient.invalidateQueries({ queryKey: ["screenTypeOptions"] });
        // ... и так далее для всех ключей
        // Этот хук может быть более общим, если нужно
    }, [queryClient]);

    // --- Формируем значение контекста ---
    const value = useMemo(() => ({
        isCalculating,
        isDrawerOpen,
        calculationResult,
        costDetails,
        isCalculationReady,
        performCalculation,
        setIsDrawerOpen: setIsDrawerOpenState,
        resetQuery,
    }), [
        isCalculating,
        isDrawerOpen,
        calculationResult,
        costDetails,
        isCalculationReady,
        performCalculation,
        resetQuery
    ]);

    return (
        <CalculationResultContext.Provider value={value}>
            {children}
        </CalculationResultContext.Provider>
    );
};