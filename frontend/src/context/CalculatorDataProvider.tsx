import { createContext, useMemo, useContext, ReactNode, useEffect, useState } from "react";
import { useCalculatorForm } from "./CalculatorFormProvider";

import type { ProcessedInitialData } from '../hooks/useInitialCalculatorData';
import type { ProcessedScreenTypeOption } from '../hooks/useScreenTypeOptions';
import type { ProcessedPitchOption } from '../hooks/usePitchOptions';
import type { ProcessedModuleOption } from '../hooks/useModuleOptions';
import type { ProcessedCabinetOption } from '../hooks/useCabinetOptions';
import type { Maybe } from "../generated/graphql/graphql";
import type { PriceMap } from '../types/calculationTypes';
import type { ModuleDetailsData, CabinetDetailsData } from '../graphql/calculator.types';
import type { PriceRequestArgs } from '../hooks/useComponentPrices';

import { useInitialCalculatorData } from '../hooks/useInitialCalculatorData';
import { useScreenTypeOptions } from '../hooks/useScreenTypeOptions';
import { usePitchOptions } from '../hooks/usePitchOptions';
import { useModuleOptions } from '../hooks/useModuleOptions';
import { useCabinetOptions } from '../hooks/useCabinetOptions';
import { useDollarRate } from '../hooks/useDollarRate';
import { useModuleDetails } from '../hooks/useModuleDetails';
import { useCabinetDetails } from '../hooks/useCabinetDetails';
import { useComponentPrices } from '../hooks/useComponentPrices';

type SelectOption = { label: string; value: string };

// Добавляем новый тип для обогащенных данных
type EnrichedModuleDetails = ModuleDetailsData & {
    brightness?: number | null;
    refreshRate?: number | null;
};

interface CalculatorDataContextType {
    hasProOption: boolean;
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
    moduleDetails: EnrichedModuleDetails | null; // <-- ИЗМЕНЕНО
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
    screenTypeSegments: SelectOption[];
    isFlexOptionAvailableForSelectedScreenType: boolean;
    locationSelectOptions: SelectOption[];
    materialSelectOptions: SelectOption[];
    protectionSelectOptions: SelectOption[];
    sensorSelectOptions: SelectOption[];
    controlTypeSelectOptions: SelectOption[];
    pitchSelectOptions: SelectOption[];
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
    const {
        selectedScreenTypeCode,
        selectedLocationCode,
        isFlexSelected,
        isProVersionSelected,
        selectedPitchCode,
        selectedMaterialCode,
        selectedModuleCode,
        selectedCabinetCode,
        isCabinetScreenTypeSelected,
        setSelectedModuleCode,
    } = useCalculatorForm();

    const isReadyForPricing = useMemo(() => {
        return !!selectedModuleCode && (
            !isCabinetScreenTypeSelected || (isCabinetScreenTypeSelected && !!selectedCabinetCode)
        );
    }, [selectedModuleCode, isCabinetScreenTypeSelected, selectedCabinetCode]);

    const [hasProOption, setHasProOption] = useState(false);

    const initialDataResult = useInitialCalculatorData();
    const screenTypeOptionsResult = useScreenTypeOptions(selectedScreenTypeCode);
    const pitchOptionsResult = usePitchOptions(selectedLocationCode);
    const moduleOptionsFilters = useMemo(() => ({ locationCode: selectedLocationCode, pitchCode: selectedPitchCode }), [selectedLocationCode, selectedPitchCode]);
    const moduleOptionsResult = useModuleOptions(moduleOptionsFilters, isFlexSelected);
    const cabinetOptionsFilters = useMemo(() => ({ locationCode: selectedLocationCode, materialCode: selectedMaterialCode, pitchCode: selectedPitchCode, moduleCode: selectedModuleCode }), [selectedLocationCode, selectedMaterialCode, selectedPitchCode, selectedModuleCode]);
    const cabinetOptionsResult = useCabinetOptions(cabinetOptionsFilters, isCabinetScreenTypeSelected);
    const dollarRateResult = useDollarRate(isReadyForPricing);
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
    const priceResult = useComponentPrices(priceRequestArgs, isReadyForPricing);

    useEffect(() => {
        if (!selectedPitchCode || moduleOptionsResult.isFetching) {
            setHasProOption(false);
            return;
        }
        if (moduleOptionsResult.modules.length === 0) {
            setHasProOption(false);
            if (selectedModuleCode) setSelectedModuleCode(null);
            return;
        }
        const allRefreshRateCodes = moduleOptionsResult.modules.flatMap(m => m.refreshRates?.map(r => r.refreshRateCode) ?? []).filter((code): code is string => !!code);
        const uniqueSortedCodes = [...new Set(allRefreshRateCodes)].sort();
        const hasChoice = uniqueSortedCodes.length > 1;
        setHasProOption(hasChoice);
        if (uniqueSortedCodes.length === 0) return;
        const targetRefreshRateCode = isProVersionSelected && hasChoice ? uniqueSortedCodes[uniqueSortedCodes.length - 1] : uniqueSortedCodes[0];
        const selectedModule = moduleOptionsResult.modules.find(m => m.refreshRates?.some(r => r.refreshRateCode === targetRefreshRateCode));
        if (selectedModule?.code && selectedModule.code !== selectedModuleCode) {
            setSelectedModuleCode(selectedModule.code);
        }
    }, [selectedPitchCode, moduleOptionsResult.modules, moduleOptionsResult.isFetching, isProVersionSelected, selectedModuleCode, setSelectedModuleCode]);

    const enrichedModuleDetails = useMemo((): EnrichedModuleDetails | null => {
        if (!moduleDetailsResult.moduleDetails) return null;

        const moduleFromOptions = moduleOptionsResult.modules.find(m => m.code === moduleDetailsResult.moduleDetails!.code);
        if (!moduleFromOptions) return moduleDetailsResult.moduleDetails;

        const brightnessCode = moduleFromOptions.brightnesses?.[0]?.brightnessCode;
        const refreshRateCode = moduleFromOptions.refreshRates?.[0]?.refreshRateCode;

        const brightnessValue = brightnessCode ? parseInt(brightnessCode, 10) : null;
        const refreshRateValue = refreshRateCode ? parseInt(refreshRateCode, 10) : null;

        return {
            ...moduleDetailsResult.moduleDetails,
            brightness: !isNaN(brightnessValue!) ? brightnessValue : null,
            refreshRate: !isNaN(refreshRateValue!) ? refreshRateValue : null,
        };
    }, [moduleDetailsResult.moduleDetails, moduleOptionsResult.modules]);

    const screenTypeSegments = useMemo((): SelectOption[] => initialDataResult.screenTypes.map(st => ({ value: st.code ?? '', label: st.name ?? st.code ?? '' })), [initialDataResult.screenTypes]);
    const locationSelectOptions = useMemo((): SelectOption[] => initialDataResult.locations.filter(loc => loc.active && loc.code && loc.name).map(loc => ({ value: loc.code as string, label: loc.name as string })), [initialDataResult.locations]);
    const materialSelectOptions = useMemo((): SelectOption[] => initialDataResult.materials.filter(mat => mat.active && mat.code && mat.name).map(mat => ({ value: mat.code as string, label: mat.name as string })), [initialDataResult.materials]);
    const protectionSelectOptions = useMemo((): SelectOption[] => initialDataResult.ipProtections.filter(ip => ip && ip.code).sort((a, b) => a.code!.localeCompare(b.code!)).map(ip => ({ value: ip.code!, label: ip.code! })), [initialDataResult.ipProtections]);
    const pitchSelectOptions = useMemo((): SelectOption[] => pitchOptionsResult.pitches.filter(p => p && typeof p.code === 'string' && typeof p.pitchValue === 'number').sort((a, b) => a.pitchValue! - b.pitchValue!).map(p => ({ value: p.code!, label: `${p.pitchValue} мм` })), [pitchOptionsResult.pitches]);
    const sensorSelectOptions = useMemo((): SelectOption[] => initialDataResult.sensors.filter(s => s.active && s.code && s.name).sort((a, b) => a.name!.localeCompare(b.name!)).map(s => ({ value: s.code!, label: s.name! })), [initialDataResult.sensors]);
    const controlTypeSelectOptions = useMemo((): SelectOption[] => initialDataResult.controlTypes.filter(ct => ct.active && ct.code && ct.name).sort((a, b) => a.name!.localeCompare(b.name!)).map(ct => ({ value: ct.code!, label: ct.name! })), [initialDataResult.controlTypes]);
    const moduleSelectOptions = useMemo((): SelectOption[] => moduleOptionsResult.modules.filter(m => m && m.code).map(m => ({ value: m.code!, label: m.name ?? m.sku ?? m.code! })), [moduleOptionsResult.modules]);
    const cabinetSelectOptions = useMemo((): SelectOption[] => cabinetOptionsResult.cabinets.filter(c => c && c.code).map(c => ({ value: c.code!, label: c.name ?? c.sku ?? c.code! })), [cabinetOptionsResult.cabinets]);
    const isFlexOptionAvailableForSelectedScreenType = useMemo((): boolean => selectedScreenTypeCode === "cabinet", [selectedScreenTypeCode]);

    const value = useMemo(() => ({
        hasProOption,
        initialData: initialDataResult,
        isLoadingInitialData: initialDataResult.isLoading, isErrorInitialData: initialDataResult.isError, errorInitialData: initialDataResult.error,
        screenTypeOptions: screenTypeOptionsResult.options,
        isLoadingScreenTypeOptions: screenTypeOptionsResult.isLoading, isErrorScreenTypeOptions: screenTypeOptionsResult.isError, errorScreenTypeOptions: screenTypeOptionsResult.error,
        pitchOptionsData: pitchOptionsResult.pitches,
        isLoadingPitches: pitchOptionsResult.isLoading, isErrorPitches: pitchOptionsResult.isError, errorPitches: pitchOptionsResult.error,
        moduleOptionsData: moduleOptionsResult.modules,
        isLoadingModules: moduleOptionsResult.isLoading, isErrorModules: moduleOptionsResult.isError, errorModules: moduleOptionsResult.error,
        cabinetOptionsData: cabinetOptionsResult.cabinets,
        isLoadingCabinets: cabinetOptionsResult.isLoading, isErrorCabinets: cabinetOptionsResult.isError, errorCabinets: cabinetOptionsResult.error,
        dollarRateValue: dollarRateResult.dollarRate,
        isLoadingDollarRate: dollarRateResult.isLoading, isErrorDollarRate: dollarRateResult.isError, errorDollarRate: dollarRateResult.error,
        moduleDetails: enrichedModuleDetails, // <-- ИЗМЕНЕНО
        isLoadingModuleDetails: moduleDetailsResult.isLoading, isFetchingModuleDetails: moduleDetailsResult.isFetching, isErrorModuleDetails: moduleDetailsResult.isError, errorModuleDetails: moduleDetailsResult.error,
        cabinetDetails: cabinetDetailsResult.cabinetDetails,
        isLoadingCabinetDetails: cabinetDetailsResult.isLoading, isFetchingCabinetDetails: cabinetDetailsResult.isFetching, isErrorCabinetDetails: cabinetDetailsResult.isError, errorCabinetDetails: cabinetDetailsResult.error,
        priceMap: priceResult.priceMap,
        isLoadingPrices: priceResult.isLoading, isFetchingPrices: priceResult.isFetching, isErrorPrices: priceResult.isError, errorPrices: priceResult.error,
        screenTypeSegments, isFlexOptionAvailableForSelectedScreenType,
        locationSelectOptions, materialSelectOptions, protectionSelectOptions,
        sensorSelectOptions, controlTypeSelectOptions,
        pitchSelectOptions,
        moduleSelectOptions, cabinetSelectOptions,
    }), [
        hasProOption, initialDataResult, screenTypeOptionsResult, pitchOptionsResult,
        moduleOptionsResult, cabinetOptionsResult, dollarRateResult, enrichedModuleDetails, cabinetDetailsResult, priceResult, // <-- ИЗМЕНЕНО
        moduleDetailsResult, // Добавил как зависимость
        screenTypeSegments, isFlexOptionAvailableForSelectedScreenType, locationSelectOptions, materialSelectOptions, protectionSelectOptions,
        sensorSelectOptions, controlTypeSelectOptions, pitchSelectOptions,
        moduleSelectOptions, cabinetSelectOptions,
    ]);

    return (
        <CalculatorDataContext.Provider value={value}>
            {children}
        </CalculatorDataContext.Provider>
    );
};