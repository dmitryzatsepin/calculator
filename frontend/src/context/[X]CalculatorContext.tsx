// // frontend/src/context/CalculatorContext.tsx
// import {
//     createContext,
//     useState,
//     useMemo,
//     useCallback,
//     useContext,
//     ReactNode,
// } from "react";
// import { useQueryClient } from "@tanstack/react-query";

// import type {
//     TechnicalSpecsResult,
//     CostCalculationResult,
//     ModuleData,
//     CabinetData,
//     PriceMap,
// } from "../types/calculationTypes";

// import { useInitialCalculatorData, type ProcessedInitialData } from '../hooks/useInitialCalculatorData';
// import { useScreenTypeOptions, type ProcessedScreenTypeOption } from '../hooks/useScreenTypeOptions';
// import { usePitchOptions, type ProcessedPitchOption } from '../hooks/usePitchOptions';
// import { useFilteredRefreshRates, type ProcessedRefreshRateOption } from '../hooks/useFilteredRefreshRates';
// import { useFilteredBrightnesses, type ProcessedBrightnessOption } from '../hooks/useFilteredBrightnesses';
// import { useModuleOptions, type ProcessedModuleOption } from '../hooks/useModuleOptions';
// import { useCabinetOptions, type ProcessedCabinetOption } from '../hooks/useCabinetOptions';
// import { useDollarRate } from '../hooks/useDollarRate';
// import { useModuleDetails } from '../hooks/useModuleDetails';
// import { useCabinetDetails } from '../hooks/useCabinetDetails';
// import { useComponentPrices, type PriceRequestArgs } from '../hooks/useComponentPrices';
// import { useCalculationPerformer } from '../hooks/useCalculationPerformer';
// import { useCalculatorSideEffects } from '../hooks/useCalculatorSideEffects';
// import { checkCalculationReadiness } from '../utils/calculatorValidation';

// import type { Maybe } from "../generated/graphql/graphql";

// type SelectOption = { label: string; value: string };

// interface CalculatorContextProps {
//     initialData: ProcessedInitialData;
//     isLoadingInitialData: boolean;
//     isErrorInitialData: boolean;
//     errorInitialData: Error | null;
//     screenTypeOptions: ProcessedScreenTypeOption[];
//     isLoadingScreenTypeOptions: boolean;
//     isErrorScreenTypeOptions: boolean;
//     errorScreenTypeOptions: Error | null;
//     pitchOptionsData: ProcessedPitchOption[];
//     isLoadingPitches: boolean;
//     isErrorPitches: boolean;
//     errorPitches: Error | null;
//     refreshRateOptionsData: ProcessedRefreshRateOption[];
//     isLoadingRefreshRates: boolean;
//     isErrorRefreshRates: boolean;
//     errorRefreshRates: Error | null;
//     brightnessOptionsData: ProcessedBrightnessOption[];
//     isLoadingBrightnesses: boolean;
//     isErrorBrightnesses: boolean;
//     errorBrightnesses: Error | null;
//     moduleOptionsData: ProcessedModuleOption[];
//     isLoadingModules: boolean;
//     isErrorModules: boolean;
//     errorModules: Error | null;
//     cabinetOptionsData: ProcessedCabinetOption[];
//     isLoadingCabinets: boolean;
//     isErrorCabinets: boolean;
//     errorCabinets: Error | null;
//     dollarRateValue: Maybe<number>;
//     isLoadingDollarRate: boolean;
//     isErrorDollarRate: boolean;
//     errorDollarRate: Error | null;
//     selectedModuleDetails: ModuleData | null;
//     isLoadingModuleDetails: boolean;
//     isFetchingModuleDetails: boolean;
//     isErrorModuleDetails: boolean;
//     errorModuleDetails: Error | null;
//     selectedCabinetDetails: CabinetData | null;
//     isLoadingCabinetDetails: boolean;
//     isFetchingCabinetDetails: boolean;
//     isErrorCabinetDetails: boolean;
//     errorCabinetDetails: Error | null;
//     priceMap: PriceMap;
//     isLoadingPrices: boolean;
//     isFetchingPrices: boolean;
//     isErrorPrices: boolean;
//     errorPrices: Error | null;
//     isCalculating: boolean;
//     isDrawerOpen: boolean;
//     calculationResult: TechnicalSpecsResult | null;
//     costDetails: CostCalculationResult | null;
//     selectedScreenTypeCode: string | null;
//     isFlexSelected: boolean;
//     selectedLocationCode: string | null;
//     selectedMaterialCode: string | null;
//     selectedProtectionCode: string | null;
//     selectedBrightnessCode: string | null;
//     selectedSensorCodes: string[];
//     selectedControlTypeCodes: string[];
//     selectedPitchCode: string | null;
//     selectedRefreshRateCode: string | null;
//     selectedModuleCode: string | null;
//     selectedCabinetCode: string | null;
//     localDollarRateInput: number | string;
//     widthMm: string | number;
//     heightMm: string | number;
//     setSelectedScreenTypeCode: (code: string | null) => void;
//     setIsFlexSelected: (selected: boolean) => void;
//     setSelectedLocationCode: (code: string | null) => void;
//     setSelectedMaterialCode: (code: string | null) => void;
//     setSelectedProtectionCode: (code: string | null) => void;
//     setSelectedBrightnessCode: (code: string | null) => void;
//     setSelectedSensorCodes: (codes: string[]) => void;
//     setSelectedControlTypeCodes: (codes: string[]) => void;
//     setSelectedPitchCode: (code: string | null) => void;
//     setSelectedRefreshRateCode: (code: string | null) => void;
//     setSelectedModuleCode: (code: string | null) => void;
//     setSelectedCabinetCode: (code: string | null) => void;
//     setLocalDollarRateInput: (rate: number | string) => void;
//     setWidthMm: (value: string | number) => void;
//     setHeightMm: (value: string | number) => void;
//     performCalculation: () => Promise<void>;
//     setIsDrawerOpen: (open: boolean) => void;
//     resetQuery: () => void;
//     isCalculationReady: boolean;
//     screenTypeSegments: SelectOption[];
//     isFlexOptionAvailableForSelectedScreenType: boolean;
//     locationSelectOptions: SelectOption[];
//     materialSelectOptions: SelectOption[];
//     protectionSelectOptions: SelectOption[];
//     brightnessSelectOptions: SelectOption[];
//     sensorSelectOptions: SelectOption[];
//     controlTypeSelectOptions: SelectOption[];
//     pitchSelectOptions: SelectOption[];
//     refreshRateSelectOptions: SelectOption[];
//     moduleSelectOptions: SelectOption[];
//     cabinetSelectOptions: SelectOption[];
// }

// const CalculatorContext = createContext<CalculatorContextProps | undefined>(undefined);

// export const useCalculatorContext = () => {
//     const context = useContext(CalculatorContext);
//     if (context === undefined) {
//         throw new Error("useCalculatorContext must be used within a CalculatorProvider");
//     }
//     return context;
// };

// export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
//     const queryClient = useQueryClient();

//     // --- Состояния формы ---
//     const [selectedScreenTypeCode, setSelectedScreenTypeCodeState] = useState<string | null>(null);
//     const [widthMm, setWidthMmState] = useState<string | number>("");
//     const [heightMm, setHeightMmState] = useState<string | number>("");
//     const [selectedLocationCode, setSelectedLocationCodeState] = useState<string | null>(null);
//     const [selectedMaterialCode, setSelectedMaterialCodeState] = useState<string | null>(null);
//     const [selectedProtectionCode, setSelectedProtectionCodeState] = useState<string | null>(null);
//     const [selectedBrightnessCode, setSelectedBrightnessCodeState] = useState<string | null>(null);
//     const [selectedRefreshRateCode, setSelectedRefreshRateCodeState] = useState<string | null>(null);
//     const [selectedSensorCodes, setSelectedSensorCodesState] = useState<string[]>([]);
//     const [selectedControlTypeCodes, setSelectedControlTypeCodesState] = useState<string[]>([]);
//     const [selectedPitchCode, setSelectedPitchCodeState] = useState<string | null>(null);
//     const [selectedModuleCode, setSelectedModuleCodeState] = useState<string | null>(null);
//     const [selectedCabinetCode, setSelectedCabinetCodeState] = useState<string | null>(null);
//     const [isFlexSelected, setIsFlexSelectedState] = useState<boolean>(false);
//     const [localDollarRateInput, setLocalDollarRateInputState] = useState<number | string>("");

//     const isCabinetScreenTypeSelected = selectedScreenTypeCode === "cabinet";

//     const [selectedModuleDetailsState, setSelectedModuleDetailsState] = useState<ModuleData | null>(null);
//     const [selectedCabinetDetailsState, setSelectedCabinetDetailsState] = useState<CabinetData | null>(null);
//     const [isCalculating, setIsCalculatingState] = useState<boolean>(false);
//     const [isDrawerOpen, setIsDrawerOpenState] = useState<boolean>(false);
//     const [calculationResult, setCalculationResultState] = useState<TechnicalSpecsResult | null>(null);
//     const [costDetails, setCostDetailsState] = useState<CostCalculationResult | null>(null);

//     // --- Вызовы хуков для получения данных ---
//     const initialDataResult = useInitialCalculatorData();
//     const screenTypeOptionsResult = useScreenTypeOptions(selectedScreenTypeCode);
//     const pitchOptionsResult = usePitchOptions(selectedLocationCode);
//     const refreshRateResult = useFilteredRefreshRates(selectedLocationCode, selectedPitchCode, isFlexSelected);
//     const brightnessResult = useFilteredBrightnesses(selectedLocationCode, selectedPitchCode, selectedRefreshRateCode, isFlexSelected);
//     const moduleOptionsFilters = useMemo(() => ({ locationCode: selectedLocationCode, pitchCode: selectedPitchCode, brightnessCode: selectedBrightnessCode, refreshRateCode: selectedRefreshRateCode }), [selectedLocationCode, selectedPitchCode, selectedBrightnessCode, selectedRefreshRateCode]);
//     const moduleOptionsResult = useModuleOptions(moduleOptionsFilters, isFlexSelected);
//     const cabinetOptionsFilters = useMemo(() => ({ locationCode: selectedLocationCode, materialCode: selectedMaterialCode, pitchCode: selectedPitchCode, moduleCode: selectedModuleCode }), [selectedLocationCode, selectedMaterialCode, selectedPitchCode, selectedModuleCode]);
//     const cabinetOptionsResult = useCabinetOptions(cabinetOptionsFilters, isCabinetScreenTypeSelected);
//     const dollarRateResult = useDollarRate();
//     const moduleDetailsResult = useModuleDetails(selectedModuleCode);
//     const cabinetDetailsResult = useCabinetDetails(selectedCabinetCode, isCabinetScreenTypeSelected);
//     const priceRequestArgs = useMemo((): PriceRequestArgs | null => {
//         const itemCodesSet = new Set<string>(["bp300", "receiver", "magnets", "steel_cab_price_m2"]);
//         const args: PriceRequestArgs = {};
//         if (selectedModuleCode) args.moduleCode = selectedModuleCode;
//         if (isCabinetScreenTypeSelected && selectedCabinetCode) args.cabinetCode = selectedCabinetCode;
//         if (itemCodesSet.size > 0) args.itemCodes = Array.from(itemCodesSet);
//         if (!args.moduleCode && !args.cabinetCode && (!args.itemCodes || args.itemCodes.length === 0)) return null;
//         return args;
//     }, [selectedModuleCode, selectedCabinetCode, isCabinetScreenTypeSelected]);
//     const priceResult = useComponentPrices(priceRequestArgs);

//     // --- Деструктуризация результатов из хуков для дальнейшего использования ---
//     const { screenTypes, locations, materials, ipProtections, sensors, controlTypes,
//         isLoading: isLoadingInitialData, isError: isErrorInitialData, error: errorInitialData } = initialDataResult;

//     const { options: availableOptions, isLoading: isLoadingScreenTypeOptions, isError: isErrorScreenTypeOptions, error: errorScreenTypeOptions } = screenTypeOptionsResult;

//     const { pitches: gqlFilteredPitches, isLoading: isLoadingPitches, isError: isErrorPitches, error: errorPitches } = pitchOptionsResult;

//     const { refreshRates: gqlFilteredRefreshRates, isLoading: isLoadingRefreshRates, isError: isErrorRefreshRates, error: errorRefreshRates } = refreshRateResult;

//     const { brightnesses: gqlFilteredBrightnesses, isLoading: isLoadingBrightnesses, isError: isErrorBrightnesses, error: errorBrightnesses } = brightnessResult;

//     const { modules: gqlFilteredModules, isLoading: isLoadingModules, isError: isErrorModules, error: errorModules } = moduleOptionsResult;

//     const { cabinets: gqlCabinets, isLoading: isLoadingCabinets, isError: isErrorCabinets, error: errorCabinets } = cabinetOptionsResult;

//     const { dollarRate: dollarRateValue, isLoading: isLoadingDollarRate, isError: isErrorDollarRate, error: errorDollarRate } = dollarRateResult;

//     const { moduleDetails: rawModuleDetails, isLoading: isLoadingModuleDetails, isFetching: isFetchingModuleDetails, isError: isErrorModuleDetails, error: errorModuleDetails } = moduleDetailsResult;

//     const { cabinetDetails: rawCabinetDetails, isLoading: isLoadingCabinetDetails, isFetching: isFetchingCabinetDetails, isError: isErrorCabinetDetails, error: errorCabinetDetails } = cabinetDetailsResult;

//     const { priceMap, isLoading: isLoadingPrices, isFetching: isFetchingPrices, isError: isErrorPrices, error: errorPrices } = priceResult;

//     // --- Подготовка данных для селекторов (useMemo) ---
//     const screenTypeSegments = useMemo((): SelectOption[] =>
//         initialDataResult.screenTypes.reduce((acc: SelectOption[], st) => {
//             if (st?.code) {
//                 acc.push({
//                     value: st.code,
//                     label: st.name ?? st.code,
//                 });
//             }
//             return acc;
//         }, [])
//         , [initialDataResult.screenTypes]);

//     const locationSelectOptions = useMemo((): SelectOption[] =>
//         initialDataResult.locations
//             .filter((loc): loc is { active?: boolean | null, code: string, name?: string | null } => !!loc?.active && !!loc.code)
//             .map(loc => ({ value: loc.code, label: loc.name ?? loc.code }))
//         , [initialDataResult.locations]);

//     const materialSelectOptions = useMemo((): SelectOption[] =>
//         initialDataResult.materials
//             .filter((mat): mat is { active?: boolean | null, code: string, name?: string | null } => !!mat?.active && !!mat.code)
//             .map(mat => ({ value: mat.code, label: mat.name ?? mat.code }))
//         , [initialDataResult.materials]);

//     const protectionSelectOptions = useMemo((): SelectOption[] =>
//         initialDataResult.ipProtections
//             .filter((ip): ip is { code: string } => !!ip?.code)
//             .sort((a, b) => a.code.localeCompare(b.code))
//             .map(ip => ({ value: ip.code, label: ip.code }))
//         , [initialDataResult.ipProtections]);

//     const pitchSelectOptions = useMemo((): SelectOption[] =>
//         [...pitchOptionsResult.pitches]
//             .filter((p): p is { code: string; pitchValue: number } => !!p?.code && typeof p.pitchValue === 'number')
//             .sort((a, b) => a.pitchValue - b.pitchValue)
//             .map(p => ({ value: p.code, label: `${p.pitchValue} мм` }))
//         , [pitchOptionsResult.pitches]);

//     const brightnessSelectOptions = useMemo((): SelectOption[] =>
//         brightnessResult.brightnesses
//             .filter((br): br is { code: string; value: number } => !!br?.code && typeof br.value === 'number')
//             .map(br => ({ value: br.code, label: `${br.value} nit` }))
//         , [brightnessResult.brightnesses]);

//     const refreshRateSelectOptions = useMemo((): SelectOption[] =>
//         refreshRateResult.refreshRates
//             .filter((rr): rr is { code: string; value: number } => !!rr?.code && typeof rr.value === 'number')
//             .map(rr => ({ value: rr.code, label: `${rr.value} Hz` }))
//         , [refreshRateResult.refreshRates]);

//     const sensorSelectOptions = useMemo((): SelectOption[] =>
//         initialDataResult.sensors
//             .filter((s): s is { active?: boolean | null; code: string; name: string } => !!s?.active && !!s.code && !!s.name)
//             .sort((a, b) => a.name.localeCompare(b.name))
//             .map(s => ({ value: s.code, label: s.name }))
//         , [initialDataResult.sensors]);

//     const controlTypeSelectOptions = useMemo((): SelectOption[] =>
//         initialDataResult.controlTypes
//             .filter((ct): ct is { active?: boolean | null; code: string; name: string } => !!ct?.active && !!ct.code && !!ct.name)
//             .sort((a, b) => a.name.localeCompare(b.name))
//             .map(ct => ({ value: ct.code, label: ct.name }))
//         , [initialDataResult.controlTypes]);

//     const moduleSelectOptions = useMemo((): SelectOption[] =>
//         moduleOptionsResult.modules
//             .filter((m): m is { code: string; name?: string | null, sku?: string | null } => !!m?.code)
//             .map(m => ({ value: m.code, label: m.name ?? m.sku ?? m.code }))
//         , [moduleOptionsResult.modules]);

//     const cabinetSelectOptions = useMemo((): SelectOption[] =>
//         cabinetOptionsResult.cabinets
//             .filter((c): c is { code: string; name?: string | null; sku?: string | null } => !!c?.code)
//             .map(c => ({ value: c.code, label: c.name ?? c.sku ?? c.code }))
//         , [cabinetOptionsResult.cabinets]);

//     const isFlexOptionAvailableForSelectedScreenType = useMemo((): boolean =>
//         screenTypeOptionsResult.options.some(opt => opt?.code === "flex")
//         , [screenTypeOptionsResult.options]);

//     // --- Вызов хука для побочных эффектов ---
//     useCalculatorSideEffects(
//         useMemo(() => ({
//             initialDataResult,
//             refreshRateResult,
//             brightnessResult,
//             dollarRateResult,
//             moduleDetailsResult,
//             cabinetDetailsResult,
//             selectedScreenTypeCode, selectedLocationCode, selectedProtectionCode, selectedRefreshRateCode,
//             selectedBrightnessCode, selectedModuleCode, selectedCabinetCode, localDollarRateInput,
//             isCabinetScreenTypeSelected, selectedModuleDetailsState, selectedCabinetDetailsState,
//             selectedPitchCode,
//         }), [
//             initialDataResult, refreshRateResult, brightnessResult, dollarRateResult, moduleDetailsResult, cabinetDetailsResult,
//             selectedScreenTypeCode, selectedLocationCode, selectedProtectionCode, selectedRefreshRateCode,
//             selectedBrightnessCode, selectedModuleCode, selectedCabinetCode, localDollarRateInput,
//             isCabinetScreenTypeSelected, selectedModuleDetailsState, selectedCabinetDetailsState,
//             selectedPitchCode,
//         ]),
//         useMemo(() => ({
//             setSelectedScreenTypeCode: setSelectedScreenTypeCodeState,
//             setSelectedProtectionCode: setSelectedProtectionCodeState,
//             setSelectedPitchCode: setSelectedPitchCodeState,
//             setSelectedRefreshRateCode: setSelectedRefreshRateCodeState,
//             setSelectedBrightnessCode: setSelectedBrightnessCodeState,
//             setSelectedModuleCode: setSelectedModuleCodeState,
//             setIsFlexSelected: setIsFlexSelectedState,
//             setLocalDollarRateInput: setLocalDollarRateInputState,
//             setSelectedModuleDetailsState,
//             setSelectedCabinetDetailsState
//         }), [])
//     );

//     // --- Логика isCalculationReady ---
//     const isCalculationReady = useMemo((): boolean => {
//         return checkCalculationReadiness({
//             selectedScreenTypeCode, widthMm, heightMm, selectedLocationCode, selectedMaterialCode,
//             selectedProtectionCode, selectedPitchCode, selectedBrightnessCode, selectedRefreshRateCode,
//             selectedModuleCode, selectedCabinetCode, localDollarRateInput, isCalculating,
//             isCabinetScreenTypeSelected, selectedModuleDetailsState,
//             isLoadingModuleDetails: moduleDetailsResult.isLoading, isErrorModuleDetails: moduleDetailsResult.isError,
//             selectedCabinetDetailsState,
//             isLoadingCabinetDetails: cabinetDetailsResult.isLoading, isErrorCabinetDetails: cabinetDetailsResult.isError,
//             isLoadingPrices: priceResult.isLoading, isErrorPrices: priceResult.isError, priceMap: priceResult.priceMap,
//         });
//     }, [
//         selectedScreenTypeCode, widthMm, heightMm, selectedLocationCode, selectedMaterialCode, selectedProtectionCode,
//         selectedPitchCode, selectedBrightnessCode, selectedRefreshRateCode, selectedModuleCode, selectedCabinetCode,
//         localDollarRateInput, isCalculating, isCabinetScreenTypeSelected, selectedModuleDetailsState, moduleDetailsResult,
//         selectedCabinetDetailsState, cabinetDetailsResult, priceResult,
//     ]);

//     // --- Сеттеры формы (useCallback) ---
//     const resetCalculationFields = useCallback(() => { setCalculationResultState(null); setCostDetailsState(null); }, []);
//     const setSelectedScreenTypeCode = useCallback((value: string | null) => { setSelectedScreenTypeCodeState(value); setSelectedLocationCodeState(null); setSelectedMaterialCodeState(null); setSelectedProtectionCodeState(null); setSelectedBrightnessCodeState(null); setSelectedRefreshRateCodeState(null); setSelectedSensorCodesState([]); setSelectedControlTypeCodesState([]); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); setIsFlexSelectedState(false); resetCalculationFields(); }, [resetCalculationFields]);
//     const setSelectedLocationCode = useCallback((value: string | null) => { setSelectedLocationCodeState(value); setSelectedMaterialCodeState(null); setSelectedBrightnessCodeState(null); setSelectedRefreshRateCodeState(null); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
//     const setSelectedMaterialCode = useCallback((value: string | null) => { setSelectedMaterialCodeState(value); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
//     const setSelectedProtectionCode = useCallback((value: string | null) => setSelectedProtectionCodeState(value), []);
//     const setSelectedBrightnessCode = useCallback((value: string | null) => { setSelectedBrightnessCodeState(value); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
//     const setSelectedRefreshRateCode = useCallback((value: string | null) => { setSelectedRefreshRateCodeState(value); setSelectedBrightnessCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
//     const setSelectedSensorCodes = useCallback((value: string[]) => setSelectedSensorCodesState(value), []);
//     const setSelectedControlTypeCodes = useCallback((value: string[]) => setSelectedControlTypeCodesState(value), []);
//     const setSelectedPitchCode = useCallback((value: string | null) => { setSelectedPitchCodeState(value); setSelectedRefreshRateCodeState(null); setSelectedBrightnessCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
//     const setSelectedModuleCode = useCallback((value: string | null) => { setSelectedModuleCodeState(value); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
//     const setSelectedCabinetCode = useCallback((value: string | null) => { setSelectedCabinetCodeState(value); resetCalculationFields(); }, [resetCalculationFields]);
//     const setIsFlexSelected = useCallback((selected: boolean) => { setIsFlexSelectedState(selected); resetCalculationFields(); }, [resetCalculationFields]);
//     const setLocalDollarRateInput = useCallback((value: number | string) => setLocalDollarRateInputState(value), []);
//     const setWidthMm = useCallback((value: string | number) => { setWidthMmState(value); resetCalculationFields(); }, [resetCalculationFields]);
//     const setHeightMm = useCallback((value: string | number) => { setHeightMmState(value); resetCalculationFields(); }, [resetCalculationFields]);

//     // --- performCalculation (используем кастомный хук) ---
//     const calculationParams = useMemo(() => ({
//         isCalculationReady, selectedModuleDetails: selectedModuleDetailsState, isCabinetScreenTypeSelected, selectedCabinetDetails: selectedCabinetDetailsState,
//         priceMap: priceResult.priceMap, gqlFilteredPitches: pitchOptionsResult.pitches, selectedPitchCode, locationSelectOptions, selectedLocationCode, materialSelectOptions, selectedMaterialCode, protectionSelectOptions, selectedProtectionCode, brightnessSelectOptions, selectedBrightnessCode, refreshRateSelectOptions, selectedRefreshRateCode,
//         widthMm, heightMm, selectedScreenTypeCode, localDollarRateInput,
//     }), [
//         isCalculationReady, selectedModuleDetailsState, isCabinetScreenTypeSelected, selectedCabinetDetailsState, priceResult.priceMap,
//         pitchOptionsResult.pitches, selectedPitchCode, locationSelectOptions, selectedLocationCode, materialSelectOptions, selectedMaterialCode,
//         protectionSelectOptions, selectedProtectionCode, brightnessSelectOptions, selectedBrightnessCode, refreshRateSelectOptions, selectedRefreshRateCode,
//         widthMm, heightMm, selectedScreenTypeCode, localDollarRateInput
//     ]);
//     const calculationSetters = useMemo(() => ({
//         setIsCalculatingState, setCalculationResultState, setCostDetailsState, setIsDrawerOpenState
//     }), []);
//     const performCalculation = useCalculationPerformer(calculationParams, calculationSetters);

//     // --- resetQuery ---
//     const resetQuery = useCallback(() => {
//         queryClient.invalidateQueries({ queryKey: ["calculatorInitialData"] });
//         queryClient.invalidateQueries({ queryKey: ["screenTypeOptions"] });
//         queryClient.invalidateQueries({ queryKey: ["pitchOptionsByLocation"] });
//         queryClient.invalidateQueries({ queryKey: ["filteredRefreshRateOptions"] });
//         queryClient.invalidateQueries({ queryKey: ["filteredBrightnessOptions"] });
//         queryClient.invalidateQueries({ queryKey: ["moduleOptions"] });
//         queryClient.invalidateQueries({ queryKey: ["cabinetOptions"] });
//         queryClient.invalidateQueries({ queryKey: ["dollarRate"] });
//         queryClient.invalidateQueries({ queryKey: ["moduleDetails"] });
//         queryClient.invalidateQueries({ queryKey: ["cabinetDetails"] });
//         queryClient.invalidateQueries({ queryKey: ["componentPrices"] });
//     }, [queryClient]);

//     // --- Формируем значение контекста ---
//     const contextValue: CalculatorContextProps = useMemo(
//         () => ({
//             initialData: initialDataResult,
//             isLoadingInitialData, isErrorInitialData, errorInitialData,
//             screenTypeOptions: screenTypeOptionsResult.options,
//             isLoadingScreenTypeOptions, isErrorScreenTypeOptions, errorScreenTypeOptions,
//             pitchOptionsData: pitchOptionsResult.pitches,
//             isLoadingPitches, isErrorPitches, errorPitches,
//             refreshRateOptionsData: refreshRateResult.refreshRates,
//             isLoadingRefreshRates, isErrorRefreshRates, errorRefreshRates,
//             brightnessOptionsData: brightnessResult.brightnesses,
//             isLoadingBrightnesses, isErrorBrightnesses, errorBrightnesses,
//             moduleOptionsData: moduleOptionsResult.modules,
//             isLoadingModules, isErrorModules, errorModules,
//             cabinetOptionsData: cabinetOptionsResult.cabinets,
//             isLoadingCabinets, isErrorCabinets, errorCabinets,
//             dollarRateValue, isLoadingDollarRate, isErrorDollarRate, errorDollarRate,
//             selectedModuleDetails: selectedModuleDetailsState,
//             selectedCabinetDetails: selectedCabinetDetailsState,
//             isLoadingModuleDetails, isFetchingModuleDetails, isErrorModuleDetails, errorModuleDetails,
//             isLoadingCabinetDetails, isFetchingCabinetDetails, isErrorCabinetDetails, errorCabinetDetails,
//             priceMap: priceResult.priceMap, isLoadingPrices: priceResult.isLoading, isFetchingPrices: priceResult.isFetching, isErrorPrices: priceResult.isError, errorPrices: priceResult.error,
//             isCalculating, isDrawerOpen, calculationResult, costDetails,
//             selectedScreenTypeCode, isFlexSelected, selectedLocationCode, selectedMaterialCode, selectedProtectionCode,
//             selectedBrightnessCode, selectedSensorCodes, selectedControlTypeCodes, selectedPitchCode, selectedRefreshRateCode,
//             selectedModuleCode, selectedCabinetCode, localDollarRateInput, widthMm, heightMm,
//             setSelectedScreenTypeCode, setIsFlexSelected, setSelectedLocationCode, setSelectedMaterialCode, setSelectedProtectionCode,
//             setSelectedBrightnessCode, setSelectedSensorCodes, setSelectedControlTypeCodes, setSelectedPitchCode, setSelectedRefreshRateCode,
//             setSelectedModuleCode, setSelectedCabinetCode, setLocalDollarRateInput, setWidthMm, setHeightMm,
//             performCalculation, setIsDrawerOpen: setIsDrawerOpenState, resetQuery, isCalculationReady,
//             screenTypeSegments, isFlexOptionAvailableForSelectedScreenType,
//             locationSelectOptions, materialSelectOptions, protectionSelectOptions,
//             brightnessSelectOptions, refreshRateSelectOptions, sensorSelectOptions, controlTypeSelectOptions,
//             pitchSelectOptions, moduleSelectOptions, cabinetSelectOptions,
//         }),
//         [
//             initialDataResult, isLoadingInitialData, isErrorInitialData, errorInitialData,
//             screenTypeOptionsResult, isLoadingScreenTypeOptions, isErrorScreenTypeOptions, errorScreenTypeOptions,
//             pitchOptionsResult, isLoadingPitches, isErrorPitches, errorPitches,
//             refreshRateResult, isLoadingRefreshRates, isErrorRefreshRates, errorRefreshRates,
//             brightnessResult, isLoadingBrightnesses, isErrorBrightnesses, errorBrightnesses,
//             moduleOptionsResult, isLoadingModules, isErrorModules, errorModules,
//             cabinetOptionsResult, isLoadingCabinets, isErrorCabinets, errorCabinets,
//             dollarRateValue, isLoadingDollarRate, isErrorDollarRate, errorDollarRate,
//             selectedModuleDetailsState, selectedCabinetDetailsState,
//             isLoadingModuleDetails, isFetchingModuleDetails, isErrorModuleDetails, errorModuleDetails,
//             isLoadingCabinetDetails, isFetchingCabinetDetails, isErrorCabinetDetails, errorCabinetDetails,
//             priceResult,
//             isCalculating, isDrawerOpen, calculationResult, costDetails,
//             selectedScreenTypeCode, isFlexSelected, selectedLocationCode, selectedMaterialCode, selectedProtectionCode,
//             selectedBrightnessCode, selectedSensorCodes, selectedControlTypeCodes, selectedPitchCode, selectedRefreshRateCode,
//             selectedModuleCode, selectedCabinetCode, localDollarRateInput, widthMm, heightMm,
//             setSelectedScreenTypeCode, setIsFlexSelected, setSelectedLocationCode, setSelectedMaterialCode, setSelectedProtectionCode,
//             setSelectedBrightnessCode, setSelectedSensorCodes, setSelectedControlTypeCodes, setSelectedPitchCode, setSelectedRefreshRateCode,
//             setSelectedModuleCode, setSelectedCabinetCode, setLocalDollarRateInput, setWidthMm, setHeightMm,
//             performCalculation, setIsDrawerOpenState, resetQuery, isCalculationReady,
//             screenTypeSegments, isFlexOptionAvailableForSelectedScreenType,
//             locationSelectOptions, materialSelectOptions, protectionSelectOptions,
//             brightnessSelectOptions, refreshRateSelectOptions, sensorSelectOptions, controlTypeSelectOptions,
//             pitchSelectOptions, moduleSelectOptions, cabinetSelectOptions,
//         ]
//     );

//     return (
//         <CalculatorContext.Provider value={contextValue}>
//             {children}
//         </CalculatorContext.Provider>
//     );
// };