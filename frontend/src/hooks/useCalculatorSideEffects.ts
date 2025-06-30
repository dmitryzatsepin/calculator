// frontend/src/hooks/useCalculatorSideEffects.ts
import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { InitialDataHookResult } from './useInitialCalculatorData';
import type { FilteredRefreshRatesHookResult } from './useFilteredRefreshRates';
import type { FilteredBrightnessesHookResult } from './useFilteredBrightnesses';
import type { ModuleDetailsHookResult } from './useModuleDetails';
import type { CabinetDetailsHookResult } from './useCabinetDetails';
import type { DollarRateHookResult } from './useDollarRate';
import type { ModuleData, CabinetData } from '../types/calculationTypes';
import type { Location as GqlLocation } from '../generated/graphql/graphql';

interface SideEffectsParams {
    initialDataResult: InitialDataHookResult;
    refreshRateResult: FilteredRefreshRatesHookResult;
    brightnessResult: FilteredBrightnessesHookResult;
    dollarRateResult: DollarRateHookResult;
    moduleDetailsResult: ModuleDetailsHookResult;
    cabinetDetailsResult: CabinetDetailsHookResult;
    selectedScreenTypeCode: string | null;
    selectedLocationCode: string | null;
    selectedProtectionCode: string | null;
    selectedRefreshRateCode: string | null;
    selectedBrightnessCode: string | null;
    selectedModuleCode: string | null;
    selectedCabinetCode: string | null;
    localDollarRateInput: number | string;
    isCabinetScreenTypeSelected: boolean;
    selectedModuleDetailsState: ModuleData | null;
    selectedCabinetDetailsState: CabinetData | null;
    selectedPitchCode: string | null;
}

interface SideEffectsSetters {
    setSelectedScreenTypeCode: (code: string | null) => void;
    setSelectedProtectionCode: (code: string | null) => void;
    setSelectedPitchCode: (code: string | null) => void;
    setSelectedRefreshRateCode: (code: string | null) => void;
    setSelectedBrightnessCode: (code: string | null) => void;
    setSelectedModuleCode: (code: string | null) => void;
    setIsFlexSelected: (isFlex: boolean) => void;
    setLocalDollarRateInput: (rate: number | string) => void;
    setSelectedModuleDetailsState: (details: ModuleData | null) => void;
    setSelectedCabinetDetailsState: (details: CabinetData | null) => void;
}

const DEFAULT_SCREEN_TYPE = "cabinet";

export function useCalculatorSideEffects(
    params: SideEffectsParams,
    setters: SideEffectsSetters
) {
    const queryClient = useQueryClient();
    const {
        setSelectedScreenTypeCode,
        setSelectedProtectionCode,
        setSelectedPitchCode,
        setSelectedRefreshRateCode,
        setSelectedBrightnessCode,
        setSelectedModuleCode,
        setIsFlexSelected,
        setLocalDollarRateInput,
        setSelectedModuleDetailsState,
        setSelectedCabinetDetailsState
    } = setters;

    const {
        initialDataResult,
        refreshRateResult,
        brightnessResult,
        dollarRateResult,
        moduleDetailsResult,
        cabinetDetailsResult,
        selectedScreenTypeCode,
        selectedLocationCode,
        selectedProtectionCode,
        selectedRefreshRateCode,
        selectedBrightnessCode,
        selectedModuleCode,
        selectedCabinetCode,
        localDollarRateInput,
        isCabinetScreenTypeSelected,
        selectedModuleDetailsState,
        selectedCabinetDetailsState,
        selectedPitchCode
    } = params;

    const {
        isLoading: isLoadingInitialData,
        locations,
        screenTypes,
        ipProtections
    } = initialDataResult;

    const {
        refreshRates: gqlFilteredRefreshRates,
        isLoading: isLoadingRefreshRates
    } = refreshRateResult;

    const {
        brightnesses: gqlFilteredBrightnesses,
        isLoading: isLoadingBrightnesses
    } = brightnessResult;

    const { dollarRate: dollarRateValue } = dollarRateResult;
    const { moduleDetails: rawModuleDetails } = moduleDetailsResult;
    const { cabinetDetails: rawCabinetDetails } = cabinetDetailsResult;

    const selectedLocationItem = useMemo(
        () => locations.find((loc): loc is GqlLocation => loc?.code === selectedLocationCode),
        [locations, selectedLocationCode]
    );

    // Установка дефолтного типа экрана
    useEffect(() => {
        if (isLoadingInitialData || screenTypes.length === 0 || selectedScreenTypeCode !== null) return;

        const defaultScreenType = screenTypes.find(st =>
            st?.code?.toLowerCase() === DEFAULT_SCREEN_TYPE.toLowerCase()
        ) ?? screenTypes.find(st => !!st?.code);

        if (defaultScreenType?.code) {
            setSelectedScreenTypeCode(defaultScreenType.code);
        }
    }, [isLoadingInitialData, screenTypes, selectedScreenTypeCode, setSelectedScreenTypeCode]);

    // Авто-выбор IP защиты
    useEffect(() => {
        if (isLoadingInitialData) return;

        if (!selectedLocationCode) {
            if (selectedProtectionCode !== null) {
                setSelectedProtectionCode(null);
            }
            return;
        }

        if (!selectedLocationItem) return;

        const codeLower = selectedLocationItem.code?.toLowerCase() ?? "";
        const nameLower = selectedLocationItem.name?.toLowerCase() ?? "";

        const isIndoor = codeLower.includes("indoor") ||
            nameLower.includes("indoor") ||
            codeLower.includes("внутр") ||
            nameLower.includes("внутр");

        const isOutdoor = codeLower.includes("outdoor") ||
            nameLower.includes("outdoor") ||
            codeLower.includes("уличн");

        let newProtectionCode: string | null = null;

        if (isIndoor) {
            newProtectionCode = ipProtections.find(ip => ip?.code === "IP30")?.code ?? null;
        } else if (isOutdoor) {
            newProtectionCode = ipProtections.find(ip => ip?.code === "IP65")?.code ?? null;
        }

        if (selectedProtectionCode !== newProtectionCode) {
            setSelectedProtectionCode(newProtectionCode);
        }
    }, [
        selectedLocationCode,
        ipProtections,
        isLoadingInitialData,
        selectedProtectionCode,
        setSelectedProtectionCode,
        selectedLocationItem
    ]);

    // Сброс isFlex и питча
    useEffect(() => {
        if (selectedScreenTypeCode) {
            setIsFlexSelected(false);
        }
    }, [selectedScreenTypeCode, setIsFlexSelected]);

    useEffect(() => {
        setSelectedPitchCode(null);
    }, [selectedLocationCode, setSelectedPitchCode]);

    // Установка дефолтной частоты обновления
    useEffect(() => {
        if (isLoadingRefreshRates) return;

        if (gqlFilteredRefreshRates.length > 0 && selectedRefreshRateCode === null) {
            const defaultRefreshRate = [...gqlFilteredRefreshRates]
                .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];
            setSelectedRefreshRateCode(defaultRefreshRate?.code ?? null);
        } else if (gqlFilteredRefreshRates.length === 0 && selectedRefreshRateCode !== null) {
            setSelectedRefreshRateCode(null);
        }
    }, [gqlFilteredRefreshRates, selectedRefreshRateCode, isLoadingRefreshRates, setSelectedRefreshRateCode]);

    // Установка дефолтной яркости
    useEffect(() => {
        if (isLoadingBrightnesses) return;

        const hasBrightnesses = gqlFilteredBrightnesses.length > 0;
        const currentSelectionValid = hasBrightnesses &&
            gqlFilteredBrightnesses.some(br => br?.code === selectedBrightnessCode);

        if (hasBrightnesses && (!currentSelectionValid || selectedBrightnessCode === null)) {
            const defaultBrightness = [...gqlFilteredBrightnesses]
                .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];

            if (defaultBrightness?.code && defaultBrightness.code !== selectedBrightnessCode) {
                setSelectedBrightnessCode(defaultBrightness.code);
            } else if (!defaultBrightness && selectedBrightnessCode !== null) {
                setSelectedBrightnessCode(null);
            }
        } else if (!hasBrightnesses && selectedBrightnessCode !== null) {
            setSelectedBrightnessCode(null);
        }
    }, [gqlFilteredBrightnesses, isLoadingBrightnesses, selectedBrightnessCode, setSelectedBrightnessCode]);

    // Сброс модуля при изменении зависимостей
    useEffect(() => {
        const currentModuleDepsEnabled = Boolean(
            selectedLocationCode &&
            selectedPitchCode &&
            selectedBrightnessCode &&
            selectedRefreshRateCode
        );

        if (selectedModuleCode !== null && !currentModuleDepsEnabled) {
            setSelectedModuleCode(null);
        }
    }, [
        selectedLocationCode,
        selectedPitchCode,
        selectedBrightnessCode,
        selectedRefreshRateCode,
        selectedModuleCode,
        setSelectedModuleCode
    ]);

    // Синхронизация курса доллара
    useEffect(() => {
        if (dollarRateValue !== undefined &&
            dollarRateValue !== null &&
            localDollarRateInput === "") {
            setLocalDollarRateInput(dollarRateValue);
        }
    }, [dollarRateValue, localDollarRateInput, setLocalDollarRateInput]);

    // Синхронизация деталей модуля
    useEffect(() => {
        if (!rawModuleDetails) {
            if (selectedModuleDetailsState !== null) {
                setSelectedModuleDetailsState(null);
            }
            return;
        }

        const sizeData = rawModuleDetails.sizes?.[0];
        const mappedModule: ModuleData = {
            code: rawModuleDetails.code,
            sku: rawModuleDetails.sku,
            name: rawModuleDetails.name,
            width: sizeData?.width ?? 0,
            height: sizeData?.height ?? 0,
            powerConsumptionAvg: rawModuleDetails.powerConsumptionAvg,
            powerConsumptionMax: rawModuleDetails.powerConsumptionMax,
            components: rawModuleDetails.items
                ?.map(comp => ({
                    quantity: comp?.quantity ?? 0,
                    itemCode: comp?.item?.code ?? "unknown",
                    itemName: comp?.item?.name ?? "Unknown Item",
                    itemSku: comp?.item?.sku,
                }))
                .filter(c => c.itemCode !== "unknown") ?? [],
        };

        if (JSON.stringify(mappedModule) !== JSON.stringify(selectedModuleDetailsState)) {
            setSelectedModuleDetailsState(mappedModule);
        }
    }, [rawModuleDetails, selectedModuleDetailsState, setSelectedModuleDetailsState]);

    // Синхронизация деталей кабинета
    useEffect(() => {
        if (!isCabinetScreenTypeSelected || !selectedCabinetCode) {
            if (selectedCabinetDetailsState !== null) {
                setSelectedCabinetDetailsState(null);
                if (selectedCabinetDetailsState?.code) {
                    queryClient.cancelQueries({
                        queryKey: ["cabinetDetails", selectedCabinetDetailsState.code]
                    });
                }
            }
            return;
        }

        if (!rawCabinetDetails) {
            if (selectedCabinetDetailsState !== null) {
                setSelectedCabinetDetailsState(null);
            }
            return;
        }

        const sizeData = rawCabinetDetails.sizes?.[0]?.size;
        const mappedCabinet: CabinetData = {
            code: rawCabinetDetails.code,
            sku: rawCabinetDetails.sku,
            name: rawCabinetDetails.name,
            width: sizeData?.width ?? 0,
            height: sizeData?.height ?? 0,
        };

        if (JSON.stringify(mappedCabinet) !== JSON.stringify(selectedCabinetDetailsState)) {
            setSelectedCabinetDetailsState(mappedCabinet);
        }
    }, [
        selectedCabinetCode,
        isCabinetScreenTypeSelected,
        rawCabinetDetails,
        selectedCabinetDetailsState,
        queryClient,
        setSelectedCabinetDetailsState
    ]);
}