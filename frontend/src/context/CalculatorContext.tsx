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
  GetPitchOptionsByLocationQuery,
  GetFilteredRefreshRateOptionsQuery,
  GetFilteredBrightnessOptionsQuery,
  Module as GqlModule,
  GetModuleOptionsQuery,
  Cabinet as GqlCabinet,
  CabinetFilterInput,
  ModuleFilterInput,
  Maybe,
} from "../generated/graphql/graphql";

// Типы для опций UI
type SelectOption = { label: string; value: string };

// --- GraphQL Фрагменты ---
const OptionFields = gql`
  fragment OptionFields on Option {
    id
    code
    name
    active
  }
`;
const LocationFields = gql`
  fragment LocationFields on Location {
    id
    code
    name
    active
  }
`;
const MaterialFields = gql`
  fragment MaterialFields on Material {
    id
    code
    name
    active
  }
`;

const PitchFields = gql`
  fragment PitchFields on Pitch {
    id
    code
    pitchValue
    active
  }
`;

const BrightnessFields = gql`
  fragment BrightnessFields on Brightness {
    id
    code
    value
    active
  }
`;
const RefreshRateFields = gql`
  fragment RefreshRateFields on RefreshRate {
    id
    code
    value
    active
  }
`;
const SensorFields = gql`
  fragment SensorFields on Sensor {
    id
    code
    name
    active
  }
`;
const ControlTypeFields = gql`
  fragment ControlTypeFields on ControlType {
    id
    code
    name
    active
  }
`;
const ModuleOptionFields = gql`
  fragment ModuleOptionFields on Module {
    id
    code
    sku
    name
    active
    brightnesses {
      brightnessCode
    }
    refreshRates {
      refreshRateCode
    }
  }
`;
const CabinetOptionFields = gql`
  fragment CabinetOptionFields on Cabinet {
    id
    code
    sku
    name
    active
  }
`;

// --- GraphQL Запросы ---
const GET_INITIAL_DATA = gql`
  ${LocationFields}
  ${MaterialFields}
  ${SensorFields}
  ${ControlTypeFields}

  query GetInitialData {
    screenTypes(onlyActive: true) {
      id
      code
      name
    }
    locations {
      ...LocationFields
    }
    materials {
      ...MaterialFields
    }
    ipProtections(onlyActive: true) {
      id
      code
    }
    sensors(onlyActive: true) {
      ...SensorFields
    }
    controlTypes(onlyActive: true) {
      ...ControlTypeFields
    }
  }
`;

const GET_SCREEN_TYPE_OPTIONS = gql`
  ${OptionFields}
  query GetScreenTypeOptions($screenTypeCode: String!, $onlyActive: Boolean) {
    optionsByScreenType(
      screenTypeCode: $screenTypeCode
      onlyActive: $onlyActive
    ) {
      ...OptionFields
    }
  }
`;

const GET_PITCH_OPTIONS_BY_LOCATION = gql`
  ${PitchFields}
  query GetPitchOptionsByLocation(
    $locationCode: String!
    $onlyActive: Boolean
  ) {
    pitchOptionsByLocation(
      locationCode: $locationCode
      onlyActive: $onlyActive
    ) {
      ...PitchFields
    }
  }
`;

const GET_FILTERED_REFRESH_RATE_OPTIONS = gql`
  ${RefreshRateFields}
  query GetFilteredRefreshRateOptions(
    $locationCode: String!
    $pitchCode: String!
    $onlyActive: Boolean
  ) {
    getFilteredRefreshRateOptions(
      locationCode: $locationCode
      pitchCode: $pitchCode
      onlyActive: $onlyActive
    ) {
      ...RefreshRateFields
    }
  }
`;

const GET_FILTERED_BRIGHTNESS_OPTIONS = gql`
  ${BrightnessFields}
  query GetFilteredBrightnessOptions(
    $locationCode: String!
    $pitchCode: String!
    $refreshRateCode: String!,
    $onlyActive: Boolean
  ) {
    getFilteredBrightnessOptions(
      locationCode: $locationCode
      pitchCode: $pitchCode
      refreshRateCode: $refreshRateCode
      onlyActive: $onlyActive
    ) {
      ...BrightnessFields
    }
  }
`;

const GET_MODULE_OPTIONS = gql`
  ${ModuleOptionFields}
  # Определяем запрос с переменными
  query GetModuleOptions($filters: ModuleFilterInput, $onlyActive: Boolean) {
    moduleOptions(filters: $filters, onlyActive: $onlyActive) {
      ...ModuleOptionFields
    }
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

const GET_DOLLAR_RATE = gql`
  query GetDollarRate {
    getCurrentDollarRate
  }
`;

// --- Типы для ответов GraphQL ---
type InitialDataQueryResult = {
  screenTypes: Maybe<Array<Maybe<Pick<GqlScreenType, "id" | "code" | "name">>>>;
  locations: Maybe<Array<Maybe<GqlLocation>>>;
  materials: Maybe<Array<Maybe<GqlMaterial>>>;
  ipProtections: Maybe<Array<Maybe<Pick<GqlIpProtection, "id" | "code">>>>;
  sensors: Maybe<Array<Maybe<GqlSensor>>>;
  controlTypes: Maybe<Array<Maybe<GqlControlType>>>;
};

type ScreenTypeOptionsQueryResult = {
  optionsByScreenType: Maybe<
    Array<Maybe<Pick<GqlOption, "id" | "code" | "name" | "active">>>
  >;
};

type CabinetOptionsQueryResult = {
  cabinetOptions: Maybe<
    Array<Maybe<Pick<GqlCabinet, "id" | "code" | "sku" | "name" | "active">>>
  >;
};

type DollarRateQueryResult = {
  getCurrentDollarRate: Maybe<number>;
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
      sensors: data?.sensors ?? [],
      controlTypes: data?.controlTypes ?? [],
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
  screenTypes: (
    | Pick<GqlScreenType, "id" | "code" | "name">
    | null
    | undefined
  )[];
  locations: (GqlLocation | null | undefined)[];
  materials: (GqlMaterial | null | undefined)[];
  ipProtections: (Pick<GqlIpProtection, "id" | "code"> | null | undefined)[];
  sensors: (GqlSensor | null | undefined)[];
  controlTypes: (GqlControlType | null | undefined)[];
  optionsQueryResult: {
    data: (
      | Pick<GqlOption, "id" | "code" | "name" | "active">
      | null
      | undefined
    )[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  pitchQueryResult: {
    data: (
      | Pick<GqlPitch, "id" | "code" | "pitchValue" | "active">
      | null
      | undefined
    )[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  refreshRateQueryResult: {
    data: (
      | Pick<GqlRefreshRate, "id" | "code" | "value" | "active">
      | null
      | undefined
    )[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  brightnessQueryResult: {
    data: (
      | Pick<GqlBrightness, "id" | "code" | "value" | "active">
      | null
      | undefined
    )[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  moduleQueryResult: {
    data: (GqlModule | null | undefined)[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };

  cabinetQueryResult: {
    data: (
      | Pick<GqlCabinet, "id" | "code" | "sku" | "name" | "active">
      | null
      | undefined
    )[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  isLoadingDollarRate: boolean;
  isCalculating: boolean;
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
  dollarRate: number | string;
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
  setDollarRate: (rate: number | string) => void;
  setWidthMm: (value: string | number) => void;
  setHeightMm: (value: string | number) => void;
  performCalculation: () => void;
  screenTypeSegments: SelectOption[];
  isFlexOptionAvailable: boolean;
  locationOptions: SelectOption[];
  materialOptions: SelectOption[];
  protectionOptions: SelectOption[];
  brightnessOptions: SelectOption[];
  sensorOptions: SelectOption[];
  controlTypeOptions: SelectOption[];
  pitchOptions: SelectOption[];
  refreshRateOptions: SelectOption[];
  moduleOptions: SelectOption[];
  cabinetOptions: SelectOption[];
  isCalculationReady: boolean;
  resetQuery: () => void;
}

// --- Создание Контекста ---
const CalculatorContext = createContext<CalculatorContextProps>({
  isLoading: true,
  isError: false,
  error: null,
  screenTypes: [],
  locations: [],
  materials: [],
  ipProtections: [],
  refreshRateQueryResult: {
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  },
  brightnessQueryResult: {
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  },
  sensors: [],
  controlTypes: [],
  optionsQueryResult: {
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  },
  pitchQueryResult: {
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  },
  moduleQueryResult: {
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  },
  cabinetQueryResult: {
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  },
  isLoadingDollarRate: false,
  isCalculating: false,
  selectedScreenTypeCode: null,
  isFlexSelected: false,
  selectedLocationCode: null,
  selectedMaterialCode: null,
  selectedProtectionCode: null,
  selectedBrightnessCode: null,
  selectedRefreshRateCode: null,
  selectedSensorCodes: [],
  selectedControlTypeCodes: [],
  selectedPitchCode: null,
  selectedModuleCode: null,
  selectedCabinetCode: null,
  dollarRate: "",
  widthMm: "",
  heightMm: "",
  setSelectedScreenTypeCode: () => {},
  setIsFlexSelected: () => {},
  setSelectedLocationCode: () => {},
  setSelectedMaterialCode: () => {},
  setSelectedProtectionCode: () => {},
  setSelectedBrightnessCode: () => {},
  setSelectedRefreshRateCode: () => {},
  setSelectedSensorCodes: () => {},
  setSelectedControlTypeCodes: () => {},
  setSelectedPitchCode: () => {},
  setSelectedModuleCode: () => {},
  setSelectedCabinetCode: () => {},
  setDollarRate: () => {},
  setWidthMm: () => {},
  setHeightMm: () => {},
  performCalculation: () => {},
  screenTypeSegments: [],
  isFlexOptionAvailable: false,
  locationOptions: [],
  materialOptions: [],
  protectionOptions: [],
  brightnessOptions: [],
  refreshRateOptions: [],
  sensorOptions: [],
  controlTypeOptions: [],
  pitchOptions: [],
  moduleOptions: [],
  cabinetOptions: [],
  isCalculationReady: false,
  resetQuery: () => {},
});

// --- Компонент Провайдера Контекста ---
export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
  const [selectedScreenTypeCode, setSelectedScreenTypeCodeState] = useState<
    string | null
  >(null);
  const [widthMm, setWidthMmState] = useState<string | number>("");
  const [heightMm, setHeightMmState] = useState<string | number>("");
  const [selectedLocationCode, setSelectedLocationCodeState] = useState<
    string | null
  >(null);
  const [selectedMaterialCode, setSelectedMaterialCodeState] = useState<
    string | null
  >(null);
  const [selectedProtectionCode, setSelectedProtectionCodeState] = useState<
    string | null
  >(null);
  const [selectedBrightnessCode, setSelectedBrightnessCodeState] = useState<
    string | null
  >(null);
  const [selectedRefreshRateCode, setSelectedRefreshRateCodeState] = useState<
    string | null
  >(null);
  const [selectedSensorCodes, setSelectedSensorCodesState] = useState<string[]>(
    []
  );
  const [selectedControlTypeCodes, setSelectedControlTypeCodesState] = useState<
    string[]
  >([]);
  const [selectedPitchCode, setSelectedPitchCodeState] = useState<
    string | null
  >(null);
  const [selectedModuleCode, setSelectedModuleCodeState] = useState<
    string | null
  >(null);
  const [selectedCabinetCode, setSelectedCabinetCodeState] = useState<
    string | null
  >(null);
  const [isFlexSelected, setIsFlexSelectedState] = useState<boolean>(false);
  const [dollarRate, setDollarRateState] = useState<number | string>("");
  const [isCalculating, setIsCalculatingState] = useState<boolean>(false);

  // --- Запрос начальных данных ---
  const {
    data: initialData,
    isLoading: isLoadingInitial,
    isError: isErrorInitial,
    error: errorInitial,
    refetch: refetchInitial,
  } = useQuery<InitialDataQueryResult, Error>({
    queryKey: ["calculatorInitialData"],
    queryFn: fetchInitialData,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
  const screenTypes = initialData?.screenTypes ?? [];
  const gqlLocations = initialData?.locations ?? [];
  const gqlMaterials = initialData?.materials ?? [];
  const gqlIpProtections = initialData?.ipProtections ?? [];
  const gqlSensors = initialData?.sensors ?? [];
  const gqlControlTypes = initialData?.controlTypes ?? [];

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС ОПЦИЙ ---
  const enabledOptionsQuery = !!selectedScreenTypeCode;
  const {
    data: optionsData,
    isLoading: isLoadingOptions,
    isError: isErrorOptions,
    error: errorOptions,
    refetch: refetchOptions,
  } = useQuery<ScreenTypeOptionsQueryResult, Error>({
    queryKey: ["screenTypeOptions", selectedScreenTypeCode],
    queryFn: async () => {
      if (!selectedScreenTypeCode) throw new Error("Screen type code required");
      const variables = {
        screenTypeCode: selectedScreenTypeCode,
        onlyActive: true,
      };
      return graphQLClient.request<ScreenTypeOptionsQueryResult>(
        GET_SCREEN_TYPE_OPTIONS,
        variables
      );
    },
    enabled: enabledOptionsQuery,
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });
  const availableOptions = optionsData?.optionsByScreenType ?? [];

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС ПИТЧЕЙ ---
  // Запрос активен, если выбрана Локация
  const enabledPitchQuery = !!selectedLocationCode;

  const {
    data: pitchData,
    isLoading: isLoadingPitches,
    isError: isErrorPitches,
    error: errorPitches,
    refetch: refetchPitches,
  } = useQuery<GetPitchOptionsByLocationQuery, Error>({
    queryKey: ["pitchOptions", selectedLocationCode],
    queryFn: async () => {
      console.log(
        `[Pitch Query] Fetching pitch options for location: ${selectedLocationCode}`
      );
      if (!selectedLocationCode)
        throw new Error("Location code is required to fetch pitches.");
      const variables = {
        locationCode: selectedLocationCode,
        onlyActive: true,
      };
      return graphQLClient.request<GetPitchOptionsByLocationQuery>(
        GET_PITCH_OPTIONS_BY_LOCATION,
        variables
      );
    },
    enabled: enabledPitchQuery,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
  // Извлекаем ОТФИЛЬТРОВАННЫЕ питчи
  const gqlFilteredPitches = pitchData?.pitchOptionsByLocation ?? [];

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС ЯРКОСТИ (НОВЫЙ) ---
  // Активен, если выбраны Локация И Питч
  const areBrightnessDepsSelected = !!(
    selectedLocationCode && selectedPitchCode && selectedRefreshRateCode
  );
  const enabledBrightnessQuery = areBrightnessDepsSelected;

  const {
    data: brightnessData,
    isLoading: isLoadingBrightnesses,
    isError: isErrorBrightnesses,
    error: errorBrightnesses,
    refetch: refetchBrightnesses,
  } = useQuery<GetFilteredBrightnessOptionsQuery, Error>({
    queryKey: ['brightnessOptions', selectedLocationCode, selectedPitchCode, selectedRefreshRateCode],
    queryFn: async () => {
      console.log(`[Brightness Query] 
        Fetching brightness for location: ${selectedLocationCode}, 
        pitch: ${selectedPitchCode}, 
        refreshRate: ${selectedRefreshRateCode}
      `);
      if (!selectedLocationCode || !selectedPitchCode || !selectedRefreshRateCode)
        throw new Error("Location and Pitch codes are required.");
      const variables = {
        locationCode: selectedLocationCode,
        pitchCode: selectedPitchCode,
        refreshRateCode: selectedRefreshRateCode,
        onlyActive: true,
      };
      return graphQLClient.request<GetFilteredBrightnessOptionsQuery>(
        GET_FILTERED_BRIGHTNESS_OPTIONS,
        variables
      );
    },
    enabled: enabledBrightnessQuery,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
  const gqlFilteredBrightnesses = brightnessData?.getFilteredBrightnessOptions ?? [];

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС ЧАСТОТЫ ОБНОВЛЕНИЯ (НОВЫЙ) ---
  const areRefreshRateDepsSelected = !!(
    selectedLocationCode && selectedPitchCode
  );
  const enabledRefreshRateQuery = areRefreshRateDepsSelected;

  const {
    data: refreshRateData,
    isLoading: isLoadingRefreshRates,
    isError: isErrorRefreshRates,
    error: errorRefreshRates,
    refetch: refetchRefreshRates,
  } = useQuery<GetFilteredRefreshRateOptionsQuery, Error>({
    // Используем сгенерированный тип
    queryKey: ["refreshRateOptions", selectedLocationCode, selectedPitchCode],
    queryFn: async () => {
      console.log(
        `[Refresh Rate Query] Fetching refresh rates for location: ${selectedLocationCode}, pitch: ${selectedPitchCode}`
      );
      if (!selectedLocationCode || !selectedPitchCode)
        throw new Error("Location and Pitch codes are required.");
      const variables = {
        locationCode: selectedLocationCode,
        pitchCode: selectedPitchCode,
        onlyActive: true,
      };
      return graphQLClient.request<GetFilteredRefreshRateOptionsQuery>(
        GET_FILTERED_REFRESH_RATE_OPTIONS,
        variables
      );
    },
    enabled: enabledRefreshRateQuery,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
  const gqlFilteredRefreshRates =
    refreshRateData?.getFilteredRefreshRateOptions ?? [];

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС МОДУЛЕЙ (НОВЫЙ) ---
  // Запрос активен, если выбраны Локация И Питч (основные фильтры для модулей)
  const areModuleDepsSelected = !!(
    selectedLocationCode &&
    selectedPitchCode &&
    selectedBrightnessCode &&
    selectedRefreshRateCode
  );
  const enabledModuleQuery = areModuleDepsSelected;

  const {
    data: moduleData,
    isLoading: isLoadingModules,
    isError: isErrorModules,
    error: errorModules,
    refetch: refetchModules,
  } = useQuery<GetModuleOptionsQuery, Error>({
    queryKey: [
      "moduleOptions",
      selectedLocationCode,
      selectedPitchCode,
      selectedBrightnessCode,
      selectedRefreshRateCode,
    ],
    queryFn: async () => {
      console.log("[Module Query] Fetching module options with filters:", {
        locationCode: selectedLocationCode,
        pitchCode: selectedPitchCode,
        refreshRateCode: selectedRefreshRateCode,
        brightnessCode: selectedBrightnessCode,
      });
      const variables: { filters: ModuleFilterInput; onlyActive: boolean } = {
        filters: {
          locationCode: selectedLocationCode || undefined,
          pitchCode: selectedPitchCode || undefined,
          brightnessCode: selectedBrightnessCode || undefined,
          refreshRateCode: selectedRefreshRateCode || undefined,
        },
        onlyActive: true,
      };
      return graphQLClient.request<GetModuleOptionsQuery>(
        GET_MODULE_OPTIONS,
        variables
      );
    },
    enabled: enabledModuleQuery,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const gqlFilteredModules = moduleData?.moduleOptions ?? [];

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС КАБИНЕТОВ ---
  const cabinetScreenTypeCode = "cabinet";
  const isCabinetScreenTypeSelected =
    selectedScreenTypeCode === cabinetScreenTypeCode;
  const areCabinetDepsSelected = !!(
    selectedLocationCode &&
    selectedMaterialCode &&
    selectedPitchCode &&
    selectedModuleCode
  );
  const enabledCabinetQuery =
    isCabinetScreenTypeSelected && areCabinetDepsSelected;
  const {
    data: cabinetData,
    isLoading: isLoadingCabinets,
    isError: isErrorCabinets,
    error: errorCabinets,
    refetch: refetchCabinets,
  } = useQuery<CabinetOptionsQueryResult, Error>({
    queryKey: [
      "cabinetOptions",
      selectedLocationCode,
      selectedMaterialCode,
      selectedPitchCode,
      selectedModuleCode,
    ],
    queryFn: async () => {
      const variables: { filters: CabinetFilterInput; onlyActive: boolean } = {
        filters: {
          locationCode: selectedLocationCode || undefined,
          materialCode: selectedMaterialCode || undefined,
          pitchCode: selectedPitchCode || undefined,
          moduleCode: selectedModuleCode || undefined,
        },
        onlyActive: true,
      };
      return graphQLClient.request<CabinetOptionsQueryResult>(
        GET_CABINET_OPTIONS,
        variables
      );
    },
    enabled: enabledCabinetQuery,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const gqlCabinets = cabinetData?.cabinetOptions ?? [];

  // --- ЗАПРОС КУРСА ДОЛЛАРА ---
  const {
    data: dollarRateData,
    isLoading: isLoadingDollarRate,
    isError: isErrorDollarRate,
    error: errorDollarRate,
  } = useQuery<DollarRateQueryResult, Error>({
    queryKey: ["dollarRate"],
    queryFn: async () =>
      graphQLClient.request<DollarRateQueryResult>(GET_DOLLAR_RATE),
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
  });

  // --- Эффекты ---
  useEffect(() => {
    if (
      !isLoadingInitial &&
      screenTypes.length > 0 &&
      selectedScreenTypeCode === null
    ) {
      const defaultCode = "cabinet";
      const defaultScreenType = screenTypes.find(
        (st) => st?.code?.toLowerCase() === defaultCode.toLowerCase()
      );
      if (defaultScreenType?.code)
        setSelectedScreenTypeCodeState(defaultScreenType.code);
      else {
        const firstAvailable = screenTypes.find((st) => !!st?.code);
        if (firstAvailable?.code) {
          setSelectedScreenTypeCodeState(firstAvailable.code);
          console.warn(
            `Default code '${defaultCode}' not found. Using first available: ${firstAvailable.code}`
          );
        } else
          console.warn(
            `Default code '${defaultCode}' not found, and no other types available.`
          );
      }
    }
  }, [isLoadingInitial, screenTypes, selectedScreenTypeCode]);

  useEffect(() => {
    if (isLoadingInitial || !selectedLocationCode) {
      if (!selectedLocationCode && selectedProtectionCode !== null)
        setSelectedProtectionCodeState(null);
      return;
    }
    let newProtectionCode: string | null = null;
    const selectedLocation = gqlLocations.find(
      (loc) => loc?.code === selectedLocationCode
    );
    if (selectedLocation) {
      const codeLower = selectedLocation?.code?.toLowerCase() ?? "";
      const nameLower = selectedLocation?.name?.toLowerCase() ?? "";
      if (
        codeLower.includes("indoor") ||
        nameLower.includes("indoor") ||
        codeLower.includes("внутр") ||
        nameLower.includes("внутр")
      )
        newProtectionCode =
          gqlIpProtections.find((ip) => ip?.code === "IP30")?.code ?? null;
      else if (
        codeLower.includes("outdoor") ||
        nameLower.includes("outdoor") ||
        codeLower.includes("уличн") ||
        codeLower.includes("уличн")
      )
        newProtectionCode =
          gqlIpProtections.find((ip) => ip?.code === "IP65")?.code ?? null;
    }
    if (selectedProtectionCode !== newProtectionCode)
      setSelectedProtectionCodeState(newProtectionCode);
  }, [selectedLocationCode, gqlIpProtections, gqlLocations, isLoadingInitial]);

  useEffect(() => {
    if (selectedScreenTypeCode !== undefined) setIsFlexSelectedState(false);
  }, [selectedScreenTypeCode]);

  useEffect(() => {
    // Сбрасываем питч, если изменилась локация (и питч был выбран)
    // Перезапрос питчей произойдет автоматически из-за изменения queryKey
    if (selectedPitchCode !== null) {
      console.log(
        "[Pitch Effect] Resetting selected pitch due to location change."
      );
      setSelectedPitchCodeState(null);
    }
  }, [selectedLocationCode]);

  useEffect(() => {
    // Если пришли новые отфильтрованные опции И текущий выбор сброшен (null) И запрос не грузится
    if (
      gqlFilteredRefreshRates.length > 0 &&
      selectedRefreshRateCode === null &&
      !isLoadingRefreshRates
    ) {
      // Находим опцию с минимальным значением 'value' (сортировка по value уже есть с бэкенда)
      const defaultRefreshRate = [...gqlFilteredRefreshRates]
        .filter(
          (
            rr: any // Используем any и проверку
          ) => !!rr && typeof rr.value === "number" && !!rr.code
        )
        .sort((a: any, b: any) => (a?.value ?? 0) - (b?.value ?? 0))[0]; // Сортируем с any

      // Приводим к any для доступа к полям
      const defaultRateObj = defaultRefreshRate as any;

      if (defaultRateObj) {
        console.log(
          `[Refresh Rate Effect] Setting default refresh rate: ${defaultRateObj.code} (${defaultRateObj.value} Hz)`
        );
        setSelectedRefreshRateCodeState(defaultRateObj.code);
      }
    } else if (
      gqlFilteredRefreshRates.length === 0 &&
      selectedRefreshRateCode !== null &&
      !isLoadingRefreshRates
    ) {
      console.log(
        `[Refresh Rate Effect] Resetting refresh rate as no options are available.`
      );
      setSelectedRefreshRateCodeState(null);
    }
  }, [gqlFilteredRefreshRates, selectedRefreshRateCode, isLoadingRefreshRates]);

  // --- НОВЫЙ useEffect: Установка дефолтной Яркости ---
  useEffect(() => {
    // Используем gqlFilteredBrightnesses
    if (
      gqlFilteredBrightnesses.length > 0 &&
      selectedBrightnessCode === null &&
      !isLoadingBrightnesses
    ) {
      // Находим опцию с минимальным значением 'value'
      const defaultBrightness = [...gqlFilteredBrightnesses] // Копируем
        .filter(
          (
            br: any // <-- any + проверка
          ) => !!br && typeof br.value === "number" && !!br.code
        )
        .sort((a: any, b: any) => (a?.value ?? 0) - (b?.value ?? 0))[0]; // <-- any для sort

      const defaultBrightnessObj = defaultBrightness as any; // <-- any для доступа

      if (defaultBrightnessObj) {
        console.log(
          `[Brightness Effect] Setting default brightness: ${defaultBrightnessObj.code} (${defaultBrightnessObj.value} nit)`
        );
        setSelectedBrightnessCodeState(defaultBrightnessObj.code);
      }
    } else if (
      gqlFilteredBrightnesses.length === 0 &&
      selectedBrightnessCode !== null &&
      !isLoadingBrightnesses
    ) {
      console.log(
        `[Brightness Effect] Resetting brightness as no options are available.`
      );
      setSelectedBrightnessCodeState(null);
    }
  }, [gqlFilteredBrightnesses, selectedBrightnessCode, isLoadingBrightnesses]);

  useEffect(() => {
    // Сбрасываем, если запрос стал неактивным или пришли новые данные
    if (selectedModuleCode !== null && !enabledModuleQuery) {
      console.log(
        "[Module Effect] Resetting selected module due to dependency change or query disabling/refetch."
      );
      setSelectedModuleCodeState(null);
    }
  }, [enabledModuleQuery]);

  useEffect(() => {
    if (dollarRateData?.getCurrentDollarRate && dollarRate === "")
      setDollarRateState(dollarRateData.getCurrentDollarRate);
    if (isErrorDollarRate && errorDollarRate)
      console.error("Error fetching dollar rate:", errorDollarRate.message);
  }, [dollarRateData, dollarRate, isErrorDollarRate, errorDollarRate]);

  // --- Подготовка данных для селекторов (useMemo) ---
  const screenTypeSegments = useMemo((): SelectOption[] => {
    if (!Array.isArray(screenTypes)) return [];
    return screenTypes
      .filter(
        (
          st
        ): st is Pick<GqlScreenType, "id" | "code" | "name"> & {
          code: string;
        } => !!st?.code
      )
      .map((st) => ({ value: st.code, label: st.name ?? st.code }));
  }, [screenTypes]);

  const locationOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlLocations)) return [];
    return gqlLocations
      .filter(
        (loc): loc is GqlLocation & { code: string; active: true } =>
          !!loc?.code && loc.active === true
      )
      .map((loc) => ({ value: loc.code, label: loc.name ?? loc.code }));
  }, [gqlLocations]);

  const materialOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlMaterials)) return [];
    return gqlMaterials
      .filter(
        (mat): mat is GqlMaterial & { code: string; active: true } =>
          !!mat?.code && mat.active === true
      )
      .map((mat) => ({ value: mat.code, label: mat.name ?? mat.code }));
  }, [gqlMaterials]);

  const protectionOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlIpProtections)) return [];
    return gqlIpProtections
      .filter(
        (ip): ip is Pick<GqlIpProtection, "id" | "code"> & { code: string } =>
          !!ip?.code
      )
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((ip) => ({ value: ip.code, label: ip.code }));
  }, [gqlIpProtections]);

  const pitchOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlFilteredPitches)) return [];
    const result: SelectOption[] = [];
    for (const p of gqlFilteredPitches) {
      const pitch = p as Pick<GqlPitch, "code" | "pitchValue">;
      if (
        pitch &&
        typeof pitch.code === "string" &&
        pitch.code !== "" &&
        typeof pitch.pitchValue === "number"
      ) {
        result.push({ value: pitch.code, label: `${pitch.pitchValue} мм` });
      }
    }
    result.sort((a, b) => {
      const pitchAObj = gqlFilteredPitches.find(
        (p) => (p as GqlPitch)?.code === a.value
      );
      const pitchBObj = gqlFilteredPitches.find(
        (p) => (p as GqlPitch)?.code === b.value
      );
      const valueA = Number((pitchAObj as GqlPitch)?.pitchValue ?? 0);
      const valueB = Number((pitchBObj as GqlPitch)?.pitchValue ?? 0);
      return valueA - valueB;
    });
    return result;
  }, [gqlFilteredPitches]);

  const brightnessOptions = useMemo((): SelectOption[] => {
    // Работаем с результатом ДИНАМИЧЕСКОГО запроса gqlFilteredBrightnesses
    if (!Array.isArray(gqlFilteredBrightnesses)) return [];
    return (
      gqlFilteredBrightnesses
        .filter(
          (
            br: any
          ): br is Pick<GqlBrightness, "id" | "code" | "value" | "active"> & {
            code: string;
            value: number;
          } => !!br?.code && typeof br.value === "number"
        )
        // Сортировка уже на бэкенде
        .map((br: any) => ({
          value: br.code ?? "",
          label: `${br.value ?? "?"} nit`,
        }))
    );
  }, [gqlFilteredBrightnesses]);

  const refreshRateOptions = useMemo((): SelectOption[] => {
    // Работаем с результатом ДИНАМИЧЕСКОГО запроса gqlFilteredRefreshRates
    if (!Array.isArray(gqlFilteredRefreshRates)) return [];
    return (
      gqlFilteredRefreshRates
        // Фильтруем null/undefined и проверяем поля
        .filter(
          (
            rr: any
          ): rr is Pick<GqlRefreshRate, "id" | "code" | "value" | "active"> & {
            code: string;
            value: number;
          } => !!rr?.code && typeof rr.value === "number"
        )
        // Сортировка уже на бэкенде
        .map((rr: any) => ({
          value: rr.code ?? "",
          label: `${rr.value ?? "?"} Hz`,
        }))
    );
  }, [gqlFilteredRefreshRates]);

  const sensorOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlSensors)) return [];
    return gqlSensors
      .filter(
        (s): s is GqlSensor & { code: string; name: string; active: true } =>
          !!s?.code && !!s.name && s.active === true
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({ value: s.code, label: s.name }));
  }, [gqlSensors]);

  const controlTypeOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlControlTypes)) return [];
    return gqlControlTypes
      .filter(
        (
          ct
        ): ct is GqlControlType & {
          code: string;
          name: string;
          active: true;
        } => !!ct?.code && !!ct.name && ct.active === true
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((ct) => ({ value: ct.code, label: ct.name }));
  }, [gqlControlTypes]);

  const moduleOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlFilteredModules)) return [];
    return gqlFilteredModules
      .filter(
        (m): m is GqlModule & { code: string } => !!(m as GqlModule)?.code
      )
      .map((m: any) => ({
        value: m.code ?? "",
        label: m.name ?? m.sku ?? m.code ?? "Неизвестный модуль",
      }));
  }, [gqlFilteredModules]);

  const cabinetOptions = useMemo((): SelectOption[] => {
    if (!Array.isArray(gqlCabinets)) return [];
    return gqlCabinets
      .filter(
        (
          c
        ): c is Pick<GqlCabinet, "id" | "code" | "sku" | "name" | "active"> & {
          code: string;
        } => !!c?.code
      )
      .map((c) => ({
        value: c.code,
        label: c.name ?? c.sku ?? c.code ?? "Неизвестный кабинет",
      }));
  }, [gqlCabinets]);

  const isFlexOptionAvailable = useMemo((): boolean => {
    return availableOptions.some((opt) => opt?.code === "flex");
  }, [availableOptions]);

  const isCalculationReady = useMemo((): boolean => {
    // ... (логика с отладкой, как была исправлена ранее) ...
    const widthValue = Number(widthMm);
    const heightValue = Number(heightMm);
    const rateValue = Number(dollarRate);
    const checkScreenType = !!selectedScreenTypeCode;
    const checkWidth = !isNaN(widthValue) && widthValue > 0;
    const checkHeight = !isNaN(heightValue) && heightValue > 0;
    const checkLocation = !!selectedLocationCode;
    const checkMaterial =
      selectedScreenTypeCode !== cabinetScreenTypeCode ||
      !!selectedMaterialCode;
    const checkProtection = !!selectedProtectionCode;
    const checkPitch = !!selectedPitchCode;
    const checkModule = !!selectedModuleCode;
    const checkCabinet =
      selectedScreenTypeCode !== cabinetScreenTypeCode || !!selectedCabinetCode;
    const checkRate = !isNaN(rateValue) && rateValue > 0;
    const checkCalculating = !isCalculating;
    const requiredFieldsFilled =
      checkScreenType &&
      checkWidth &&
      checkHeight &&
      checkLocation &&
      checkMaterial &&
      checkProtection &&
      checkPitch &&
      checkModule &&
      checkCabinet &&
      checkRate;
    console.log("Calculation Ready Check:", {
      checkScreenType,
      checkWidth,
      widthMm,
      checkHeight,
      heightMm,
      checkLocation,
      selectedLocationCode,
      checkMaterial,
      selectedMaterialCode,
      checkProtection,
      selectedProtectionCode,
      checkPitch,
      selectedPitchCode,
      checkModule,
      selectedModuleCode,
      checkCabinet,
      selectedCabinetCode,
      checkRate,
      dollarRate,
      checkCalculating,
      requiredFieldsFilled,
      isCalculationReady: requiredFieldsFilled && checkCalculating,
    });
    return requiredFieldsFilled && checkCalculating;
  }, [
    selectedScreenTypeCode,
    widthMm,
    heightMm,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode,
    selectedPitchCode,
    selectedModuleCode,
    selectedCabinetCode,
    dollarRate,
    isCalculating,
    cabinetScreenTypeCode,
  ]);

  // --- Функции для обновления состояния (useCallback) ---
  const setSelectedScreenTypeCode = useCallback(
    (value: string | null) => {
      if (selectedScreenTypeCode === value) return;
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
    },
    [selectedScreenTypeCode]
  );
  const setSelectedLocationCode = useCallback(
    (value: string | null) => {
      if (selectedLocationCode === value) return;
      setSelectedLocationCodeState(value);
      setSelectedMaterialCodeState(null);
      setSelectedBrightnessCodeState(null);
      setSelectedRefreshRateCodeState(null);
      setSelectedPitchCodeState(null);
      setSelectedModuleCodeState(null);
      setSelectedCabinetCodeState(null);
    },
    [selectedLocationCode]
  );
  const setSelectedMaterialCode = useCallback(
    (value: string | null) => {
      if (selectedMaterialCode === value) return;
      setSelectedMaterialCodeState(value);
      setSelectedBrightnessCodeState(null);
      setSelectedRefreshRateCodeState(null);
      setSelectedCabinetCodeState(null);
    },
    [selectedMaterialCode]
  );
  const setSelectedProtectionCode = useCallback(
    (value: string | null): void => {
      if (selectedProtectionCode === value) return;
      setSelectedProtectionCodeState(value);
      setSelectedBrightnessCodeState(null);
      setSelectedRefreshRateCodeState(null);
      setSelectedPitchCodeState(null);
      setSelectedModuleCodeState(null);
      setSelectedCabinetCodeState(null);
    },
    [selectedProtectionCode]
  );
  const setSelectedBrightnessCode = useCallback(
    (value: string | null) => {
      if (selectedBrightnessCode === value) return;
      console.log("(Context) Selected Brightness Code:", value);
      setSelectedBrightnessCodeState(value);
      setSelectedModuleCodeState(null);
      setSelectedCabinetCodeState(null);
    },
    [selectedBrightnessCode]
  );
  const setSelectedRefreshRateCode = useCallback(
    (value: string | null) => {
      if (selectedRefreshRateCode === value) return;
      console.log("(Context) Selected Refresh Rate Code:", value);
      setSelectedRefreshRateCodeState(value);
      setSelectedBrightnessCodeState(null);
      setSelectedModuleCodeState(null);
      setSelectedCabinetCodeState(null);
    },
    [selectedRefreshRateCode]
  );
  const setSelectedSensorCodes = useCallback((value: string[]) => {
    setSelectedSensorCodesState(value);
  }, []);
  const setSelectedControlTypeCodes = useCallback((value: string[]) => {
    setSelectedControlTypeCodesState(value);
  }, []);
  const setSelectedPitchCode = useCallback(
    (value: string | null) => {
      if (selectedPitchCode === value) return;
      console.log("(Context) Selected Pitch Code:", value);
      setSelectedPitchCodeState(value);
      setSelectedBrightnessCodeState(null);
      setSelectedRefreshRateCodeState(null);
      setSelectedModuleCodeState(null);
      setSelectedCabinetCodeState(null);
    },
    [selectedPitchCode]
  );
  const setSelectedModuleCode = useCallback(
    (value: string | null) => {
      if (selectedModuleCode === value) return;
      setSelectedModuleCodeState(value);
      setSelectedCabinetCodeState(null);
    },
    [selectedModuleCode]
  );
  const setSelectedCabinetCode = useCallback(
    (value: string | null) => {
      if (selectedCabinetCode === value) return;
      setSelectedCabinetCodeState(value);
    },
    [selectedCabinetCode]
  );
  const setIsFlexSelected = useCallback((selected: boolean) => {
    setIsFlexSelectedState(selected);
  }, []);
  const setDollarRate = useCallback((value: number | string) => {
    setDollarRateState(value);
  }, []);
  const setWidthMm = useCallback((value: string | number) => {
    setWidthMmState(value);
  }, []);
  const setHeightMm = useCallback((value: string | number) => {
    setHeightMmState(value);
  }, []);
  const performCalculation = useCallback(async () => {
    if (!isCalculationReady) {
      console.warn("Calculation prerequisites not met.");
      return;
    }
    console.log("🚀 Starting calculation...");
    setIsCalculatingState(true);
    try {
      const calculationInput = {
        screenTypeCode: selectedScreenTypeCode,
        widthMm: Number(widthMm),
        heightMm: Number(heightMm),
        locationCode: selectedLocationCode,
        materialCode: selectedMaterialCode,
        ipProtectionCode: selectedProtectionCode,
        brightnessCode: selectedBrightnessCode,
        refreshRateCode: selectedRefreshRateCode,
        sensorCodes: selectedSensorCodes,
        controlTypeCodes: selectedControlTypeCodes,
        pitchCode: selectedPitchCode,
        moduleCode: selectedModuleCode,
        cabinetCode: selectedCabinetCode,
        isFlex: isFlexSelected,
        dollarRate: Number(dollarRate),
      };
      console.log("Calculation Input Data:", calculationInput);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("✅ Calculation finished (simulated).");
    } catch (calcError) {
      console.error("❌ Calculation failed:", calcError);
    } finally {
      setIsCalculatingState(false);
    }
  }, [
    isCalculationReady,
    selectedScreenTypeCode,
    widthMm,
    heightMm,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode,
    selectedBrightnessCode,
    selectedRefreshRateCode,
    selectedSensorCodes,
    selectedControlTypeCodes,
    selectedPitchCode,
    selectedModuleCode,
    selectedCabinetCode,
    isFlexSelected,
    dollarRate,
  ]);
  const resetQuery = useCallback(() => {
    refetchInitial();
    refetchPitches();
    refetchRefreshRates();
    refetchBrightnesses();
    refetchCabinets();
    refetchOptions();
    refetchModules();
  }, [
    refetchInitial,
    refetchPitches,
    refetchRefreshRates,
    refetchBrightnesses,
    refetchModules,
    refetchCabinets,
    refetchOptions,
  ]);

  // --- Формируем значение контекста ---
  const contextValue: CalculatorContextProps = {
    isLoading: isLoadingInitial,
    isError: isErrorInitial,
    error: errorInitial,
    screenTypes,
    locations: gqlLocations,
    materials: gqlMaterials,
    ipProtections: gqlIpProtections,
    sensors: gqlSensors,
    controlTypes: gqlControlTypes,
    optionsQueryResult: {
      data: availableOptions,
      isLoading: isLoadingOptions,
      isError: isErrorOptions,
      error: errorOptions,
    },
    pitchQueryResult: {
      data: gqlFilteredPitches as (
        | Pick<GqlPitch, "id" | "code" | "pitchValue" | "active">
        | null
        | undefined
      )[],
      isLoading: isLoadingPitches,
      isError: isErrorPitches,
      error: errorPitches,
    },
    refreshRateQueryResult: {
      data: gqlFilteredRefreshRates as (
        | Pick<GqlRefreshRate, "id" | "code" | "value" | "active">
        | null
        | undefined
      )[],
      isLoading: isLoadingRefreshRates,
      isError: isErrorRefreshRates,
      error: errorRefreshRates,
    },
    brightnessQueryResult: {
      data: gqlFilteredBrightnesses as any,
      isLoading: isLoadingBrightnesses,
      isError: isErrorBrightnesses,
      error: errorBrightnesses,
    },
    moduleQueryResult: {
      data: gqlFilteredModules as (GqlModule | null | undefined)[],
      isLoading: isLoadingModules,
      isError: isErrorModules,
      error: errorModules,
    },
    cabinetQueryResult: {
      data: gqlCabinets,
      isLoading: isLoadingCabinets,
      isError: isErrorCabinets,
      error: errorCabinets,
    },
    isLoadingDollarRate,
    isCalculating,
    selectedScreenTypeCode,
    isFlexSelected,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode,
    selectedBrightnessCode,
    selectedRefreshRateCode,
    selectedSensorCodes,
    selectedControlTypeCodes,
    selectedPitchCode,
    selectedModuleCode,
    selectedCabinetCode,
    dollarRate,
    widthMm,
    heightMm,
    setSelectedScreenTypeCode,
    setIsFlexSelected,
    setSelectedLocationCode,
    setSelectedMaterialCode,
    setSelectedProtectionCode,
    setSelectedBrightnessCode,
    setSelectedRefreshRateCode,
    setSelectedSensorCodes,
    setSelectedControlTypeCodes,
    setSelectedPitchCode,
    setSelectedModuleCode,
    setSelectedCabinetCode,
    setDollarRate,
    performCalculation,
    setWidthMm,
    setHeightMm,
    screenTypeSegments,
    isFlexOptionAvailable,
    locationOptions,
    materialOptions,
    protectionOptions,
    brightnessOptions,
    refreshRateOptions,
    sensorOptions,
    controlTypeOptions,
    pitchOptions,
    moduleOptions,
    cabinetOptions,
    isCalculationReady,
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
  if (context === undefined)
    throw new Error(
      "useCalculatorContext must be used within a CalculatorProvider"
    );
  return context;
};
