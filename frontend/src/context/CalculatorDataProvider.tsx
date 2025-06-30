// frontend/src/context/CalculatorDataProvider.tsx
import { createContext, useMemo, useContext, ReactNode } from "react";
import { useCalculatorForm } from "./CalculatorFormProvider"; // <-- Используем наш новый хук

// --- Импорты типов и хуков ---
import type { ProcessedInitialData } from '../hooks/useInitialCalculatorData';
import type { ProcessedScreenTypeOption } from '../hooks/useScreenTypeOptions';
import type { ProcessedPitchOption } from '../hooks/usePitchOptions';
import type { ProcessedRefreshRateOption } from '../hooks/useFilteredRefreshRates';
import type { ProcessedBrightnessOption } from '../hooks/useFilteredBrightnesses';
import type { ProcessedModuleOption } from '../hooks/useModuleOptions';
import type { ProcessedCabinetOption } from '../hooks/useCabinetOptions';
import type { Maybe } from "../generated/graphql/graphql";
import type { PriceMap } from '../types/calculationTypes';
import type { ModuleDetailsData, CabinetDetailsData } from '../graphql/calculator.types';
import type { PriceRequestArgs } from '../hooks/useComponentPrices';

import { useInitialCalculatorData } from '../hooks/useInitialCalculatorData';
import { useScreenTypeOptions } from '../hooks/useScreenTypeOptions';
import { usePitchOptions } from '../hooks/usePitchOptions';
import { useFilteredRefreshRates } from '../hooks/useFilteredRefreshRates';
import { useFilteredBrightnesses } from '../hooks/useFilteredBrightnesses';
import { useModuleOptions } from '../hooks/useModuleOptions';
import { useCabinetOptions } from '../hooks/useCabinetOptions';
import { useDollarRate } from '../hooks/useDollarRate';
import { useModuleDetails } from '../hooks/useModuleDetails';
import { useCabinetDetails } from '../hooks/useCabinetDetails';
import { useComponentPrices } from '../hooks/useComponentPrices';

type SelectOption = { label: string; value: string };

// --- Интерфейс для этого контекста ---
interface CalculatorDataContextType {
    // Все данные и статусы, которые мы получаем
    initialData: ProcessedInitialData;
    isLoadingInitialData: boolean;
    isErrorInitialData: boolean;
    errorInitialData: Error | null;

    screenTypeOptions: ProcessedScreenTypeOption[];
    isLoadingScreenTypeOptions: boolean;
    isErrorScreenTypeOptions: boolean;
    errorScreenTypeOptions: Error | null;

    pitchOptionsData: ProcessedPitchOption[];
    isLoadingPitches: boolean;
    isErrorPitches: boolean;
    errorPitches: Error | null;

    refreshRateOptionsData: ProcessedRefreshRateOption[];
    isLoadingRefreshRates: boolean;
    isErrorRefreshRates: boolean;
    errorRefreshRates: Error | null;

    brightnessOptionsData: ProcessedBrightnessOption[];
    isLoadingBrightnesses: boolean;
    isErrorBrightnesses: boolean;
    errorBrightnesses: Error | null;

    moduleOptionsData: ProcessedModuleOption[];
    isLoadingModules: boolean;
    isErrorModules: boolean;
    errorModules: Error | null;

    cabinetOptionsData: ProcessedCabinetOption[];
    isLoadingCabinets: boolean;
    isErrorCabinets: boolean;
    errorCabinets: Error | null;

    dollarRateValue: Maybe<number>;
    isLoadingDollarRate: boolean;
    isErrorDollarRate: boolean;
    errorDollarRate: Error | null;

    moduleDetails: ModuleDetailsData | null;
    isLoadingModuleDetails: boolean;
    isFetchingModuleDetails: boolean;
    isErrorModuleDetails: boolean;
    errorModuleDetails: Error | null;

    cabinetDetails: CabinetDetailsData | null;
    isLoadingCabinetDetails: boolean;
    isFetchingCabinetDetails: boolean;
    isErrorCabinetDetails: boolean;
    errorCabinetDetails: Error | null;

    priceMap: PriceMap;
    isLoadingPrices: boolean;
    isFetchingPrices: boolean;
    isErrorPrices: boolean;
    errorPrices: Error | null;

    // И все мемоизированные опции для селектов
    screenTypeSegments: SelectOption[];
    isFlexOptionAvailableForSelectedScreenType: boolean;
    locationSelectOptions: SelectOption[];
    materialSelectOptions: SelectOption[];
    protectionSelectOptions: SelectOption[];
    brightnessSelectOptions: SelectOption[];
    sensorSelectOptions: SelectOption[];
    controlTypeSelectOptions: SelectOption[];
    pitchSelectOptions: SelectOption[];
    refreshRateSelectOptions: SelectOption[];
    moduleSelectOptions: SelectOption[];
    cabinetSelectOptions: SelectOption[];
}

const CalculatorDataContext = createContext<CalculatorDataContextType | undefined>(undefined);

export const useCalculatorData = () => {
    const context = useContext(CalculatorDataContext);
    if (!context) {
        throw new Error("useCalculatorData must be used within a CalculatorDataProvider");
    }
    return context;
};

export const CalculatorDataProvider = ({ children }: { children: ReactNode }) => {
    // --- Получаем состояние формы из FormProvider ---
    const {
        selectedScreenTypeCode,
        selectedLocationCode,
        isFlexSelected,
        selectedPitchCode,
        selectedRefreshRateCode,
        selectedBrightnessCode,
        selectedMaterialCode,
        selectedModuleCode,
        selectedCabinetCode,
        isCabinetScreenTypeSelected,
    } = useCalculatorForm();

    // --- Вызываем все хуки для получения данных, используя состояние формы ---
    const initialDataResult = useInitialCalculatorData();
    const screenTypeOptionsResult = useScreenTypeOptions(selectedScreenTypeCode);
    const pitchOptionsResult = usePitchOptions(selectedLocationCode);
    const refreshRateResult = useFilteredRefreshRates(selectedLocationCode, selectedPitchCode, isFlexSelected);
    const brightnessResult = useFilteredBrightnesses(selectedLocationCode, selectedPitchCode, selectedRefreshRateCode, isFlexSelected);
    const moduleOptionsFilters = useMemo(() => ({ locationCode: selectedLocationCode, pitchCode: selectedPitchCode, brightnessCode: selectedBrightnessCode, refreshRateCode: selectedRefreshRateCode }), [selectedLocationCode, selectedPitchCode, selectedBrightnessCode, selectedRefreshRateCode]);
    const moduleOptionsResult = useModuleOptions(moduleOptionsFilters, isFlexSelected);
    const cabinetOptionsFilters = useMemo(() => ({ locationCode: selectedLocationCode, materialCode: selectedMaterialCode, pitchCode: selectedPitchCode, moduleCode: selectedModuleCode }), [selectedLocationCode, selectedMaterialCode, selectedPitchCode, selectedModuleCode]);
    const cabinetOptionsResult = useCabinetOptions(cabinetOptionsFilters, isCabinetScreenTypeSelected);
    const dollarRateResult = useDollarRate();
    const moduleDetailsResult = useModuleDetails(selectedModuleCode);
    const cabinetDetailsResult = useCabinetDetails(selectedCabinetCode, isCabinetScreenTypeSelected);
    const priceRequestArgs = useMemo((): PriceRequestArgs | null => {
        const itemCodesSet = new Set<string>(["bp300", "receiver", "magnets", "steel_cab_price_m2"]);
        const args: PriceRequestArgs = {};
        if (selectedModuleCode) args.moduleCode = selectedModuleCode;
        if (isCabinetScreenTypeSelected && selectedCabinetCode) args.cabinetCode = selectedCabinetCode;
        if (itemCodesSet.size > 0) args.itemCodes = Array.from(itemCodesSet);
        if (!args.moduleCode && !args.cabinetCode && (!args.itemCodes || args.itemCodes.length === 0)) return null;
        return args;
    }, [selectedModuleCode, selectedCabinetCode, isCabinetScreenTypeSelected]);
    const priceResult = useComponentPrices(priceRequestArgs);

    // --- Формируем опции для селектов ---
    const screenTypeSegments = useMemo((): SelectOption[] => initialDataResult.screenTypes
        .map(st => ({
            value: st.code ?? '',
            label: st.name ?? st.code ?? ''
        })), [initialDataResult.screenTypes]);
    const locationSelectOptions = useMemo((): SelectOption[] =>
        initialDataResult.locations
            .filter(loc => loc.active && loc.code && loc.name)
            .map(loc => ({
                value: loc.code as string,
                label: loc.name as string,
            })),
        [initialDataResult.locations]
    );
    const materialSelectOptions = useMemo((): SelectOption[] =>
        initialDataResult.materials
            .filter(mat => mat.active && mat.code && mat.name)
            .map(mat => ({
                value: mat.code as string,
                label: mat.name as string,
            })),
        [initialDataResult.materials]
    );
    const protectionSelectOptions = useMemo((): SelectOption[] =>
        initialDataResult.ipProtections
            .filter(ip => ip && ip.code)
            .sort((a, b) => a.code!.localeCompare(b.code!))
            .map(ip => ({
                value: ip.code!,
                label: ip.code!,
            })),
        [initialDataResult.ipProtections]
    );
    const pitchSelectOptions = useMemo((): SelectOption[] =>
        pitchOptionsResult.pitches
            .filter(p => p && typeof p.code === 'string' && typeof p.pitchValue === 'number')
            .sort((a, b) => a.pitchValue! - b.pitchValue!)
            .map(p => ({
                value: p.code!,
                label: `${p.pitchValue} мм`
            })),
        [pitchOptionsResult.pitches]
    );
    const brightnessSelectOptions = useMemo((): SelectOption[] =>
        brightnessResult.brightnesses
            .filter(br => br && br.code)
            .map(br => ({ value: br.code!, label: `${br.value} nit` })),
        [brightnessResult.brightnesses]
    );
    const refreshRateSelectOptions = useMemo((): SelectOption[] =>
        refreshRateResult.refreshRates
            .filter(rr => rr && rr.code)
            .map(rr => ({ value: rr.code!, label: `${rr.value} Hz` })),
        [refreshRateResult.refreshRates]
    );
    const sensorSelectOptions = useMemo((): SelectOption[] =>
        initialDataResult.sensors
            .filter(s => s.active && s.code && s.name)
            .sort((a, b) => a.name!.localeCompare(b.name!))
            .map(s => ({ value: s.code!, label: s.name! })),
        [initialDataResult.sensors]
    );
    const controlTypeSelectOptions = useMemo((): SelectOption[] =>
        initialDataResult.controlTypes
            .filter(ct => ct.active && ct.code && ct.name)
            .sort((a, b) => a.name!.localeCompare(b.name!))
            .map(ct => ({ value: ct.code!, label: ct.name! })),
        [initialDataResult.controlTypes]
    );
    const moduleSelectOptions = useMemo((): SelectOption[] =>
        moduleOptionsResult.modules
            .filter(m => m && m.code)
            .map(m => ({ value: m.code!, label: m.name ?? m.sku ?? m.code! })),
        [moduleOptionsResult.modules]
    );
    const cabinetSelectOptions = useMemo((): SelectOption[] =>
        cabinetOptionsResult.cabinets
            .filter(c => c && c.code)
            .map(c => ({ value: c.code!, label: c.name ?? c.sku ?? c.code! })),
        [cabinetOptionsResult.cabinets]
    );
    const isFlexOptionAvailableForSelectedScreenType = useMemo((): boolean => screenTypeOptionsResult.options.some(opt => opt?.code === "flex"), [screenTypeOptionsResult.options]);

    // --- Формируем значение контекста ---
    const value = useMemo(() => ({
        initialData: initialDataResult,
        isLoadingInitialData: initialDataResult.isLoading, isErrorInitialData: initialDataResult.isError, errorInitialData: initialDataResult.error,
        screenTypeOptions: screenTypeOptionsResult.options,
        isLoadingScreenTypeOptions: screenTypeOptionsResult.isLoading, isErrorScreenTypeOptions: screenTypeOptionsResult.isError, errorScreenTypeOptions: screenTypeOptionsResult.error,
        pitchOptionsData: pitchOptionsResult.pitches,
        isLoadingPitches: pitchOptionsResult.isLoading, isErrorPitches: pitchOptionsResult.isError, errorPitches: pitchOptionsResult.error,
        refreshRateOptionsData: refreshRateResult.refreshRates,
        isLoadingRefreshRates: refreshRateResult.isLoading, isErrorRefreshRates: refreshRateResult.isError, errorRefreshRates: refreshRateResult.error,
        brightnessOptionsData: brightnessResult.brightnesses,
        isLoadingBrightnesses: brightnessResult.isLoading, isErrorBrightnesses: brightnessResult.isError, errorBrightnesses: brightnessResult.error,
        moduleOptionsData: moduleOptionsResult.modules,
        isLoadingModules: moduleOptionsResult.isLoading, isErrorModules: moduleOptionsResult.isError, errorModules: moduleOptionsResult.error,
        cabinetOptionsData: cabinetOptionsResult.cabinets,
        isLoadingCabinets: cabinetOptionsResult.isLoading, isErrorCabinets: cabinetOptionsResult.isError, errorCabinets: cabinetOptionsResult.error,
        dollarRateValue: dollarRateResult.dollarRate,
        isLoadingDollarRate: dollarRateResult.isLoading, isErrorDollarRate: dollarRateResult.isError, errorDollarRate: dollarRateResult.error,
        moduleDetails: moduleDetailsResult.moduleDetails,
        isLoadingModuleDetails: moduleDetailsResult.isLoading, isFetchingModuleDetails: moduleDetailsResult.isFetching, isErrorModuleDetails: moduleDetailsResult.isError, errorModuleDetails: moduleDetailsResult.error,
        cabinetDetails: cabinetDetailsResult.cabinetDetails,
        isLoadingCabinetDetails: cabinetDetailsResult.isLoading, isFetchingCabinetDetails: cabinetDetailsResult.isFetching, isErrorCabinetDetails: cabinetDetailsResult.isError, errorCabinetDetails: cabinetDetailsResult.error,
        priceMap: priceResult.priceMap,
        isLoadingPrices: priceResult.isLoading, isFetchingPrices: priceResult.isFetching, isErrorPrices: priceResult.isError, errorPrices: priceResult.error,
        screenTypeSegments, isFlexOptionAvailableForSelectedScreenType,
        locationSelectOptions, materialSelectOptions, protectionSelectOptions,
        brightnessSelectOptions, refreshRateSelectOptions, sensorSelectOptions, controlTypeSelectOptions,
        pitchSelectOptions, moduleSelectOptions, cabinetSelectOptions,
    }), [
        initialDataResult, screenTypeOptionsResult, pitchOptionsResult, refreshRateResult, brightnessResult,
        moduleOptionsResult, cabinetOptionsResult, dollarRateResult, moduleDetailsResult, cabinetDetailsResult, priceResult,
        screenTypeSegments, isFlexOptionAvailableForSelectedScreenType, locationSelectOptions, materialSelectOptions, protectionSelectOptions,
        brightnessSelectOptions, refreshRateSelectOptions, sensorSelectOptions, controlTypeSelectOptions, pitchSelectOptions,
        moduleSelectOptions, cabinetSelectOptions,
    ]);

    return (
        <CalculatorDataContext.Provider value={value}>
            {children}
        </CalculatorDataContext.Provider>
    );
};