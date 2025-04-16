// src/context/CalculatorContext.tsx
import {
  createContext,
  useState,
  useMemo,
  useCallback,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { graphQLClient } from "../services/graphqlClient";

// --- Импорты типов ---
import type {
  ScreenType as GqlScreenType,
  Option as GqlOption,
  Location as GqlLocation,
  Material as GqlMaterial,
  IpProtection as GqlIpProtection,
  Brightness as GqlBrightness,
  RefreshRate as GqlRefreshRate,
  Sensor as GqlSensor,
  ControlType as GqlControlType,
  Pitch as GqlPitch,
  Module as GqlModule,
  Cabinet as GqlCabinet,
  CabinetFilterInput,
  Maybe,
} from "../generated/graphql/graphql";

// Типы для опций UI
type SegmentData = { label: string; value: string };
type SelectOption = { label: string; value: string };

// --- GraphQL Фрагменты ---
const OptionFields = gql`
  fragment OptionFields on Option { id code name active }
`;
const LocationFields = gql`
  fragment LocationFields on Location { id code name active }
`;
const MaterialFields = gql`
  fragment MaterialFields on Material { id code name active }
`;
const BrightnessFields = gql`
  fragment BrightnessFields on Brightness { id code value active }
`;
const RefreshRateFields = gql`
  fragment RefreshRateFields on RefreshRate { id code value active }
`;
const SensorFields = gql`
  fragment SensorFields on Sensor { id code name active }
`;
const ControlTypeFields = gql`
  fragment ControlTypeFields on ControlType { id code name active }
`;
const ModuleOptionFields = gql`
  fragment ModuleOptionFields on Module { id code sku name active }
`;
const PitchFields = gql`
  fragment PitchFields on Pitch { id code pitchValue active }
`;
const CabinetOptionFields = gql`
  fragment CabinetOptionFields on Cabinet { id code sku name active }
`;

// --- GraphQL Запросы ---
const GET_INITIAL_DATA = gql`
  ${LocationFields}
  ${MaterialFields}
  ${BrightnessFields}
  ${RefreshRateFields}
  ${SensorFields}
  ${ControlTypeFields}
  ${ModuleOptionFields}
  ${PitchFields}

  query GetInitialData {
    screenTypes(onlyActive: true) { id code name }
    locations { ...LocationFields }
    materials { ...MaterialFields }
    ipProtections(onlyActive: true) { id code }
    brightnesses(onlyActive: true) { ...BrightnessFields }
    refreshRates(onlyActive: true) { ...RefreshRateFields }
    sensors(onlyActive: true) { ...SensorFields }
    controlTypes(onlyActive: true) { ...ControlTypeFields }
    moduleOptions(onlyActive: true) { ...ModuleOptionFields }
    pitches(onlyActive: true) { ...PitchFields }
  }
`;

const GET_CABINET_OPTIONS = gql`
  ${CabinetOptionFields}
  query GetCabinetOptions($filters: CabinetFilterInput, $onlyActive: Boolean) {
    cabinetOptions(filters: $filters, onlyActive: $onlyActive) {
      ...CabinetOptionFields
    }
  }
`;

const GET_SCREEN_TYPE_OPTIONS = gql`
  ${OptionFields}
  query GetScreenTypeOptions($screenTypeCode: String!, $onlyActive: Boolean) {
    optionsByScreenType(screenTypeCode: $screenTypeCode, onlyActive: $onlyActive) {
      ...OptionFields
    }
  }
`;

// --- Типы для ответов GraphQL ---
type InitialDataQueryResult = {
  screenTypes: Maybe<Array<Maybe<Pick<GqlScreenType, "id" | "code" | "name">>>>;
  locations: Maybe<Array<Maybe<GqlLocation>>>;
  materials: Maybe<Array<Maybe<GqlMaterial>>>;
  ipProtections: Maybe<Array<Maybe<Pick<GqlIpProtection, "id" | "code">>>>;
  brightnesses: Maybe<Array<Maybe<GqlBrightness>>>;
  refreshRates: Maybe<Array<Maybe<GqlRefreshRate>>>;
  sensors: Maybe<Array<Maybe<GqlSensor>>>;
  controlTypes: Maybe<Array<Maybe<GqlControlType>>>;
  moduleOptions: Maybe<Array<Maybe<GqlModule>>>;
  pitches: Maybe<Array<Maybe<Pick<GqlPitch, 'id' | 'code' | 'pitchValue' | 'active'>>>>;
};

type CabinetOptionsQueryResult = {
  cabinetOptions: Maybe<Array<Maybe<Pick<GqlCabinet, 'id' | 'code' | 'sku' | 'name' | 'active'>>>>;
};

type ScreenTypeOptionsQueryResult = {
  optionsByScreenType: Maybe<Array<Maybe<Pick<GqlOption, 'id' | 'code' | 'name' | 'active'>>>>;
};

// --- Функция-запрос (Начальные данные) ---
const fetchInitialData = async (): Promise<InitialDataQueryResult> => {
  console.log("Fetching initial data (Context)...");
  try {
    const data = await graphQLClient.request<InitialDataQueryResult>(
      GET_INITIAL_DATA
    );
    console.log("Received initial data (Context)");
    return {
      screenTypes: data?.screenTypes ?? [],
      locations: data?.locations ?? [],
      materials: data?.materials ?? [],
      ipProtections: data?.ipProtections ?? [],
      brightnesses: data?.brightnesses ?? [],
      refreshRates: data?.refreshRates ?? [],
      sensors: data?.sensors ?? [],
      controlTypes: data?.controlTypes ?? [],
      moduleOptions: data?.moduleOptions ?? [],
      pitches: data?.pitches ?? [],
    };
  } catch (error) {
    console.error("Error fetching initial data (Context):", error);
    if (error instanceof Error)
      throw new Error(`GraphQL request failed: ${error.message}`);
    throw new Error("An unknown error occurred during fetch.");
  }
};

// --- Интерфейс для значения Контекста ---
interface CalculatorContextProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  // Начальные данные
  screenTypes: (Pick<GqlScreenType, "id" | "code" | "name"> | null | undefined)[];
  locations: (GqlLocation | null | undefined)[];
  materials: (GqlMaterial | null | undefined)[];
  ipProtections: (Pick<GqlIpProtection, "id" | "code"> | null | undefined)[];
  brightnesses: (GqlBrightness | null | undefined)[];
  refreshRates: (GqlRefreshRate | null | undefined)[];
  sensors: (GqlSensor | null | undefined)[];
  controlTypes: (GqlControlType | null | undefined)[];
  pitches: (Pick<GqlPitch, 'id' | 'code' | 'pitchValue' | 'active'> | null | undefined)[];
  modules: (GqlModule | null | undefined)[];
  // Динамические данные и статус
  optionsQueryResult: {
      data: (Pick<GqlOption, 'id' | 'code' | 'name' | 'active'> | null | undefined)[];
      isLoading: boolean;
      isError: boolean;
      error: Error | null;
  };
  cabinetQueryResult: {
    data: (Pick<GqlCabinet, 'id' | 'code' | 'sku' | 'name' | 'active'> | null | undefined)[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  // Состояния выбора
  selectedScreenTypeCode: string | null;
  isFlexSelected: boolean;
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
  widthMm: string | number;
  heightMm: string | number;
  // Функции обновления
  setSelectedScreenTypeCode: (code: string | null) => void;
  setIsFlexSelected: (selected: boolean) => void;
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
  setWidthMm: (value: string | number) => void;
  setHeightMm: (value: string | number) => void;
  // Опции и флаги для UI
  screenTypeSegments: SegmentData[];
  isFlexOptionAvailable: boolean;
  locationOptions: SelectOption[];
  materialOptions: SelectOption[];
  protectionOptions: SelectOption[];
  brightnessOptions: SelectOption[];
  refreshRateOptions: SelectOption[];
  sensorOptions: SegmentData[];
  controlTypeOptions: SegmentData[];
  pitchOptions: SelectOption[];
  moduleOptions: SelectOption[];
  cabinetOptions: SelectOption[];
  // Сброс
  resetQuery: () => void;
}

// --- Создание Контекста ---
const CalculatorContext = createContext<CalculatorContextProps>({
  isLoading: true, isError: false, error: null,
  screenTypes: [], locations: [], materials: [], ipProtections: [], brightnesses: [], refreshRates: [], sensors: [], controlTypes: [], pitches: [], modules: [],
  optionsQueryResult: { data: [], isLoading: false, isError: false, error: null },
  cabinetQueryResult: { data: [], isLoading: false, isError: false, error: null },
  selectedScreenTypeCode: null, isFlexSelected: false, selectedLocationCode: null, selectedMaterialCode: null, selectedProtectionCode: null, selectedBrightnessCode: null, selectedRefreshRateCode: null, selectedSensorCodes: [], selectedControlTypeCodes: [], selectedPitchCode: null, selectedModuleCode: null, selectedCabinetCode: null, widthMm: "", heightMm: "",
  setSelectedScreenTypeCode: () => {}, setIsFlexSelected: () => {}, setSelectedLocationCode: () => {}, setSelectedMaterialCode: () => {}, setSelectedProtectionCode: () => {}, setSelectedBrightnessCode: () => {}, setSelectedRefreshRateCode: () => {}, setSelectedSensorCodes: () => {}, setSelectedControlTypeCodes: () => {}, setSelectedPitchCode: () => {}, setSelectedModuleCode: () => {}, setSelectedCabinetCode: () => {}, setWidthMm: () => {}, setHeightMm: () => {},
  screenTypeSegments: [], isFlexOptionAvailable: false, locationOptions: [], materialOptions: [], protectionOptions: [], brightnessOptions: [], refreshRateOptions: [], sensorOptions: [], controlTypeOptions: [], pitchOptions: [], moduleOptions: [], cabinetOptions: [],
  resetQuery: () => {},
});

// --- Компонент Провайдера Контекста ---
export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
  // --- Состояния выбора ---
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

  // --- Запрос начальных данных ---
  const { data: initialData, isLoading: isLoadingInitial, isError: isErrorInitial, error: errorInitial, refetch: refetchInitial } = useQuery<
    InitialDataQueryResult, Error
  >({
    queryKey: ["calculatorInitialData"],
    queryFn: fetchInitialData,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Извлечение начальных данных
  const screenTypes = initialData?.screenTypes ?? [];
  const gqlLocations = initialData?.locations ?? [];
  const gqlMaterials = initialData?.materials ?? [];
  const gqlIpProtections = initialData?.ipProtections ?? [];
  const gqlBrightnessValues = initialData?.brightnesses ?? [];
  const gqlRefreshRates = initialData?.refreshRates ?? [];
  const gqlSensors = initialData?.sensors ?? [];
  const gqlControlTypes = initialData?.controlTypes ?? [];
  const gqlPitches = initialData?.pitches ?? [];
  const gqlModules = initialData?.moduleOptions ?? [];

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС ОПЦИЙ ---
  const enabledOptionsQuery = !!selectedScreenTypeCode;
  const {
      data: optionsData,
      isLoading: isLoadingOptions,
      isError: isErrorOptions,
      error: errorOptions,
      refetch: refetchOptions
  } = useQuery<ScreenTypeOptionsQueryResult, Error>({
      queryKey: ['screenTypeOptions', selectedScreenTypeCode],
      queryFn: async () => {
          console.log(`[Options Query] Fetching options for screen type: ${selectedScreenTypeCode}`);
          if (!selectedScreenTypeCode) throw new Error("Screen type code is required to fetch options.");
          const variables = { screenTypeCode: selectedScreenTypeCode, onlyActive: true };
          return graphQLClient.request<ScreenTypeOptionsQueryResult>(GET_SCREEN_TYPE_OPTIONS, variables);
      },
      enabled: enabledOptionsQuery,
      staleTime: 1000 * 60 * 15,
      refetchOnWindowFocus: false,
  });
  const availableOptions = optionsData?.optionsByScreenType ?? [];

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС КАБИНЕТОВ ---
  const cabinetScreenTypeCode = 'cabinet';
  const isCabinetScreenTypeSelected = selectedScreenTypeCode === cabinetScreenTypeCode;
  const areCabinetDepsSelected = !!(selectedLocationCode && selectedMaterialCode && selectedPitchCode && selectedModuleCode);
  const enabledCabinetQuery = isCabinetScreenTypeSelected && areCabinetDepsSelected;
  const {
      data: cabinetData,
      isLoading: isLoadingCabinets,
      isError: isErrorCabinets,
      error: errorCabinets,
      refetch: refetchCabinets
  } = useQuery<CabinetOptionsQueryResult, Error>({
      queryKey: ['cabinetOptions', selectedLocationCode, selectedMaterialCode, selectedPitchCode, selectedModuleCode],
      queryFn: async () => {
          console.log('[Cabinet Query] Fetching cabinet options...');
          const variables: { filters: CabinetFilterInput, onlyActive: boolean } = {
              filters: {
                  locationCode: selectedLocationCode || undefined,
                  materialCode: selectedMaterialCode || undefined,
                  pitchCode: selectedPitchCode || undefined,
                  moduleCode: selectedModuleCode || undefined
              },
              onlyActive: true
          };
          return graphQLClient.request<CabinetOptionsQueryResult>(GET_CABINET_OPTIONS, variables);
      },
      enabled: enabledCabinetQuery,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
  });
  const gqlCabinets = cabinetData?.cabinetOptions ?? [];

  // --- Эффекты ---
  useEffect(() => {
    if (!isLoadingInitial && screenTypes.length > 0 && selectedScreenTypeCode === null) {
      const defaultCode = "cabinet";
      const defaultScreenType = screenTypes.find((st) => st?.code?.toLowerCase() === defaultCode.toLowerCase());
      if (defaultScreenType?.code) setSelectedScreenTypeCodeState(defaultScreenType.code);
      else {
        const firstAvailable = screenTypes.find((st) => !!st?.code);
        if (firstAvailable?.code) {
          setSelectedScreenTypeCodeState(firstAvailable.code);
          console.warn(`Default ScreenType code '${defaultCode}' not found. Using first available: ${firstAvailable.code}`);
        } else console.warn(`Default ScreenType code '${defaultCode}' not found, and no other types available.`);
      }
    }
  }, [isLoadingInitial, screenTypes, selectedScreenTypeCode]);

  useEffect(() => {
    if (isLoadingInitial || !selectedLocationCode) {
      if (!selectedLocationCode && selectedProtectionCode !== null) setSelectedProtectionCodeState(null);
      return;
    }
    let newProtectionCode: string | null = null;
    const selectedLocation = gqlLocations.find((loc) => loc?.code === selectedLocationCode);
    if (selectedLocation) {
      const codeLower = selectedLocation?.code?.toLowerCase() ?? "";
      const nameLower = selectedLocation?.name?.toLowerCase() ?? "";
      if (codeLower.includes("indoor") || nameLower.includes("indoor") || codeLower.includes("внутр") || nameLower.includes("внутр")) {
        newProtectionCode = gqlIpProtections.find((ip) => ip?.code === "IP30")?.code ?? null;
      } else if (codeLower.includes("outdoor") || nameLower.includes("outdoor") || codeLower.includes("уличн") || codeLower.includes("уличн")) {
        newProtectionCode = gqlIpProtections.find((ip) => ip?.code === "IP65")?.code ?? null;
      }
    }
    if (selectedProtectionCode !== newProtectionCode) setSelectedProtectionCodeState(newProtectionCode);
  }, [selectedLocationCode, gqlIpProtections, gqlLocations, isLoadingInitial]);

  useEffect(() => {
    if (selectedCabinetCode !== null && (!enabledCabinetQuery || cabinetData !== undefined)) {
         setSelectedCabinetCodeState(null);
    }
  }, [enabledCabinetQuery, cabinetData, selectedCabinetCode]);

  useEffect(() => {
    if (selectedScreenTypeCode !== undefined) { // Сброс опции при смене типа экрана
        setIsFlexSelectedState(false);
    }
  }, [selectedScreenTypeCode]);

  // --- Подготовка данных для селекторов (useMemo) ---
  const screenTypeSegments = useMemo((): SegmentData[] => {
    if (!Array.isArray(screenTypes)) return [];
    return screenTypes
      .filter((st): st is Pick<GqlScreenType, "id" | "code" | "name"> & { code: string; } => !!st?.code)
      .map((st) => ({ value: st.code, label: st.name ?? st.code }));
  }, [screenTypes]);

  const locationOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlLocations)) return [];
    return gqlLocations
      .filter((loc): loc is GqlLocation & { code: string; active: true } => !!loc?.code && loc.active === true)
      .map((loc) => ({ value: loc.code, label: loc.name ?? loc.code }));
  }, [gqlLocations]);

  const materialOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlMaterials)) return [];
    return gqlMaterials
      .filter((mat): mat is GqlMaterial & { code: string; active: true } => !!mat?.code && mat.active === true)
      .map((mat) => ({ value: mat.code, label: mat.name ?? mat.code }));
  }, [gqlMaterials]);

  const protectionOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlIpProtections)) return [];
    return gqlIpProtections
      .filter((ip): ip is Pick<GqlIpProtection, "id" | "code"> & { code: string } => !!ip?.code)
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((ip) => ({ value: ip.code, label: ip.code }));
  }, [gqlIpProtections]);

  const brightnessOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlBrightnessValues)) return [];
    return gqlBrightnessValues
      .filter((br): br is GqlBrightness & { code: string; value: number; active: true } => !!br?.code && typeof br.value === 'number' && br.active === true)
      .sort((a, b) => a.value - b.value)
      .map((br) => ({ value: br.code, label: `${br.value} nit` }));
  }, [gqlBrightnessValues]);

  const refreshRateOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlRefreshRates)) return [];
    return gqlRefreshRates
      .filter((rr): rr is GqlRefreshRate & { code: string; value: number; active: true } => !!rr?.code && typeof rr.value === 'number' && rr.active === true)
      .sort((a, b) => a.value - b.value)
      .map((rr) => ({ value: rr.code, label: `${rr.value} Hz` }));
  }, [gqlRefreshRates]);

  const sensorOptions = useMemo((): SegmentData[] => {
    if (!Array.isArray(gqlSensors)) return [];
    return gqlSensors
      .filter((s): s is GqlSensor & { code: string; name: string; active: true } => !!s?.code && !!s.name && s.active === true)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({ value: s.code, label: s.name }));
  }, [gqlSensors]);

  const controlTypeOptions = useMemo((): SegmentData[] => {
    if (!Array.isArray(gqlControlTypes)) return [];
    return gqlControlTypes
      .filter((ct): ct is GqlControlType & { code: string; name: string; active: true } => !!ct?.code && !!ct.name && ct.active === true)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((ct) => ({ value: ct.code, label: ct.name }));
  }, [gqlControlTypes]);

  const pitchOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlPitches)) return [];
    return gqlPitches
      .filter((p): p is Pick<GqlPitch, 'id' | 'code' | 'pitchValue' | 'active'> & { code: string; pitchValue: number; active: true } => !!p && p.active === true && !!p.code && typeof p.pitchValue === 'number')
      .map((p) => ({ value: p.code, label: `${p.pitchValue} мм` }));
  }, [gqlPitches]);

  const moduleOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlModules)) return [];
    const filteredModules = gqlModules.filter((m): m is GqlModule & { code: string; active: true } => !!m?.code && m.active === true);
    return filteredModules.map((m) => ({
        value: m.code,
        label: m.name ?? m.sku ?? m.code ?? 'Неизвестный модуль'
    }));
  }, [gqlModules]);

  const cabinetOptions = useMemo((): SelectOption[] => {
      if (!Array.isArray(gqlCabinets)) return [];
      return gqlCabinets
          .filter((c): c is Pick<GqlCabinet, 'id' | 'code' | 'sku' | 'name' | 'active'> & { code: string } => !!c?.code)
          .map((c) => ({
              value: c.code,
              label: c.name ?? c.sku ?? c.code ?? 'Неизвестный кабинет'
          }));
  }, [gqlCabinets]);

  const isFlexOptionAvailable = useMemo((): boolean => {
    return availableOptions.some(opt => opt?.code === 'flex');
  }, [availableOptions]);

  // --- Функции для обновления состояния (useCallback) ---
  const setSelectedScreenTypeCode = useCallback((value: string | null) => { if (selectedScreenTypeCode === value) return; setSelectedScreenTypeCodeState(value); setSelectedLocationCodeState(null); setSelectedMaterialCodeState(null); setSelectedProtectionCodeState(null); setSelectedBrightnessCodeState(null); setSelectedRefreshRateCodeState(null); setSelectedSensorCodesState([]); setSelectedControlTypeCodesState([]); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); setIsFlexSelectedState(false); }, [selectedScreenTypeCode]);
  const setSelectedLocationCode = useCallback((value: string | null) => { if (selectedLocationCode === value) return; setSelectedLocationCodeState(value); setSelectedMaterialCodeState(null); setSelectedBrightnessCodeState(null); setSelectedRefreshRateCodeState(null); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); }, [selectedLocationCode]);
  const setSelectedMaterialCode = useCallback((value: string | null) => { if (selectedMaterialCode === value) return; setSelectedMaterialCodeState(value); setSelectedBrightnessCodeState(null); setSelectedRefreshRateCodeState(null); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); }, [selectedMaterialCode]);
  const setSelectedProtectionCode = useCallback((value: string | null): void => { if (selectedProtectionCode === value) return; setSelectedProtectionCodeState(value); setSelectedBrightnessCodeState(null); setSelectedRefreshRateCodeState(null); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); }, [selectedProtectionCode]);
  const setSelectedBrightnessCode = useCallback((value: string | null) => { if (selectedBrightnessCode === value) return; setSelectedBrightnessCodeState(value); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); }, [selectedBrightnessCode]);
  const setSelectedRefreshRateCode = useCallback((value: string | null) => { if (selectedRefreshRateCode === value) return; setSelectedRefreshRateCodeState(value); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); }, [selectedRefreshRateCode]);
  const setSelectedSensorCodes = useCallback((value: string[]) => { setSelectedSensorCodesState(value); }, []);
  const setSelectedControlTypeCodes = useCallback((value: string[]) => { setSelectedControlTypeCodesState(value); }, []);
  const setSelectedPitchCode = useCallback((value: string | null) => { if (selectedPitchCode === value) return; setSelectedPitchCodeState(value); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null); }, [selectedPitchCode]);
  const setSelectedModuleCode = useCallback((value: string | null) => { if (selectedModuleCode === value) return; setSelectedModuleCodeState(value); setSelectedCabinetCodeState(null); }, [selectedModuleCode]);
  const setSelectedCabinetCode = useCallback((value: string | null) => { if (selectedCabinetCode === value) return; setSelectedCabinetCodeState(value); }, [selectedCabinetCode]);
  const setIsFlexSelected = useCallback((selected: boolean) => { setIsFlexSelectedState(selected); }, []);
  const setWidthMm = useCallback((value: string | number) => { setWidthMmState(value); }, []);
  const setHeightMm = useCallback((value: string | number) => { setHeightMmState(value); }, []);

  // Функция сброса
  const resetQuery = useCallback(() => { refetchInitial(); refetchCabinets(); refetchOptions(); }, [refetchInitial, refetchCabinets, refetchOptions]);

  // --- Формируем значение контекста ---
  const contextValue: CalculatorContextProps = {
    isLoading: isLoadingInitial, isError: isErrorInitial, error: errorInitial,
    screenTypes, locations: gqlLocations, materials: gqlMaterials, ipProtections: gqlIpProtections, brightnesses: gqlBrightnessValues, refreshRates: gqlRefreshRates, sensors: gqlSensors, controlTypes: gqlControlTypes, pitches: gqlPitches, modules: gqlModules,
    optionsQueryResult: { data: availableOptions, isLoading: isLoadingOptions, isError: isErrorOptions, error: errorOptions },
    cabinetQueryResult: { data: gqlCabinets, isLoading: isLoadingCabinets, isError: isErrorCabinets, error: errorCabinets },
    selectedScreenTypeCode, isFlexSelected, selectedLocationCode, selectedMaterialCode, selectedProtectionCode, selectedBrightnessCode, selectedRefreshRateCode, selectedSensorCodes, selectedControlTypeCodes, selectedPitchCode, selectedModuleCode, selectedCabinetCode, widthMm, heightMm,
    setSelectedScreenTypeCode, setIsFlexSelected, setSelectedLocationCode, setSelectedMaterialCode, setSelectedProtectionCode, setSelectedBrightnessCode, setSelectedRefreshRateCode, setSelectedSensorCodes, setSelectedControlTypeCodes, setSelectedPitchCode, setSelectedModuleCode, setSelectedCabinetCode, setWidthMm, setHeightMm,
    screenTypeSegments, isFlexOptionAvailable, locationOptions, materialOptions, protectionOptions, brightnessOptions, refreshRateOptions, sensorOptions, controlTypeOptions, pitchOptions, moduleOptions, cabinetOptions,
    resetQuery,
  };

  return (
    <CalculatorContext.Provider value={contextValue}>
      {children}
    </CalculatorContext.Provider>
  );
};

// --- Кастомный хук ---
export const useCalculatorContext = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error("useCalculatorContext must be used within a CalculatorProvider");
  }
  return context;
};