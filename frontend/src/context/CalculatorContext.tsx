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
import { useQuery, useQueryClient, QueryKey } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { graphQLClient } from "../services/graphqlClient";
import {
  calculateTechnicalSpecs,
  calculateCosts,
} from "../services/calculatorService";
import type {
  CalculatorFormData,
  TechnicalSpecsResult,
  CostCalculationResult,
  ModuleData,
  CabinetData,
  PriceMap,
} from '../types/calculationTypes';

// --- Импорты типов GraphQL ---
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
    $isFlex: Boolean
  ) {
    getFilteredRefreshRateOptions(
      locationCode: $locationCode
      pitchCode: $pitchCode
      onlyActive: $onlyActive
      isFlex: $isFlex
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
    $refreshRateCode: String!
    $onlyActive: Boolean
    $isFlex: Boolean
  ) {
    getFilteredBrightnessOptions(
      locationCode: $locationCode
      pitchCode: $pitchCode
      refreshRateCode: $refreshRateCode
      onlyActive: $onlyActive
      isFlex: $isFlex
    ) {
      ...BrightnessFields
    }
  }
`;
const GET_MODULE_OPTIONS = gql`
  ${ModuleOptionFields}
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
const GET_MODULE_DETAILS = gql`
  query GetModuleDetails($code: String!) {
    moduleDetails(code: $code) {
      code
      sku
      name
      moduleOption
      active
      sizes {
        width
        height
      }
      # items { quantity item { code name sku } }
      # powerConsumptionAvg
      # powerConsumptionMax
    }
  }
`;
const GET_CABINET_DETAILS = gql`
  query GetCabinetDetails($code: String!) {
    cabinetDetails(code: $code) {
      code
      sku
      name
      sizes {
        size {
          width
          height
        }
      }
    }
  }
`;
const GET_PRICES_BY_CODES = gql`
  query GetPricesByCodes($codes: PriceRequestInput!) {
    getPricesByCodes(codes: $codes) {
      code
      priceUsd
      priceRub
    }
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

type PriceQueryResultItem = {
  code: string;
  priceUsd: Maybe<number>;
  priceRub: Maybe<number>;
};

type PricesQueryResult = {
  // Имя поля должно совпадать с именем поля в вашем GraphQL запросе/схеме
  getPricesByCodes: Maybe<Array<Maybe<PriceQueryResultItem>>>;
};

// Типы для ДЕТАЛЬНЫХ ответов GraphQL (ПРИМЕРНЫЕ, настройте под вашу схему и Pothos)
type ModuleDetailsGqlItemComponent = {
  quantity: number;
  item: { code: string; name: string; sku?: string | null };
};
type ModuleSizeGql = {
  width: number;
  height: number;
  active?: boolean;
};

type ModuleDetailsGql = {
  code: string;
  sku?: string | null;
  name?: string | null;
  moduleOption?: string | null;
  active?: boolean;
  sizes?: Maybe<Array<Maybe<ModuleSizeGql>>>;
  items?: Maybe<Array<Maybe<ModuleDetailsGqlItemComponent>>>;
  powerConsumptionAvg?: number | null;
  powerConsumptionMax?: number | null;
};
type ModuleDetailsQueryResult = { moduleDetails: Maybe<ModuleDetailsGql> };

type CabinetSizeGql = {
  width: number;
  height: number;
};

type CabinetDetailsGql = {
  code: string;
  sku?: string | null;
  name?: string | null;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  sizes?: Maybe<Array<Maybe<CabinetSizeGql>>>;
};
type CabinetDetailsQueryResult = { cabinetDetails: Maybe<CabinetDetailsGql> };

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
  // Статусы загрузки и ошибки основных данных
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Справочники и основные данные
  screenTypes: Maybe<Pick<GqlScreenType, "id" | "code" | "name">>[];
  locations: (GqlLocation | null | undefined)[];
  materials: (GqlMaterial | null | undefined)[];
  ipProtections: (Pick<GqlIpProtection, "id" | "code"> | null | undefined)[];
  sensors: (GqlSensor | null | undefined)[];
  controlTypes: (GqlControlType | null | undefined)[];

  // Результаты запросов списков опций
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
  // Состояние для полных данных выбранных элементов
  selectedModuleDetails: ModuleData | null;
  selectedCabinetDetails: CabinetData | null;

  // Статусы загрузки/ошибок для полных данных
  isLoadingModuleDetails: boolean;
  isErrorModuleDetails: boolean;
  errorModuleDetails: Error | null;
  isLoadingCabinetDetails: boolean;
  isErrorCabinetDetails: boolean;
  errorCabinetDetails: Error | null;

  // Состояние расчета и UI результатов
  isLoadingDollarRate: boolean;
  isCalculating: boolean;
  isDrawerOpen: boolean;
  calculationResult: TechnicalSpecsResult | null;
  costDetails: CostCalculationResult | null;

  // Выбранные значения формы
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

  // Функции обновления состояния формы
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

  // Функции действий и статусы
  performCalculation: () => void;
  setIsDrawerOpen: (open: boolean) => void;
  resetQuery: () => void;
  isCalculationReady: boolean;

  // Мемоизированные опции для селектов
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
}

// --- Создание Контекста ---
const CalculatorContext = createContext<CalculatorContextProps | undefined>(undefined);

export const useCalculatorContext = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error(
      "useCalculatorContext must be used within a CalculatorProvider"
    );
  }
  return context;
};

// --- Компонент Провайдера Контекста ---
export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // --- Состояния формы ---
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
  const cabinetScreenTypeCode = "cabinet";
  const isCabinetScreenTypeSelected = selectedScreenTypeCode === cabinetScreenTypeCode;

  // --- КОНСТАНТЫ для кодов стандартных компонентов ---
  const ITEM_CODE_PSU = "bp300";
  const ITEM_CODE_RCV_CARD = "receiver";
  const ITEM_CODE_MAGNET = "magnets";
  const ITEM_CODE_STEEL_M2 = "steel_cab_price_m2";

  // --- ФОРМИРОВАНИЕ ПЕРЕМЕННЫХ ДЛЯ ЗАПРОСА ЦЕН ---
  // const codesToFetch = useMemo(() => {
  //   const codes = new Set<string>([
  //       ITEM_CODE_PSU,
  //       ITEM_CODE_RCV_CARD,
  //       ITEM_CODE_MAGNET,
  //       ITEM_CODE_STEEL_M2, // Всегда запрашиваем стандартные
  //   ]);

  //   if (selectedModuleCode) {
  //       codes.add(selectedModuleCode);
  //   }
  //   // Добавляем код кабинета, только если это кабинетный тип и код выбран
  //   if (isCabinetScreenTypeSelected && selectedCabinetCode) {
  //       codes.add(selectedCabinetCode);
  //   }

  //   // Конвертируем Set обратно в массив
  //   return Array.from(codes);
  // }, [selectedModuleCode, selectedCabinetCode, isCabinetScreenTypeSelected]); // Зависит от выбранных кодов и типа
  const priceRequestArgs = useMemo(() => {
    // Собираем коды стандартных комплектующих
    const itemCodesSet = new Set<string>([
        ITEM_CODE_PSU,
        ITEM_CODE_RCV_CARD,
        ITEM_CODE_MAGNET,
        ITEM_CODE_STEEL_M2,
    ]);

    // Создаем объект аргументов
    const args: { // Явно типизируем для понятности
      moduleCode?: string;
      cabinetCode?: string;
      itemCodes?: string[];
    } = {};

    // Добавляем код модуля, если он выбран
    if (selectedModuleCode) {
      args.moduleCode = selectedModuleCode;
      // Не добавляем код модуля в itemCodes, так как он идет отдельным полем
    }

    // Добавляем код кабинета, если он выбран и это кабинетный тип
    if (isCabinetScreenTypeSelected && selectedCabinetCode) {
      args.cabinetCode = selectedCabinetCode;
       // Не добавляем код кабинета в itemCodes
    }

    // Устанавливаем массив itemCodes
    args.itemCodes = Array.from(itemCodesSet);

    console.log("[Price Query Args] Prepared args:", args);
    return args;

    }, [selectedModuleCode, selectedCabinetCode, isCabinetScreenTypeSelected]); 

  // --- ЗАПРОС ЦЕН ---
  // const {
  //   data: priceQueryData,
  //   isLoading: isLoadingPricesQuery,
  //   isError: isErrorPricesQuery,
  //   error: errorPricesQuery,
  // } = useQuery<PricesQueryResult, Error, PriceMap>({
  //   queryKey: ['componentPrices', codesToFetch],
  //   queryFn: async (): Promise<PricesQueryResult> => {
  //     console.log('[Price Query] Fetching prices for codes:', codesToFetch);
  //     if (codesToFetch.length === 0) {
  //        console.warn('[Price Query] No codes to fetch.');
  //        return { pricesByCodes: [] };
  //     }
  //     try {
  //       const variables = { codes: codesToFetch };
  //       const result = await graphQLClient.request<PricesQueryResult>(
  //         GET_PRICES_BY_CODES,
  //         variables
  //       );
  //       console.log('[Price Query] Received raw prices:', result);
  //       return result ?? { pricesByCodes: [] }; // Обработка null ответа
  //     } catch (err) {
  //       console.error('[Price Query] Error fetching prices:', err);
  //       throw err; // Пробрасываем ошибку для isError
  //     }
  //   },
  //   // Запрос активен, только если есть хотя бы стандартные коды
  //   // И ОБЯЗАТЕЛЬНО выбран модуль (т.к. без него расчет невозможен)
  //   enabled: codesToFetch.length > 0 && !!selectedModuleCode,
  //   staleTime: 1000 * 60 * 15, // Кэшировать цены на 15 минут
  //   refetchOnWindowFocus: false,
  //   refetchOnMount: true, // Перезапросить при монтировании, если данные устарели
  //   // --- ТРАНСФОРМАЦИЯ ДАННЫХ в PriceMap ---
  //   select: (data): PriceMap => {
  //       const priceMap: PriceMap = {};
  //       if (data?.pricesByCodes) {
  //           for (const item of data.pricesByCodes) {
  //               if (item?.code) { // Проверяем наличие кода
  //                   priceMap[item.code] = {
  //                       usd: item.priceUsd ?? null, // Используем ?? null для явного null
  //                       rub: item.priceRub ?? null,
  //                   };
  //               }
  //           }
  //       }
  //       console.log('[Price Query] Transformed PriceMap:', priceMap);
  //       return priceMap;
  //   },
  // });
  // --- ЗАПРОС ЦЕН (Обновленный) ---
  const {
    data: priceQueryData,
    isLoading: isLoadingPricesQuery,
    isError: isErrorPricesQuery,
    error: errorPricesQuery,
  } = useQuery<PricesQueryResult, Error, PriceMap>({
    // Ключ запроса теперь зависит от объекта аргументов
    queryKey: ['componentPrices', priceRequestArgs],
    queryFn: async (): Promise<PricesQueryResult> => {
        console.log('[Price Query] Fetching prices with args:', priceRequestArgs);

        // Проверяем, есть ли вообще что запрашивать
        if (!priceRequestArgs.moduleCode && !priceRequestArgs.cabinetCode && (!priceRequestArgs.itemCodes || priceRequestArgs.itemCodes.length === 0)) {
            console.warn('[Price Query] No codes provided in args.');
            return { getPricesByCodes: [] };
        }

        try {
            // Передаем объект priceRequestArgs как значение переменной 'codes'
            const variables = { codes: priceRequestArgs }; // <<< ИЗМЕНЕНО ЗДЕСЬ
            const result = await graphQLClient.request<PricesQueryResult>(
                GET_PRICES_BY_CODES, // Запрос теперь ожидает PriceRequestInput!
                variables
            );
            console.log('[Price Query] Received raw prices:', result);
            return result ?? { pricesByCodes: [] };
        } catch (err) {
            console.error('[Price Query] Error fetching prices:', err);
            throw err;
        }
    },
    // Запрос активен, если есть хотя бы модуль ИЛИ кабинет ИЛИ itemCodes
    enabled: !!(priceRequestArgs.moduleCode || priceRequestArgs.cabinetCode || (priceRequestArgs.itemCodes && priceRequestArgs.itemCodes.length > 0)),
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    select: (data): PriceMap => { // Логика select остается прежней
        const priceMap: PriceMap = {};
        if (data?.getPricesByCodes) {
            for (const item of data.getPricesByCodes) {
                if (item?.code) {
                    priceMap[item.code] = {
                        usd: item.priceUsd ?? null,
                        rub: item.priceRub ?? null,
                    };
                }
            }
        }
        console.log('[Price Query] Transformed PriceMap:', priceMap);
        return priceMap;
    },
  });

  const priceMapData = priceQueryData ?? {};
  
  // --- Состояния для полных данных ---
  const [selectedModuleDetails, setSelectedModuleDetailsState] =
    useState<ModuleData | null>(null);
  const [selectedCabinetDetails, setSelectedCabinetDetailsState] =
    useState<CabinetData | null>(null);

  // --- Состояния для расчета и UI ---
  const [isCalculating, setIsCalculatingState] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpenState] = useState<boolean>(false);
  const [calculationResult, setCalculationResultState] =
    useState<TechnicalSpecsResult | null>(null);
  const [costDetails, setCostDetails] = useState<CostCalculationResult | null>(null);

  // --- Запрос начальных данных ---
  const {
    data: initialData,
    isLoading: isLoadingInitial,
    isError: isErrorInitial,
    error: errorInitial,
  } = useQuery<InitialDataQueryResult, Error>({
    queryKey: ["calculatorInitialData"],
    queryFn: fetchInitialData,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // --- Извлечение данных из начального запроса ---
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

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС ЯРКОСТИ ---
  // Активен, если выбраны Локация И Питч
  const areBrightnessDepsSelected = !!(
    selectedLocationCode &&
    selectedPitchCode &&
    selectedRefreshRateCode
  );
  const enabledBrightnessQuery = areBrightnessDepsSelected;

  const {
    data: brightnessData,
    isLoading: isLoadingBrightnesses,
    isError: isErrorBrightnesses,
    error: errorBrightnesses,
  } = useQuery<GetFilteredBrightnessOptionsQuery, Error>({
    queryKey: [
      "brightnessOptions",
      selectedLocationCode,
      selectedPitchCode,
      selectedRefreshRateCode,
      isFlexSelected,
    ],
    queryFn: async () => {
      console.log(`[Brightness Query] 
        Fetching brightness for location: ${selectedLocationCode}, 
        pitch: ${selectedPitchCode}, 
        refreshRate: ${selectedRefreshRateCode}
      `);
      if (
        !selectedLocationCode ||
        !selectedPitchCode ||
        !selectedRefreshRateCode
      )
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
  const gqlFilteredBrightnesses =
    brightnessData?.getFilteredBrightnessOptions ?? [];

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС ЧАСТОТЫ ОБНОВЛЕНИЯ ---
  const areRefreshRateDepsSelected = !!(
    selectedLocationCode && selectedPitchCode
  );
  const enabledRefreshRateQuery = areRefreshRateDepsSelected;

  const {
    data: refreshRateData,
    isLoading: isLoadingRefreshRates,
    isError: isErrorRefreshRates,
    error: errorRefreshRates,
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
        isFlex: isFlexSelected,
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

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС МОДУЛЕЙ ---
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
  } = useQuery<GetModuleOptionsQuery, Error>({
    queryKey: [
      "moduleOptions",
      selectedLocationCode,
      selectedPitchCode,
      selectedBrightnessCode,
      selectedRefreshRateCode,
      isFlexSelected,
    ],
    queryFn: async () => {
      console.log("[Module Query] Fetching module options with filters:", {
        locationCode: selectedLocationCode,
        pitchCode: selectedPitchCode,
        refreshRateCode: selectedRefreshRateCode,
        brightnessCode: selectedBrightnessCode,
      });
      const variables: {
        filters: ModuleFilterInput & { isFlex?: boolean };
        onlyActive: boolean;
      } = {
        filters: {
          locationCode: selectedLocationCode || undefined,
          pitchCode: selectedPitchCode || undefined,
          brightnessCode: selectedBrightnessCode || undefined,
          refreshRateCode: selectedRefreshRateCode || undefined,
          isFlex: isFlexSelected,
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

  useEffect(() => {
    if (!isLoadingModules && !isErrorModules && gqlFilteredModules) {
        if (gqlFilteredModules.length === 1) {
          const singleModule = gqlFilteredModules[0];
          if (singleModule && (singleModule as GqlModule)?.code && (singleModule as GqlModule).active !== false) {
              const singleModuleCode = (singleModule as GqlModule).code;
              if (selectedModuleCode !== singleModuleCode) {
                  console.log(`[Module Auto-Select Effect] Automatically selecting single available module: ${singleModuleCode}`);
                  setSelectedModuleCodeState(singleModuleCode ?? null);
              }
          }
        }
    }
}, [
    gqlFilteredModules,
    isLoadingModules,
    isErrorModules,
    selectedModuleCode,
    setSelectedModuleCodeState,
]);

  // --- ДИНАМИЧЕСКИЙ ЗАПРОС КАБИНЕТОВ ---
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

  // --- useQuery для получения ДЕТАЛЕЙ ---

  // Запрос деталей МОДУЛЯ
  const moduleDetailsQueryResult = useQuery<
    ModuleDetailsQueryResult,
    Error,
    ModuleDetailsQueryResult,
    QueryKey
  >({
    queryKey: ["moduleDetails", selectedModuleCode],
    queryFn: async (): Promise<ModuleDetailsQueryResult> => {
      console.log(
        `[Module Details Query] Fetching details for module: ${selectedModuleCode}`
      );
      if (!selectedModuleCode) return { moduleDetails: null };

      try {
        const variables = { code: selectedModuleCode };
        console.log(
          "[Module Details Query] Sending request with variables:",
          variables
        );
        const result = await graphQLClient.request<ModuleDetailsQueryResult>(
          GET_MODULE_DETAILS,
          variables
        );
        console.log("[Module Details Query] Received raw result:", result);
        return result;
      } catch (err) {
        console.error("Error fetching module details:", err);
        throw err;
      }
    },
    enabled: !!selectedModuleCode,
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (moduleDetailsQueryResult.isSuccess && moduleDetailsQueryResult.data) {
      const data = moduleDetailsQueryResult.data;
      console.log("[Module Details Effect] Success (Raw):", data);
      if (data?.moduleDetails) {
        const gqlModule = data.moduleDetails;
        const sizeData = gqlModule.sizes?.[0];
        const mappedModule: ModuleData = {
          code: gqlModule.code,
          sku: gqlModule.sku,
          name: gqlModule.name,
          width: sizeData?.width ?? 0,
          height: sizeData?.height ?? 0,
          powerConsumptionAvg: gqlModule.powerConsumptionAvg,
          powerConsumptionMax: gqlModule.powerConsumptionMax,
          components:
            gqlModule.items
              ?.map((comp: Maybe<ModuleDetailsGqlItemComponent>) => ({
                quantity: comp?.quantity ?? 0,
                itemCode: comp?.item?.code ?? "unknown",
                itemName: comp?.item?.name ?? "Unknown Item",
                itemSku: comp?.item?.sku,
              }))
              .filter((c: any) => c.itemCode !== "unknown") ?? [],
        };
        console.log("[Module Details Effect] Mapped State:", mappedModule);
        if (
          JSON.stringify(mappedModule) !== JSON.stringify(selectedModuleDetails)
        ) {
          setSelectedModuleDetailsState(mappedModule);
        }
      } else {
        if (selectedModuleDetails !== null) {
          setSelectedModuleDetailsState(null);
        }
      }
    } else if (moduleDetailsQueryResult.isError) {
      console.error(
        "[Module Details Effect] Error:",
        moduleDetailsQueryResult.error.message
      );
      if (selectedModuleDetails !== null) {
        setSelectedModuleDetailsState(null);
      }
    }
  }, [
    moduleDetailsQueryResult.isSuccess,
    moduleDetailsQueryResult.isError,
    moduleDetailsQueryResult.data,
    moduleDetailsQueryResult.error,
    selectedModuleDetails,
  ]);

  const {
    isLoading: isLoadingModuleDetails,
    isError: isErrorModuleDetails,
    error: errorModuleDetails,
  } = moduleDetailsQueryResult;

  // Запрос деталей КАБИНЕТА
  const cabinetDetailsQueryResult = useQuery<
    CabinetDetailsQueryResult,
    Error,
    CabinetDetailsQueryResult,
    QueryKey
  >({
    queryKey: ["cabinetDetails", selectedCabinetCode],
    queryFn: async (): Promise<CabinetDetailsQueryResult> => {
      console.log(
        `[Cabinet Details Query] Fetching details for cabinet: ${selectedCabinetCode}`
      );
      if (!selectedCabinetCode) return { cabinetDetails: null };

      try {
        const variables = { code: selectedCabinetCode };
        console.log(
          "[Cabinet Details Query] Sending request with variables:",
          variables
        );
        const result = await graphQLClient.request<CabinetDetailsQueryResult>(
          GET_CABINET_DETAILS,
          variables
        );
        console.log("[Cabinet Details Query] Received raw result:", result);
        return result;
      } catch (err) {
        console.error("Error fetching cabinet details:", err);
        throw err;
      }
    },
    enabled: isCabinetScreenTypeSelected && !!selectedCabinetCode,
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  useEffect(() => {
    // Проверяем, успешен ли запрос И есть ли данные
    if (cabinetDetailsQueryResult.isSuccess && cabinetDetailsQueryResult.data) {
      const data = cabinetDetailsQueryResult.data;
      console.log(
        "[Cabinet Details Effect] Success (Raw):",
        JSON.stringify(data, null, 2)
      );

      if (data?.cabinetDetails) {
        const gqlCabinet = data.cabinetDetails as any;
        const sizeData = gqlCabinet.sizes?.[0]?.size;

        const widthValue = sizeData?.width;
        const heightValue = sizeData?.height;

        const mappedCabinet: CabinetData = {
          code: gqlCabinet.code,
          sku: gqlCabinet.sku,
          name: gqlCabinet.name,
          width: widthValue ?? 0,
          height: heightValue ?? 0,
        };
        console.log("[Cabinet Details Effect] Mapped State:", mappedCabinet);

        // Обновляем состояние, только если данные действительно изменились
        if (
          JSON.stringify(mappedCabinet) !==
          JSON.stringify(selectedCabinetDetails)
        ) {
          setSelectedCabinetDetailsState(mappedCabinet);
        }
      } else {
        /* ... сброс ... */
      }
    } else if (cabinetDetailsQueryResult.isError) {
      console.error(
        "[Cabinet Details Effect] Error:",
        cabinetDetailsQueryResult.error.message
      );
      if (selectedCabinetDetails !== null) {
        setSelectedCabinetDetailsState(null);
      }
    }
  }, [
    cabinetDetailsQueryResult.isSuccess,
    cabinetDetailsQueryResult.isError,
    cabinetDetailsQueryResult.data,
    cabinetDetailsQueryResult.error,
    selectedCabinetDetails,
    setSelectedCabinetDetailsState,
  ]);

  const {
    isLoading: isLoadingCabinetDetails,
    isError: isErrorCabinetDetails,
    error: errorCabinetDetails,
  } = cabinetDetailsQueryResult;

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
    console.log("[Brightness Effect] Running. Deps:", {
      optionsLength: gqlFilteredBrightnesses.length,
      currentSelectedCode: selectedBrightnessCode,
      isLoading: isLoadingBrightnesses,
    });
    console.log(
      "[Brightness Effect] Filtered options received:",
      JSON.stringify(gqlFilteredBrightnesses)
    );

    if (!isLoadingBrightnesses && gqlFilteredBrightnesses.length > 0) {
      const currentSelectionValid = gqlFilteredBrightnesses.some(
        (br: any) => br?.code === selectedBrightnessCode
      );
      console.log(
        `[Brightness Effect] Is current selection '${selectedBrightnessCode}' valid in new list? ${currentSelectionValid}`
      );

      if (!currentSelectionValid || selectedBrightnessCode === null) {
        console.log(
          "[Brightness Effect] Current selection invalid or null. Finding default..."
        );
        const defaultBrightness = [...gqlFilteredBrightnesses]
          .filter((br: any) => br?.code && typeof br.value === "number")
          .sort((a: any, b: any) => (a?.value ?? 0) - (b?.value ?? 0))[0];

        if (defaultBrightness) {
          const defaultCode = (defaultBrightness as any).code;
          const defaultValue = (defaultBrightness as any).value;
          // Устанавливаем, только если отличается от текущего, чтобы избежать лишних ререндеров
          if (defaultCode !== selectedBrightnessCode) {
            console.log(
              `[Brightness Effect] Setting default/new brightness: code=${defaultCode}, value=${defaultValue}`
            );
            setSelectedBrightnessCodeState(defaultCode);
          } else {
            console.log(
              `[Brightness Effect] Default code (${defaultCode}) matches current selection. No change needed.`
            );
          }
        } else {
          console.log(
            "[Brightness Effect] No default brightness found in the new list, resetting."
          );
          if (selectedBrightnessCode !== null)
            setSelectedBrightnessCodeState(null);
        }
      } else {
        console.log(
          "[Brightness Effect] Current brightness selection '${selectedBrightnessCode}' is still valid. Keeping it."
        );
      }
    } else if (!isLoadingBrightnesses && gqlFilteredBrightnesses.length === 0) {
      console.log(
        "[Brightness Effect] No brightness options available. Resetting selection."
      );
      if (selectedBrightnessCode !== null) {
        setSelectedBrightnessCodeState(null);
      }
    }
  }, [
    gqlFilteredBrightnesses,
    isLoadingBrightnesses,
    selectedBrightnessCode,
    setSelectedBrightnessCodeState,
  ]); // Добавили selectedBrightnessCode для сравнения

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

  // Сброс деталей Модуля при смене кода
  useEffect(() => {
    if (
      selectedModuleDetails &&
      selectedModuleDetails.code !== selectedModuleCode
    ) {
      console.log(
        "[Module Effect] Resetting module details due to code change."
      );
      const previousCode = selectedModuleDetails.code;
      setSelectedModuleDetailsState(null);
      queryClient.cancelQueries({ queryKey: ["moduleDetails", previousCode] });
    } else if (!selectedModuleCode && selectedModuleDetails) {
      console.log(
        "[Module Effect] Resetting module details because code is null."
      );
      const previousCode = selectedModuleDetails.code;
      setSelectedModuleDetailsState(null);
      queryClient.cancelQueries({ queryKey: ["moduleDetails", previousCode] });
    }
  }, [selectedModuleCode, selectedModuleDetails, queryClient]); // Добавили queryClient

  // Сброс деталей Кабинета при смене кода или типа экрана
  useEffect(() => {
    let shouldReset = false;
    let previousCode: string | undefined = undefined;
    if (selectedCabinetDetails) {
      previousCode = selectedCabinetDetails.code;
      // <<< ИСПРАВЛЕНО: Используем isCabinetScreenTypeSelected >>>
      if (
        selectedCabinetDetails.code !== selectedCabinetCode ||
        !isCabinetScreenTypeSelected ||
        !selectedCabinetCode
      ) {
        console.log(
          `[Cabinet Effect] Resetting cabinet details due to change (code: ${selectedCabinetCode}, type: ${selectedScreenTypeCode}).`
        );
        shouldReset = true;
      }
    }
    if (shouldReset) {
      setSelectedCabinetDetailsState(null);
      if (previousCode) {
        queryClient.cancelQueries({
          queryKey: ["cabinetDetails", previousCode],
        });
      }
    }
  }, [
    selectedCabinetCode,
    isCabinetScreenTypeSelected,
    selectedCabinetDetails,
    queryClient,
  ]);

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

  // --- ЛОГИКА ГОТОВНОСТИ К РАСЧЕТУ ---
  const isCalculationReady = useMemo((): boolean => {
    const widthValue = Number(widthMm);
    const heightValue = Number(heightMm);
    const rateValue = Number(dollarRate);
    const checkScreenType = !!selectedScreenTypeCode;
    const checkWidth = !isNaN(widthValue) && widthValue > 0;
    const checkHeight = !isNaN(heightValue) && heightValue > 0;
    const checkLocation = !!selectedLocationCode;
    const checkProtection = !!selectedProtectionCode;
    const checkPitch = !!selectedPitchCode;
    const checkBrightness = !!selectedBrightnessCode; // <<< Будет использоваться
    const checkRefreshRate = !!selectedRefreshRateCode; // <<< Будет использоваться
    const checkModule =
      !!selectedModuleCode &&
      !!selectedModuleDetails &&
      !isLoadingModuleDetails &&
      !isErrorModuleDetails;
    // <<< ИСПРАВЛЕНО: Используем isCabinetScreenTypeSelected >>>
    const checkCabinet =
      !isCabinetScreenTypeSelected ||
      (!!selectedCabinetCode &&
        !!selectedCabinetDetails &&
        !isLoadingCabinetDetails &&
        !isErrorCabinetDetails);
    const checkMaterial =
      !isCabinetScreenTypeSelected || !!selectedMaterialCode;
    const checkRate = !isNaN(rateValue) && rateValue > 0;
    const checkCalculating = !isCalculating;
    const checkPrices = 
    !isLoadingPricesQuery && 
    !isErrorPricesQuery && 
    Object.keys(priceMapData).length > 0;

    const requiredFieldsFilled =
      checkScreenType &&
      checkWidth &&
      checkHeight &&
      checkLocation &&
      checkMaterial &&
      checkProtection &&
      checkPitch &&
      checkBrightness &&
      checkRefreshRate && // <<< ИСПОЛЬЗУЕМ ПРОВЕРКИ
      checkModule &&
      checkCabinet && 
      checkRate &&
      checkPrices;
    // console.log("Calculation Ready Check:", { /* ... */ });
    return requiredFieldsFilled && checkCalculating;
  }, [
    selectedScreenTypeCode,
    widthMm,
    heightMm,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode,
    selectedPitchCode,
    selectedBrightnessCode,
    selectedRefreshRateCode,
    selectedModuleCode,
    selectedCabinetCode,
    dollarRate,
    isCalculating,
    isCabinetScreenTypeSelected,
    selectedModuleDetails,
    isLoadingModuleDetails,
    isErrorModuleDetails,
    selectedCabinetDetails,
    isLoadingCabinetDetails,
    isErrorCabinetDetails,
    isLoadingPricesQuery,
    isErrorPricesQuery,
    priceMapData,
  ]);

  // --- Функции для обновления состояния (useCallback) ---
  const setSelectedScreenTypeCode = useCallback((value: string | null) => {
    if (selectedScreenTypeCode === value) return;
    setSelectedScreenTypeCodeState(value);
    setSelectedLocationCodeState(null); setSelectedMaterialCodeState(null); setSelectedProtectionCodeState(null);
    setSelectedBrightnessCodeState(null); setSelectedRefreshRateCodeState(null); setSelectedSensorCodesState([]);
    setSelectedControlTypeCodesState([]); setSelectedPitchCodeState(null); setSelectedModuleCodeState(null);
    setSelectedCabinetCodeState(null); setIsFlexSelectedState(false); setCalculationResultState(null); setCostDetails(null);
  }, [selectedScreenTypeCode, setSelectedScreenTypeCodeState, setSelectedLocationCodeState, setSelectedMaterialCodeState, setSelectedProtectionCodeState, setSelectedBrightnessCodeState, setSelectedRefreshRateCodeState, setSelectedSensorCodesState, setSelectedControlTypeCodesState, setSelectedPitchCodeState, setSelectedModuleCodeState, setSelectedCabinetCodeState, setIsFlexSelectedState]);

  const setSelectedLocationCode = useCallback((value: string | null) => {
      if (selectedLocationCode === value) return;
      setSelectedLocationCodeState(value);
      setSelectedMaterialCodeState(null); setSelectedBrightnessCodeState(null); setSelectedRefreshRateCodeState(null);
      setSelectedPitchCodeState(null); setSelectedModuleCodeState(null); setSelectedCabinetCodeState(null);
      setCalculationResultState(null); setCostDetails(null);
    }, [selectedLocationCode, setSelectedLocationCodeState, setSelectedMaterialCodeState, setSelectedBrightnessCodeState, setSelectedRefreshRateCodeState, setSelectedPitchCodeState, setSelectedModuleCodeState, setSelectedCabinetCodeState]);

  const setSelectedMaterialCode = useCallback((value: string | null) => {
      if (selectedMaterialCode === value) return;
      setSelectedMaterialCodeState(value);
      setSelectedCabinetCodeState(null);
      setCalculationResultState(null);
      setCostDetails(null);
    }, [selectedMaterialCode, setSelectedMaterialCodeState, setSelectedCabinetCodeState]);

    const setSelectedProtectionCode = useCallback((value: string | null): void => {
      if (selectedProtectionCode === value) return;
      setSelectedProtectionCodeState(value);
    }, [selectedProtectionCode, setSelectedProtectionCodeState]);

    const setSelectedBrightnessCode = useCallback((value: string | null) => {
      if (selectedBrightnessCode === value) return;
      console.log("(Context) Selected Brightness Code:", value);
      setSelectedBrightnessCodeState(value);
      setSelectedModuleCodeState(null);
      setSelectedCabinetCodeState(null);
      setCalculationResultState(null);
      setCostDetails(null);
    }, [selectedBrightnessCode, setSelectedBrightnessCodeState, setSelectedModuleCodeState, setSelectedCabinetCodeState]);

    const setSelectedRefreshRateCode = useCallback((value: string | null) => {
      if (selectedRefreshRateCode === value) return;
      console.log("(Context) Selected Refresh Rate Code:", value);
      setSelectedRefreshRateCodeState(value);
      setSelectedBrightnessCodeState(null);
      setSelectedModuleCodeState(null);
      setSelectedCabinetCodeState(null);
      setCalculationResultState(null);
      setCostDetails(null);
    }, [selectedRefreshRateCode, setSelectedRefreshRateCodeState, setSelectedBrightnessCodeState, setSelectedModuleCodeState, setSelectedCabinetCodeState]);

    const setSelectedSensorCodes = useCallback((value: string[]) => { setSelectedSensorCodesState(value); }, [setSelectedSensorCodesState]);

  const setSelectedControlTypeCodes = useCallback((value: string[]) => { setSelectedControlTypeCodesState(value); }, [setSelectedControlTypeCodesState]);

  const setSelectedPitchCode = useCallback((value: string | null) => {
      if (selectedPitchCode === value) return;
      console.log("(Context) Selected Pitch Code:", value);
      setSelectedPitchCodeState(value);
      setSelectedRefreshRateCodeState(null); // Частота зависит от питча
      setSelectedBrightnessCodeState(null); // Яркость зависит от частоты
      setSelectedModuleCodeState(null); // Модуль зависит от яркости
      setSelectedCabinetCodeState(null); // Кабинет зависит от модуля
      setCalculationResultState(null);
      setCostDetails(null);
    }, [selectedPitchCode, setSelectedPitchCodeState, setSelectedRefreshRateCodeState, setSelectedBrightnessCodeState, setSelectedModuleCodeState, setSelectedCabinetCodeState]);

  const setSelectedModuleCode = useCallback((value: string | null) => {
      if (selectedModuleCode === value) return;
      setSelectedModuleCodeState(value);
      setSelectedCabinetCodeState(null); // Кабинет зависит от модуля
      setCalculationResultState(null);
      setCostDetails(null);
    }, [selectedModuleCode, setSelectedModuleCodeState, setSelectedCabinetCodeState]);

  const setSelectedCabinetCode = useCallback((value: string | null) => {
      if (selectedCabinetCode === value) return;
      setSelectedCabinetCodeState(value);
      setCalculationResultState(null);
      setCostDetails(null);
    }, [selectedCabinetCode, setSelectedCabinetCodeState]);
    
  const setIsFlexSelected = useCallback((selected: boolean) => { 
    setIsFlexSelectedState(selected); 
    setCalculationResultState(null); 
    setCostDetails(null); 
  }, [setIsFlexSelectedState]);

  const setDollarRate = useCallback((value: number | string) => { 
    setDollarRateState(value); 
  }, [setDollarRateState]);

  const setWidthMm = useCallback((value: string | number) => { 
    setWidthMmState(value); 
    setCalculationResultState(null); 
    setCostDetails(null); 
  }, [setWidthMmState]);

  const setHeightMm = useCallback((value: string | number) => { 
    setHeightMmState(value); 
    setCalculationResultState(null); 
    setCostDetails(null); 
  }, [setHeightMmState]);

  const performCalculation = useCallback(async () => {
      console.log("Attempting calculation... Ready state:", isCalculationReady);
      if (!isCalculationReady) {
        console.warn("Calculation prerequisites not met.");
        if (isLoadingPricesQuery) console.warn("Prices are still loading.");
        if (isErrorPricesQuery) console.error("Failed to load prices.", errorPricesQuery);
        if (Object.keys(priceMapData).length === 0 && !isLoadingPricesQuery && !isErrorPricesQuery) console.warn("Price data is empty.");
        return;
      }

      if (!selectedModuleDetails || (isCabinetScreenTypeSelected && !selectedCabinetDetails) || !priceMapData) {
        console.error("Internal error: Calculation started but required details or price map are missing.", { selectedModuleDetails, selectedCabinetDetails, priceMapData });
        return;
      }

      console.log("🚀 Starting calculation with loaded details...");
      setIsCalculatingState(true);
      setCalculationResultState(null);
      setCostDetails(null);

    try {
      // 1. Формируем данные для расчета тех. характеристик
      const selectedPitchObject = gqlFilteredPitches.find(
        p => (p as GqlPitch)?.code === selectedPitchCode // Приводим к GqlPitch для доступа к code
    );
    
    // Проверяем, что объект найден, прежде чем получать значение
    if (!selectedPitchObject) {
      console.error("Filtered Pitches:", JSON.stringify(gqlFilteredPitches, null, 2));
      throw new Error(`Pitch object with code '${selectedPitchCode}' not found in filtered list.`);
  }
      const pitchValue = (selectedPitchObject as GqlPitch)?.pitchValue;
      if (typeof pitchValue !== 'number') {
        console.error("Selected Pitch Object:", selectedPitchObject);
        throw new Error(`Found pitch object for code '${selectedPitchCode}', but its pitchValue is not a number.`);
      }
      const brightnessLabel = brightnessOptions.find(b => b.value === selectedBrightnessCode)?.label;
      const refreshRateLabel = refreshRateOptions.find(r => r.value === selectedRefreshRateCode)?.label;
      const locationName = locationOptions.find(l => l.value === selectedLocationCode)?.label;
      const materialName = materialOptions.find(m => m.value === selectedMaterialCode)?.label;

      if (pitchValue === undefined || pitchValue === null) {
          throw new Error("Selected pitch value not found");
      }


      const formData: CalculatorFormData = {
        selectedPlacement: locationName ?? selectedLocationCode ?? '',
        selectedMaterialName: materialName ?? selectedMaterialCode ?? '',
        selectedProtectionCode: selectedProtectionCode ?? '',
        selectedBrightnessLabel: brightnessLabel ?? selectedBrightnessCode ?? '',
        selectedRefreshRateLabel: refreshRateLabel ?? selectedRefreshRateCode ?? '',
        selectedPitchValue: pitchValue,
        selectedScreenWidth: Number(widthMm) || 0,
        selectedScreenHeight: Number(heightMm) || 0,
        selectedScreenTypeCode: selectedScreenTypeCode ?? '',
         moduleItemComponents: selectedModuleDetails.components?.map(c => ({
            itemCode: c.itemCode,
            itemName: c.itemName,
            countPerModule: c.quantity
        })) ?? [],
    };
    console.log("Prepared formData for calculation:", formData);
    console.log("Using Module Details:", selectedModuleDetails);
    console.log("Using Cabinet Details:", selectedCabinetDetails);
    console.log("Using Prices:", priceMapData);

    // 2. Рассчитываем технические характеристики
    const techSpecResult = calculateTechnicalSpecs(
      formData,
      selectedModuleDetails, // selectedModuleDetails уже проверен на null выше
      isCabinetScreenTypeSelected ? selectedCabinetDetails : null // Передаем кабинет только если тип кабинетный
  );
  console.log("✅ Tech Specs Calculation Result:", techSpecResult);

  if (!techSpecResult) {
       throw new Error("Technical specification calculation failed or returned null.");
  }

  // 3. Устанавливаем результат тех. характеристик в состояние
  setCalculationResultState(techSpecResult);

  // 4. Рассчитываем стоимость
  const costResult = calculateCosts(
      techSpecResult,
      priceMapData,
      Number(dollarRate),
      isCabinetScreenTypeSelected ? selectedMaterialCode : null // Передаем код материала только для кабинетов
  );
  console.log("✅ Cost Calculation Result:", costResult);
  
  setCostDetails(costResult);

  setIsDrawerOpenState(true);

} catch (calcError: any) {
  console.error("❌ Calculation failed:", calcError?.message ?? calcError);
  setCalculationResultState(null);
  setCostDetails(null);
} finally {
  setIsCalculatingState(false);
}
}, [
    // Обновляем зависимости
    isCalculationReady,
    selectedModuleDetails,
    selectedCabinetDetails,
    isCabinetScreenTypeSelected,
    priceMapData,
    isLoadingPricesQuery,
    isErrorPricesQuery,
    errorPricesQuery, 
    selectedScreenTypeCode,
    widthMm,
    heightMm,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode,
    selectedBrightnessCode,
    selectedRefreshRateCode,
    selectedPitchCode,
    dollarRate,
    locationOptions,
    materialOptions,
    brightnessOptions,
    refreshRateOptions,
    gqlFilteredPitches,
    setIsCalculatingState,
    setCalculationResultState,
    setIsDrawerOpenState,
    setCostDetails
  ]);

  const resetQuery = useCallback(() => {
    console.log("Invalidating all calculator queries...");
    queryClient.invalidateQueries({ queryKey: ["calculatorInitialData"] });
    queryClient.invalidateQueries({ queryKey: ["screenTypeOptions"] });
    queryClient.invalidateQueries({ queryKey: ["pitchOptions"] });
    queryClient.invalidateQueries({ queryKey: ["refreshRateOptions"] });
    queryClient.invalidateQueries({ queryKey: ["brightnessOptions"] });
    queryClient.invalidateQueries({ queryKey: ["moduleOptions"] });
    queryClient.invalidateQueries({ queryKey: ["cabinetOptions"] });
    queryClient.invalidateQueries({ queryKey: ["dollarRate"] });
    queryClient.invalidateQueries({ queryKey: ["moduleDetails"] });
    queryClient.invalidateQueries({ queryKey: ["cabinetDetails"] });
    console.log("Calculator queries invalidated.");
  }, [queryClient]);

  // --- Формируем значение контекста ---
  const contextValue: CalculatorContextProps = useMemo(
    () => ({
      // Статусы загрузки и ошибки
      isLoading: isLoadingInitial,
      isError: isErrorInitial,
      error: errorInitial,
      // Справочники
      screenTypes,
      locations: gqlLocations,
      materials: gqlMaterials,
      ipProtections: gqlIpProtections,
      sensors: gqlSensors,
      controlTypes: gqlControlTypes,
      isCalculating, 
      calculationResult, 
      isDrawerOpen, 
      costDetails,
      isLoadingPrices: isLoadingPricesQuery,
      isErrorPrices: isErrorPricesQuery,
      errorPrices: errorPricesQuery,

      // Результаты запросов списков
      optionsQueryResult: {
        data: availableOptions,
        isLoading: isLoadingOptions,
        isError: isErrorOptions,
        error: errorOptions,
      },
      pitchQueryResult: {
        data: gqlFilteredPitches as any,
        isLoading: isLoadingPitches,
        isError: isErrorPitches,
        error: errorPitches,
      },
      refreshRateQueryResult: {
        data: gqlFilteredRefreshRates as any,
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
        data: gqlFilteredModules as any,
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
      // Детали и их статусы
      selectedModuleDetails,
      selectedCabinetDetails,
      isLoadingModuleDetails,
      isErrorModuleDetails,
      errorModuleDetails,
      isLoadingCabinetDetails,
      isErrorCabinetDetails,
      errorCabinetDetails,

      // Выбранные значения формы
      selectedScreenTypeCode,
      isFlexSelected,
      selectedLocationCode,
      selectedMaterialCode,
      selectedProtectionCode,
      selectedBrightnessCode,
      selectedSensorCodes,
      selectedControlTypeCodes,
      selectedPitchCode,
      selectedRefreshRateCode,
      selectedModuleCode,
      selectedCabinetCode,
      dollarRate,
      widthMm,
      heightMm,

      // Функции обновления состояния
      setSelectedScreenTypeCode,
      setIsFlexSelected,
      setSelectedLocationCode,
      setSelectedMaterialCode,
      setSelectedProtectionCode,
      setSelectedBrightnessCode,
      setSelectedSensorCodes,
      setSelectedControlTypeCodes,
      setSelectedPitchCode,
      setSelectedRefreshRateCode,
      setSelectedModuleCode,
      setSelectedCabinetCode,
      setDollarRate,
      setWidthMm,
      setHeightMm,

      // Функции действий и статусы
      performCalculation,
      setIsDrawerOpen: setIsDrawerOpenState,
      resetQuery,
      isCalculationReady,

      // Опции для селектов
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [
      // Перечисляем ВСЕ значения, используемые внутри contextValue
      isLoadingInitial,
      isErrorInitial,
      errorInitial,
      screenTypes,
      gqlLocations,
      gqlMaterials,
      gqlIpProtections,
      gqlSensors,
      gqlControlTypes,
      availableOptions,
      isLoadingOptions,
      isErrorOptions,
      errorOptions,
      gqlFilteredPitches,
      isLoadingPitches,
      isErrorPitches,
      errorPitches,
      gqlFilteredRefreshRates,
      isLoadingRefreshRates,
      isErrorRefreshRates,
      errorRefreshRates,
      gqlFilteredBrightnesses,
      isLoadingBrightnesses,
      isErrorBrightnesses,
      errorBrightnesses,
      gqlFilteredModules,
      isLoadingModules,
      isErrorModules,
      errorModules,
      gqlCabinets,
      isLoadingCabinets,
      isErrorCabinets,
      errorCabinets,
      isLoadingDollarRate,
      // Добавленные зависимости:
      selectedModuleDetails,
      selectedCabinetDetails,
      isLoadingModuleDetails,
      isErrorModuleDetails,
      errorModuleDetails,
      isLoadingCabinetDetails,
      isErrorCabinetDetails,
      errorCabinetDetails,
      isCalculating,
      calculationResult,
      costDetails,
      isDrawerOpen,
      isCalculating, 
      calculationResult, 
      isDrawerOpen, 
      costDetails,
      // Остальные зависимости:
      selectedScreenTypeCode,
      isFlexSelected,
      selectedLocationCode,
      selectedMaterialCode,
      selectedProtectionCode,
      selectedBrightnessCode,
      selectedSensorCodes,
      selectedControlTypeCodes,
      selectedPitchCode,
      selectedRefreshRateCode,
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
      setSelectedSensorCodes,
      setSelectedControlTypeCodes,
      setSelectedPitchCode,
      setSelectedRefreshRateCode,
      setSelectedModuleCode,
      setSelectedCabinetCode,
      setDollarRate,
      setWidthMm,
      setHeightMm,
      performCalculation,
      setIsDrawerOpenState,
      resetQuery,
      isCalculationReady,
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
      isCabinetScreenTypeSelected,
    ]
  );

  return (
    <CalculatorContext.Provider value={contextValue}>
      {children}
    </CalculatorContext.Provider>
  );
};
