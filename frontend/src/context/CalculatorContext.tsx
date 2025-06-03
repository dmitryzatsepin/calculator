// frontend/src/context/CalculatorContext.tsx
import {
    createContext,
    useState,
    useMemo,
    useCallback,
    useContext,
    ReactNode,
    useEffect,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

// --- Сервисы и основные типы ---
import type {
    TechnicalSpecsResult,
    CostCalculationResult,
    ModuleData,
    CabinetData,
    PriceMap,
} from "../types/calculationTypes";

// --- Кастомные хуки для данных ---
import { useInitialCalculatorData, type ProcessedInitialData } from '../hooks/useInitialCalculatorData';
import { useScreenTypeOptions, type ProcessedScreenTypeOption } from '../hooks/useScreenTypeOptions';
import { usePitchOptions, type ProcessedPitchOption } from '../hooks/usePitchOptions';
import { useFilteredRefreshRates, type ProcessedRefreshRateOption } from '../hooks/useFilteredRefreshRates';
import { useFilteredBrightnesses, type ProcessedBrightnessOption } from '../hooks/useFilteredBrightnesses';
import { useModuleOptions, type ProcessedModuleOption } from '../hooks/useModuleOptions';
import { useCabinetOptions, type ProcessedCabinetOption } from '../hooks/useCabinetOptions';
import { useDollarRate } from '../hooks/useDollarRate';
import { useModuleDetails } from '../hooks/useModuleDetails';
import { useCabinetDetails } from '../hooks/useCabinetDetails';
import { useComponentPrices, type PriceRequestArgs } from '../hooks/useComponentPrices';
import { useCalculationPerformer } from '../hooks/useCalculationPerformer'; // <-- Новый хук

// --- Утилиты (если нужны здесь, например, для isCalculationReady) ---
import { checkCalculationReadiness } from '../utils/calculatorValidation';


// --- GraphQL типы (только необходимые) ---
import type {
    Location as GqlLocation,
    Maybe,
} from "../generated/graphql/graphql";

// Тип для опций UI селектов
type SelectOption = { label: string; value: string };

// --- Интерфейс Контекста ---
interface CalculatorContextProps {
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
    selectedModuleDetails: ModuleData | null; // Это будет selectedModuleDetailsState из Provider
    isLoadingModuleDetails: boolean;
    isFetchingModuleDetails: boolean;
    isErrorModuleDetails: boolean;
    errorModuleDetails: Error | null;
    selectedCabinetDetails: CabinetData | null; // Это будет selectedCabinetDetailsState из Provider
    isLoadingCabinetDetails: boolean;
    isFetchingCabinetDetails: boolean;
    isErrorCabinetDetails: boolean;
    errorCabinetDetails: Error | null;
    priceMap: PriceMap;
    isLoadingPrices: boolean;
    isFetchingPrices: boolean;
    isErrorPrices: boolean;
    errorPrices: Error | null;
    isCalculating: boolean;
    isDrawerOpen: boolean;
    calculationResult: TechnicalSpecsResult | null;
    costDetails: CostCalculationResult | null;
    selectedScreenTypeCode: string | null;
    isFlexSelected: boolean;
    selectedLocationCode: string | null;
    selectedMaterialCode: string | null;
    selectedProtectionCode: string | null;
    selectedBrightnessCode: string | null;
    selectedSensorCodes: string[];
    selectedControlTypeCodes: string[];
    selectedPitchCode: string | null;
    selectedRefreshRateCode: string | null;
    selectedModuleCode: string | null;
    selectedCabinetCode: string | null;
    localDollarRateInput: number | string;
    widthMm: string | number;
    heightMm: string | number;
    setSelectedScreenTypeCode: (code: string | null) => void;
    setIsFlexSelected: (selected: boolean) => void;
    setSelectedLocationCode: (code: string | null) => void;
    setSelectedMaterialCode: (code: string | null) => void;
    setSelectedProtectionCode: (code: string | null) => void;
    setSelectedBrightnessCode: (code: string | null) => void;
    setSelectedSensorCodes: (codes: string[]) => void;
    setSelectedControlTypeCodes: (codes: string[]) => void;
    setSelectedPitchCode: (code: string | null) => void;
    setSelectedRefreshRateCode: (code: string | null) => void;
    setSelectedModuleCode: (code: string | null) => void;
    setSelectedCabinetCode: (code: string | null) => void;
    setLocalDollarRateInput: (rate: number | string) => void;
    setWidthMm: (value: string | number) => void;
    setHeightMm: (value: string | number) => void;
    performCalculation: () => Promise<void>; // Изменился тип, так как useCalculationPerformer возвращает () => Promise<void>
    setIsDrawerOpen: (open: boolean) => void;
    resetQuery: () => void;
    isCalculationReady: boolean;
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

const CalculatorContext = createContext<CalculatorContextProps | undefined>(undefined);

export const useCalculatorContext = () => {
    const context = useContext(CalculatorContext);
    if (context === undefined) {
        throw new Error("useCalculatorContext must be used within a CalculatorProvider");
    }
    return context;
};

export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();

    // --- Состояния формы ---
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

    const cabinetScreenTypeCode = "cabinet";
    const isCabinetScreenTypeSelected = selectedScreenTypeCode === cabinetScreenTypeCode;

    // --- Использование кастомных хуков для получения данных ---
    const { screenTypes, locations, materials, ipProtections, sensors, controlTypes,
        isLoading: isLoadingInitialData, isError: isErrorInitialData, error: errorInitialData } = useInitialCalculatorData();
    const { options: availableOptions, isLoading: isLoadingScreenTypeOptions, isError: isErrorScreenTypeOptions, error: errorScreenTypeOptions } = useScreenTypeOptions(selectedScreenTypeCode);
    const { pitches: gqlFilteredPitches, isLoading: isLoadingPitches, isError: isErrorPitches, error: errorPitches } = usePitchOptions(selectedLocationCode);
    const { refreshRates: gqlFilteredRefreshRates, isLoading: isLoadingRefreshRates, isError: isErrorRefreshRates, error: errorRefreshRates } = useFilteredRefreshRates(selectedLocationCode, selectedPitchCode, isFlexSelected);
    const { brightnesses: gqlFilteredBrightnesses, isLoading: isLoadingBrightnesses, isError: isErrorBrightnesses, error: errorBrightnesses } = useFilteredBrightnesses(selectedLocationCode, selectedPitchCode, selectedRefreshRateCode, isFlexSelected);

    const moduleOptionsFilters = useMemo(() => ({ locationCode: selectedLocationCode, pitchCode: selectedPitchCode, brightnessCode: selectedBrightnessCode, refreshRateCode: selectedRefreshRateCode }), [selectedLocationCode, selectedPitchCode, selectedBrightnessCode, selectedRefreshRateCode]);
    const { modules: gqlFilteredModules, isLoading: isLoadingModules, isError: isErrorModules, error: errorModules } = useModuleOptions(moduleOptionsFilters, isFlexSelected);

    const cabinetOptionsFilters = useMemo(() => ({ locationCode: selectedLocationCode, materialCode: selectedMaterialCode, pitchCode: selectedPitchCode, moduleCode: selectedModuleCode }), [selectedLocationCode, selectedMaterialCode, selectedPitchCode, selectedModuleCode]);
    const { cabinets: gqlCabinets, isLoading: isLoadingCabinets, isError: isErrorCabinets, error: errorCabinets } = useCabinetOptions(cabinetOptionsFilters, isCabinetScreenTypeSelected);

    const { dollarRate: dollarRateValue, isLoading: isLoadingDollarRate, isError: isErrorDollarRate, error: errorDollarRate } = useDollarRate();
    const { moduleDetails: rawModuleDetails, isLoading: isLoadingModuleDetails, isFetching: isFetchingModuleDetails, isError: isErrorModuleDetails, error: errorModuleDetails } = useModuleDetails(selectedModuleCode);
    const { cabinetDetails: rawCabinetDetails, isLoading: isLoadingCabinetDetails, isFetching: isFetchingCabinetDetails, isError: isErrorCabinetDetails, error: errorCabinetDetails } = useCabinetDetails(selectedCabinetCode, isCabinetScreenTypeSelected);

    const ITEM_CODE_PSU = "bp300"; const ITEM_CODE_RCV_CARD = "receiver"; const ITEM_CODE_MAGNET = "magnets"; const ITEM_CODE_STEEL_M2 = "steel_cab_price_m2";
    const priceRequestArgs = useMemo((): PriceRequestArgs | null => {
        const itemCodesSet = new Set<string>([ITEM_CODE_PSU, ITEM_CODE_RCV_CARD, ITEM_CODE_MAGNET, ITEM_CODE_STEEL_M2]);
        const args: PriceRequestArgs = {};
        if (selectedModuleCode) args.moduleCode = selectedModuleCode;
        if (isCabinetScreenTypeSelected && selectedCabinetCode) args.cabinetCode = selectedCabinetCode;
        if (itemCodesSet.size > 0) args.itemCodes = Array.from(itemCodesSet);
        if (!args.moduleCode && !args.cabinetCode && (!args.itemCodes || args.itemCodes.length === 0)) return null;
        return args;
    }, [selectedModuleCode, selectedCabinetCode, isCabinetScreenTypeSelected]);
    const { priceMap, isLoading: isLoadingPrices, isFetching: isFetchingPrices, isError: isErrorPrices, error: errorPrices } = useComponentPrices(priceRequestArgs);

    // --- Состояния для результатов расчета и UI (остаются здесь) ---
    const [selectedModuleDetailsState, setSelectedModuleDetailsState] = useState<ModuleData | null>(null);
    const [selectedCabinetDetailsState, setSelectedCabinetDetailsState] = useState<CabinetData | null>(null);
    const [isCalculating, setIsCalculatingState] = useState<boolean>(false);
    const [isDrawerOpen, setIsDrawerOpenState] = useState<boolean>(false);
    const [calculationResult, setCalculationResultState] = useState<TechnicalSpecsResult | null>(null);
    const [costDetails, setCostDetailsState] = useState<CostCalculationResult | null>(null);

    // --- Эффекты ---
    useEffect(() => {
        if (rawModuleDetails) {
            const sizeData = rawModuleDetails.sizes?.[0];
            const mappedModuleForState: ModuleData = {
                code: rawModuleDetails.code, sku: rawModuleDetails.sku, name: rawModuleDetails.name,
                width: sizeData?.width ?? 0, height: sizeData?.height ?? 0,
                powerConsumptionAvg: rawModuleDetails.powerConsumptionAvg, powerConsumptionMax: rawModuleDetails.powerConsumptionMax,
                components: rawModuleDetails.items?.map(comp => ({ quantity: comp?.quantity ?? 0, itemCode: comp?.item?.code ?? "unknown", itemName: comp?.item?.name ?? "Unknown Item", itemSku: comp?.item?.sku })).filter(c => c.itemCode !== "unknown") ?? [],
            };
            if (JSON.stringify(mappedModuleForState) !== JSON.stringify(selectedModuleDetailsState)) setSelectedModuleDetailsState(mappedModuleForState);
        } else if (selectedModuleDetailsState !== null) setSelectedModuleDetailsState(null);
    }, [rawModuleDetails, selectedModuleDetailsState]);

    useEffect(() => {
        if (rawCabinetDetails) {
            const sizeData = rawCabinetDetails.sizes?.[0]?.size;
            const mappedCabinetForState: CabinetData = {
                code: rawCabinetDetails.code, sku: rawCabinetDetails.sku, name: rawCabinetDetails.name,
                width: sizeData?.width ?? 0, height: sizeData?.height ?? 0,
            };
            if (JSON.stringify(mappedCabinetForState) !== JSON.stringify(selectedCabinetDetailsState)) setSelectedCabinetDetailsState(mappedCabinetForState);
        } else if (selectedCabinetDetailsState !== null) setSelectedCabinetDetailsState(null);
    }, [rawCabinetDetails, selectedCabinetDetailsState]);

    useEffect(() => {
        if (!isLoadingInitialData && screenTypes.length > 0 && selectedScreenTypeCode === null) {
            const defaultCode = "cabinet";
            const defaultScreenType = screenTypes.find(st => st?.code?.toLowerCase() === defaultCode.toLowerCase());
            setSelectedScreenTypeCodeState(defaultScreenType?.code ?? screenTypes.find(st => !!st?.code)?.code ?? null);
        }
    }, [isLoadingInitialData, screenTypes, selectedScreenTypeCode]);

    useEffect(() => {
        if (isLoadingInitialData || !selectedLocationCode) {
            if (!selectedLocationCode && selectedProtectionCode !== null) setSelectedProtectionCodeState(null); return;
        }
        let newProtectionCode: string | null = null;
        const selectedLocationItem = locations.find((loc): loc is GqlLocation => loc?.code === selectedLocationCode);
        if (selectedLocationItem) {
            const codeLower = selectedLocationItem.code?.toLowerCase() ?? ""; const nameLower = selectedLocationItem.name?.toLowerCase() ?? "";
            if (codeLower.includes("indoor") || nameLower.includes("indoor") || codeLower.includes("внутр") || nameLower.includes("внутр"))
                newProtectionCode = ipProtections.find(ip => ip?.code === "IP30")?.code ?? null;
            else if (codeLower.includes("outdoor") || nameLower.includes("outdoor") || codeLower.includes("уличн"))
                newProtectionCode = ipProtections.find(ip => ip?.code === "IP65")?.code ?? null;
        }
        if (selectedProtectionCode !== newProtectionCode) setSelectedProtectionCodeState(newProtectionCode);
    }, [selectedLocationCode, ipProtections, locations, isLoadingInitialData, selectedProtectionCode]);

    useEffect(() => { if (selectedScreenTypeCode) setIsFlexSelectedState(false); }, [selectedScreenTypeCode]);
    useEffect(() => { setSelectedPitchCodeState(null); }, [selectedLocationCode]);

    useEffect(() => {
        if (!isLoadingRefreshRates && gqlFilteredRefreshRates.length > 0 && selectedRefreshRateCode === null) {
            const defaultRefreshRate = [...gqlFilteredRefreshRates].sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];
            setSelectedRefreshRateCodeState(defaultRefreshRate?.code ?? null);
        } else if (!isLoadingRefreshRates && gqlFilteredRefreshRates.length === 0 && selectedRefreshRateCode !== null) {
            setSelectedRefreshRateCodeState(null);
        }
    }, [gqlFilteredRefreshRates, selectedRefreshRateCode, isLoadingRefreshRates]);

    useEffect(() => {
        if (!isLoadingBrightnesses && gqlFilteredBrightnesses.length > 0) {
            const currentSelectionValid = gqlFilteredBrightnesses.some(br => br?.code === selectedBrightnessCode);
            if (!currentSelectionValid || selectedBrightnessCode === null) {
                const defaultBrightness = [...gqlFilteredBrightnesses].sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];
                if (defaultBrightness?.code && defaultBrightness.code !== selectedBrightnessCode) setSelectedBrightnessCodeState(defaultBrightness.code);
                else if (!defaultBrightness && selectedBrightnessCode !== null) setSelectedBrightnessCodeState(null);
            }
        } else if (!isLoadingBrightnesses && gqlFilteredBrightnesses.length === 0 && selectedBrightnessCode !== null) {
            setSelectedBrightnessCodeState(null);
        }
    }, [gqlFilteredBrightnesses, isLoadingBrightnesses, selectedBrightnessCode]);

    useEffect(() => {
        const currentModuleDepsEnabled = !!(selectedLocationCode && selectedPitchCode && selectedBrightnessCode && selectedRefreshRateCode);
        if (selectedModuleCode !== null && !currentModuleDepsEnabled) setSelectedModuleCodeState(null);
    }, [selectedLocationCode, selectedPitchCode, selectedBrightnessCode, selectedRefreshRateCode, selectedModuleCode]);

    useEffect(() => {
        if (dollarRateValue !== undefined && dollarRateValue !== null && localDollarRateInput === "") {
            setLocalDollarRateInputState(dollarRateValue);
        }
    }, [dollarRateValue, localDollarRateInput]);

    useEffect(() => {
        if (selectedModuleDetailsState && selectedModuleDetailsState.code !== selectedModuleCode) {
            setSelectedModuleDetailsState(null);
            if (selectedModuleDetailsState.code) queryClient.cancelQueries({ queryKey: ["moduleDetails", selectedModuleDetailsState.code] });
        } else if (!selectedModuleCode && selectedModuleDetailsState) {
            const prevCode = selectedModuleDetailsState.code;
            setSelectedModuleDetailsState(null);
            if (prevCode) queryClient.cancelQueries({ queryKey: ["moduleDetails", prevCode] });
        }
    }, [selectedModuleCode, selectedModuleDetailsState, queryClient]);

    useEffect(() => {
        let shouldReset = false; let previousCode: string | undefined;
        if (selectedCabinetDetailsState) {
            previousCode = selectedCabinetDetailsState.code;
            if (selectedCabinetDetailsState.code !== selectedCabinetCode || !isCabinetScreenTypeSelected || !selectedCabinetCode) shouldReset = true;
        }
        if (shouldReset) {
            setSelectedCabinetDetailsState(null);
            if (previousCode) queryClient.cancelQueries({ queryKey: ["cabinetDetails", previousCode] });
        }
    }, [selectedCabinetCode, isCabinetScreenTypeSelected, selectedCabinetDetailsState, queryClient]);

    // --- Подготовка данных для селекторов (useMemo) ---
    const screenTypeSegments = useMemo((): SelectOption[] => screenTypes.filter(st => !!st?.code).map(st => ({ value: st.code!, label: st.name ?? st.code! })), [screenTypes]);
    const locationSelectOptions = useMemo((): SelectOption[] => locations.filter(loc => loc?.active && !!loc.code).map(loc => ({ value: loc.code!, label: loc.name ?? loc.code! })), [locations]);
    const materialSelectOptions = useMemo((): SelectOption[] => materials.filter(mat => mat?.active && !!mat.code).map(mat => ({ value: mat.code!, label: mat.name ?? mat.code! })), [materials]);
    const protectionSelectOptions = useMemo((): SelectOption[] => ipProtections.filter(ip => !!ip?.code).sort((a, b) => (a.code!).localeCompare(b.code!)).map(ip => ({ value: ip.code!, label: ip.code! })), [ipProtections]);
    const pitchSelectOptions = useMemo((): SelectOption[] => [...gqlFilteredPitches].filter(p => !!p?.code && typeof p.pitchValue === 'number').sort((a, b) => (a.pitchValue!) - (b.pitchValue!)).map(p => ({ value: p.code!, label: `${p.pitchValue} мм` })), [gqlFilteredPitches]);
    const brightnessSelectOptions = useMemo((): SelectOption[] => gqlFilteredBrightnesses.filter(br => !!br?.code && typeof br.value === 'number').map(br => ({ value: br.code!, label: `${br.value} nit` })), [gqlFilteredBrightnesses]);
    const refreshRateSelectOptions = useMemo((): SelectOption[] => gqlFilteredRefreshRates.filter(rr => !!rr?.code && typeof rr.value === 'number').map(rr => ({ value: rr.code!, label: `${rr.value} Hz` })), [gqlFilteredRefreshRates]);
    const sensorSelectOptions = useMemo((): SelectOption[] => sensors.filter(s => s?.active && !!s.code && !!s.name).sort((a, b) => (a.name!).localeCompare(b.name!)).map(s => ({ value: s.code!, label: s.name! })), [sensors]);
    const controlTypeSelectOptions = useMemo((): SelectOption[] => controlTypes.filter(ct => ct?.active && !!ct.code && !!ct.name).sort((a, b) => (a.name!).localeCompare(b.name!)).map(ct => ({ value: ct.code!, label: ct.name! })), [controlTypes]);
    const moduleSelectOptions = useMemo((): SelectOption[] => gqlFilteredModules.filter(m => !!m?.code).map(m => ({ value: m.code!, label: m.name ?? m.sku ?? m.code! })), [gqlFilteredModules]);
    const cabinetSelectOptions = useMemo((): SelectOption[] => gqlCabinets.filter(c => !!c?.code).map(c => ({ value: c.code!, label: c.name ?? c.sku ?? c.code! })), [gqlCabinets]);
    const isFlexOptionAvailableForSelectedScreenType = useMemo((): boolean => availableOptions.some(opt => opt?.code === "flex"), [availableOptions]);

    // --- Логика isCalculationReady (используем вынесенную функцию) ---
    const isCalculationReady = useMemo((): boolean => {
        return checkCalculationReadiness({
            selectedScreenTypeCode, widthMm, heightMm, selectedLocationCode, selectedMaterialCode,
            selectedProtectionCode, selectedPitchCode, selectedBrightnessCode, selectedRefreshRateCode,
            selectedModuleCode, selectedCabinetCode, localDollarRateInput, isCalculating,
            isCabinetScreenTypeSelected, selectedModuleDetailsState, isLoadingModuleDetails, isErrorModuleDetails,
            selectedCabinetDetailsState, isLoadingCabinetDetails, isErrorCabinetDetails,
            isLoadingPrices, isErrorPrices, priceMap
        });
    }, [
        selectedScreenTypeCode, widthMm, heightMm, selectedLocationCode, selectedMaterialCode, selectedProtectionCode,
        selectedPitchCode, selectedBrightnessCode, selectedRefreshRateCode, selectedModuleCode, selectedCabinetCode,
        localDollarRateInput, isCalculating, isCabinetScreenTypeSelected, selectedModuleDetailsState, isLoadingModuleDetails, isErrorModuleDetails,
        selectedCabinetDetailsState, isLoadingCabinetDetails, isErrorCabinetDetails, isLoadingPrices, isErrorPrices, priceMap
    ]);

    // --- Сеттеры формы (оборачиваем в useCallback) ---
    // Сеттеры в основном просто вызывают setState и сбрасывают другие состояния + результаты расчета
    // Логика сброса результатов инкапсулирована в resetCalculationFields
    const resetCalculationFields = useCallback(() => {
        setCalculationResultState(null);
        setCostDetailsState(null);
    }, []);

    const setSelectedScreenTypeCode = useCallback((value: string | null) => { setSelectedScreenTypeCodeState(value); setSelectedLocationCodeState(null); setSelectedMaterialCodeState(null); setSelectedProtectionCodeState(null); setSelectedBrightnessCodeState(null); setSelectedRefreshRateCodeState(null); setSelectedSensorCodesState([]); setSelectedControlTypeCodesState([]); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); setIsFlexSelectedState(false); resetCalculationFields(); }, [resetCalculationFields]);
    const setSelectedLocationCode = useCallback((value: string | null) => { setSelectedLocationCodeState(value); setSelectedMaterialCodeState(null); setSelectedBrightnessCodeState(null); setSelectedRefreshRateCodeState(null); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
    const setSelectedMaterialCode = useCallback((value: string | null) => { setSelectedMaterialCodeState(value); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
    const setSelectedProtectionCode = useCallback((value: string | null) => setSelectedProtectionCodeState(value), []);
    const setSelectedBrightnessCode = useCallback((value: string | null) => { setSelectedBrightnessCodeState(value); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
    const setSelectedRefreshRateCode = useCallback((value: string | null) => { setSelectedRefreshRateCodeState(value); setSelectedBrightnessCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
    const setSelectedSensorCodes = useCallback((value: string[]) => setSelectedSensorCodesState(value), []);
    const setSelectedControlTypeCodes = useCallback((value: string[]) => setSelectedControlTypeCodesState(value), []);
    const setSelectedPitchCode = useCallback((value: string | null) => { setSelectedPitchCodeState(value); setSelectedRefreshRateCodeState(null); setSelectedBrightnessCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
    const setSelectedModuleCode = useCallback((value: string | null) => { setSelectedModuleCodeState(value); setSelectedCabinetCodeState(null); resetCalculationFields(); }, [resetCalculationFields]);
    const setSelectedCabinetCode = useCallback((value: string | null) => { setSelectedCabinetCodeState(value); resetCalculationFields(); }, [resetCalculationFields]);
    const setIsFlexSelected = useCallback((selected: boolean) => { setIsFlexSelectedState(selected); resetCalculationFields(); }, [resetCalculationFields]);
    const setLocalDollarRateInput = useCallback((value: number | string) => setLocalDollarRateInputState(value), []);
    const setWidthMm = useCallback((value: string | number) => { setWidthMmState(value); resetCalculationFields(); }, [resetCalculationFields]);
    const setHeightMm = useCallback((value: string | number) => { setHeightMmState(value); resetCalculationFields(); }, [resetCalculationFields]);

    // --- performCalculation (используем кастомный хук) ---
    const calculationParams = useMemo(() => ({
        isCalculationReady, selectedModuleDetails: selectedModuleDetailsState, isCabinetScreenTypeSelected, selectedCabinetDetails: selectedCabinetDetailsState,
        priceMap, gqlFilteredPitches, selectedPitchCode, locationSelectOptions, selectedLocationCode, materialSelectOptions, selectedMaterialCode, protectionSelectOptions, selectedProtectionCode, brightnessSelectOptions, selectedBrightnessCode, refreshRateSelectOptions, selectedRefreshRateCode,
        widthMm, heightMm, selectedScreenTypeCode, localDollarRateInput,
    }), [
        isCalculationReady, selectedModuleDetailsState, isCabinetScreenTypeSelected, selectedCabinetDetailsState, priceMap,
        gqlFilteredPitches, selectedPitchCode, locationSelectOptions, selectedLocationCode, materialSelectOptions, selectedMaterialCode,
        selectedProtectionCode, brightnessSelectOptions, selectedBrightnessCode, refreshRateSelectOptions, selectedRefreshRateCode,
        widthMm, heightMm, selectedScreenTypeCode, localDollarRateInput
    ]);
    const calculationSetters = useMemo(() => ({
        setIsCalculatingState, setCalculationResultState, setCostDetailsState, setIsDrawerOpenState
    }), [setIsCalculatingState, setCalculationResultState, setCostDetailsState, setIsDrawerOpenState]); // Сеттеры обычно стабильны
    const performCalculation = useCalculationPerformer(calculationParams, calculationSetters);

    // --- resetQuery (остается) ---
    const resetQuery = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["calculatorInitialData"] });
        queryClient.invalidateQueries({ queryKey: ["screenTypeOptions"] });
        queryClient.invalidateQueries({ queryKey: ["pitchOptionsByLocation"] });
        queryClient.invalidateQueries({ queryKey: ["filteredRefreshRateOptions"] });
        queryClient.invalidateQueries({ queryKey: ["filteredBrightnessOptions"] });
        queryClient.invalidateQueries({ queryKey: ["moduleOptions"] });
        queryClient.invalidateQueries({ queryKey: ["cabinetOptions"] });
        queryClient.invalidateQueries({ queryKey: ["dollarRate"] });
        queryClient.invalidateQueries({ queryKey: ["moduleDetails"] });
        queryClient.invalidateQueries({ queryKey: ["cabinetDetails"] });
        queryClient.invalidateQueries({ queryKey: ["componentPrices"] });
    }, [queryClient]);

    // --- Формируем значение контекста ---
    const contextValue: CalculatorContextProps = useMemo(
        () => ({
            initialData: { screenTypes, locations, materials, ipProtections, sensors, controlTypes },
            isLoadingInitialData, isErrorInitialData, errorInitialData,
            screenTypeOptions: availableOptions, isLoadingScreenTypeOptions, isErrorScreenTypeOptions, errorScreenTypeOptions,
            pitchOptionsData: gqlFilteredPitches, isLoadingPitches, isErrorPitches, errorPitches,
            refreshRateOptionsData: gqlFilteredRefreshRates, isLoadingRefreshRates, isErrorRefreshRates, errorRefreshRates,
            brightnessOptionsData: gqlFilteredBrightnesses, isLoadingBrightnesses, isErrorBrightnesses, errorBrightnesses,
            moduleOptionsData: gqlFilteredModules, isLoadingModules, isErrorModules, errorModules,
            cabinetOptionsData: gqlCabinets, isLoadingCabinets, isErrorCabinets, errorCabinets,
            dollarRateValue, isLoadingDollarRate, isErrorDollarRate, errorDollarRate,
            selectedModuleDetails: selectedModuleDetailsState,
            selectedCabinetDetails: selectedCabinetDetailsState,
            isLoadingModuleDetails, isFetchingModuleDetails, isErrorModuleDetails, errorModuleDetails,
            isLoadingCabinetDetails, isFetchingCabinetDetails, isErrorCabinetDetails, errorCabinetDetails,
            priceMap, isLoadingPrices, isFetchingPrices, isErrorPrices, errorPrices,
            isCalculating, isDrawerOpen, calculationResult, costDetails,
            selectedScreenTypeCode, isFlexSelected, selectedLocationCode, selectedMaterialCode, selectedProtectionCode,
            selectedBrightnessCode, selectedSensorCodes, selectedControlTypeCodes, selectedPitchCode, selectedRefreshRateCode,
            selectedModuleCode, selectedCabinetCode, localDollarRateInput, widthMm, heightMm,
            setSelectedScreenTypeCode, setIsFlexSelected, setSelectedLocationCode, setSelectedMaterialCode, setSelectedProtectionCode,
            setSelectedBrightnessCode, setSelectedSensorCodes, setSelectedControlTypeCodes, setSelectedPitchCode, setSelectedRefreshRateCode,
            setSelectedModuleCode, setSelectedCabinetCode, setLocalDollarRateInput, setWidthMm, setHeightMm,
            performCalculation, setIsDrawerOpen: setIsDrawerOpenState, resetQuery, isCalculationReady,
            screenTypeSegments, isFlexOptionAvailableForSelectedScreenType,
            locationSelectOptions, materialSelectOptions, protectionSelectOptions,
            brightnessSelectOptions, refreshRateSelectOptions, sensorSelectOptions, controlTypeSelectOptions,
            pitchSelectOptions, moduleSelectOptions, cabinetSelectOptions,
        }),
        [ // ВСЕ зависимости должны быть здесь
            screenTypes, locations, materials, ipProtections, sensors, controlTypes, isLoadingInitialData, isErrorInitialData, errorInitialData,
            availableOptions, isLoadingScreenTypeOptions, isErrorScreenTypeOptions, errorScreenTypeOptions,
            gqlFilteredPitches, isLoadingPitches, isErrorPitches, errorPitches,
            gqlFilteredRefreshRates, isLoadingRefreshRates, isErrorRefreshRates, errorRefreshRates,
            gqlFilteredBrightnesses, isLoadingBrightnesses, isErrorBrightnesses, errorBrightnesses,
            gqlFilteredModules, isLoadingModules, isErrorModules, errorModules,
            gqlCabinets, isLoadingCabinets, isErrorCabinets, errorCabinets,
            dollarRateValue, isLoadingDollarRate, isErrorDollarRate, errorDollarRate,
            selectedModuleDetailsState, selectedCabinetDetailsState,
            isLoadingModuleDetails, isFetchingModuleDetails, isErrorModuleDetails, errorModuleDetails,
            isLoadingCabinetDetails, isFetchingCabinetDetails, isErrorCabinetDetails, errorCabinetDetails,
            priceMap, isLoadingPrices, isFetchingPrices, isErrorPrices, errorPrices,
            isCalculating, isDrawerOpen, calculationResult, costDetails,
            selectedScreenTypeCode, isFlexSelected, selectedLocationCode, selectedMaterialCode, selectedProtectionCode,
            selectedBrightnessCode, selectedSensorCodes, selectedControlTypeCodes, selectedPitchCode, selectedRefreshRateCode,
            selectedModuleCode, selectedCabinetCode, localDollarRateInput, widthMm, heightMm,
            setSelectedScreenTypeCode, setIsFlexSelected, setSelectedLocationCode, setSelectedMaterialCode, setSelectedProtectionCode,
            setSelectedBrightnessCode, setSelectedSensorCodes, setSelectedControlTypeCodes, setSelectedPitchCode, setSelectedRefreshRateCode,
            setSelectedModuleCode, setSelectedCabinetCode, setLocalDollarRateInput, setWidthMm, setHeightMm,
            performCalculation, setIsDrawerOpenState, resetQuery, isCalculationReady,
            screenTypeSegments, isFlexOptionAvailableForSelectedScreenType,
            locationSelectOptions, materialSelectOptions, protectionSelectOptions,
            brightnessSelectOptions, refreshRateSelectOptions, sensorSelectOptions, controlTypeSelectOptions,
            pitchSelectOptions, moduleSelectOptions, cabinetSelectOptions,
        ]
    );

    return (
        <CalculatorContext.Provider value={contextValue}>
            {children}
        </CalculatorContext.Provider>
    );
};