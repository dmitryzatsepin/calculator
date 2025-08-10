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
    CostLineItem,
} from "../types/calculationTypes";
import type { CabinetDetailsData } from '../graphql/calculator.types';
import type { Bitrix24Params } from '../hooks/useBitrix24Params';

import { useCalculatorForm } from "./CalculatorFormProvider";
import { useCalculatorData } from "./CalculatorDataProvider";
import { useCalculationPerformer } from "../hooks/useCalculationPerformer";
import { checkCalculationReadiness } from "../utils/calculatorValidation";
import { useBitrix24Params } from "../hooks/useBitrix24Params";

interface CalculationResultContextType {
    isCalculating: boolean;
    isDrawerOpen: boolean;
    calculationResult: TechnicalSpecsResult | null;
    costDetails: CostCalculationResult | null;
    isCalculationReady: boolean;
    performCalculation: () => Promise<void>;
    setIsDrawerOpen: (open: boolean) => void;
    resetQuery: () => void;
    editableZipItems: CostLineItem[];
    setEditableZipItems: React.Dispatch<React.SetStateAction<CostLineItem[]>>;
    editableAdditionalItems: CostLineItem[];
    setEditableAdditionalItems: React.Dispatch<React.SetStateAction<CostLineItem[]>>;
    // Добавляем параметры Битрикс24
    bitrix24Params: Bitrix24Params | null;
    isBitrix24Available: boolean;
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

    // Получаем параметры Битрикс24
    const bitrix24Params = useBitrix24Params();
    const isBitrix24Available = !!bitrix24Params;

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
            brightness: details.brightness,
            refreshRate: details.refreshRate,
            components: [],
        };
    }, [dataState.moduleDetails]);

    const processedCabinetData = useMemo((): CabinetData | null => {
        const details: CabinetDetailsData | null = dataState.cabinetDetails;
        if (!details || !details.sizes || details.sizes.length === 0 || details.active === false) return null;

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
    const [editableZipItems, setEditableZipItems] = useState<CostLineItem[]>([]);
    const [editableAdditionalItems, setEditableAdditionalItems] = useState<CostLineItem[]>([]);

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
        allProcessors: dataState.videoProcessors,
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
        dataState.videoProcessors,
        formState
    ]);

    const calculationSetters = useMemo(() => ({
        setIsCalculatingState,
        setCalculationResultState,
        setCostDetailsState,
        setIsDrawerOpenState,
        setEditableZipItems,
        setEditableAdditionalItems,
    }), [setEditableZipItems, setEditableAdditionalItems]);

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
        editableZipItems,
        setEditableZipItems,
        editableAdditionalItems,
        setEditableAdditionalItems,
        // Добавляем параметры Битрикс24
        bitrix24Params,
        isBitrix24Available,
    }), [
        isCalculating, isDrawerOpen, calculationResult, costDetails,
        isCalculationReady, performCalculation, resetQuery, editableZipItems, editableAdditionalItems,
        bitrix24Params, isBitrix24Available
    ]);

    return (
        <CalculationResultContext.Provider value={value}>
            {children}
        </CalculationResultContext.Provider>
    );
};