import {
    createContext,
    useState,
    useMemo,
    useCallback,
    useContext,
    ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import type {
    TechnicalSpecsResult,
    CostCalculationResult,
    ModuleData,
    CabinetData,
} from "../types/calculationTypes";
import type { CabinetDetailsData } from '../graphql/calculator.types';

import { useCalculatorForm } from "./CalculatorFormProvider";
import { useCalculatorData } from "./CalculatorDataProvider";
import { useCalculationPerformer } from "../hooks/useCalculationPerformer";
import { checkCalculationReadiness } from "../utils/calculatorValidation";

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
    const formState = useCalculatorForm();
    const dataState = useCalculatorData();

    const processedModuleData = useMemo((): ModuleData | null => {
        const details = dataState.moduleDetails;
        if (!details || !details.sizes || details.sizes.length === 0) return null;

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
            brightness: details.brightness, // <-- Теперь просто берем готовое
            refreshRate: details.refreshRate, // <-- Теперь просто берем готовое
            components: [],
        };
    }, [dataState.moduleDetails]);

    const processedCabinetData = useMemo((): CabinetData | null => {
        const details: CabinetDetailsData | null = dataState.cabinetDetails;
        if (!details || !details.sizes || details.sizes.length === 0) return null;

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

    const [isCalculating, setIsCalculatingState] = useState<boolean>(false);
    const [isDrawerOpen, setIsDrawerOpenState] = useState<boolean>(false);
    const [calculationResult, setCalculationResultState] = useState<TechnicalSpecsResult | null>(null);
    const [costDetails, setCostDetailsState] = useState<CostCalculationResult | null>(null);

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
    }, [formState, dataState, isCalculating, processedModuleData, processedCabinetData]);

    const calculationParams = useMemo(() => ({
        isCalculationReady,
        selectedModuleDetails: processedModuleData,
        selectedCabinetDetails: processedCabinetData,
        priceMap: dataState.priceMap,
        gqlFilteredPitches: dataState.pitchOptionsData,
        locationSelectOptions: dataState.locationSelectOptions,
        materialSelectOptions: dataState.materialSelectOptions,
        protectionSelectOptions: dataState.protectionSelectOptions,
        ...formState,
    }), [
        isCalculationReady,
        processedModuleData,
        processedCabinetData,
        dataState.priceMap,
        dataState.pitchOptionsData,
        dataState.locationSelectOptions,
        dataState.materialSelectOptions,
        dataState.protectionSelectOptions,
        formState
    ]);

    const calculationSetters = useMemo(() => ({
        setIsCalculatingState,
        setCalculationResultState,
        setCostDetailsState,
        setIsDrawerOpenState,
    }), []);

    const performCalculation = useCalculationPerformer(calculationParams, calculationSetters);

    const resetQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["calculatorInitialData"] });
        queryClient.invalidateQueries({ queryKey: ["screenTypeOptions"] });
    }, [queryClient]);

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
        isCalculating, isDrawerOpen, calculationResult, costDetails,
        isCalculationReady, performCalculation, resetQuery
    ]);

    return (
        <CalculationResultContext.Provider value={value}>
            {children}
        </CalculationResultContext.Provider>
    );
};