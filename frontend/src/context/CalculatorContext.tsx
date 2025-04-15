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
  Location as GqlLocation,
  Material as GqlMaterial,
  IpProtection as GqlIpProtection,
  Brightness as GqlBrightness,
  RefreshRate as GqlRefreshRate,
  Sensor as GqlSensor,
  ControlType as GqlControlType,
  Maybe,
} from "../generated/graphql/graphql";

// Тип для опций Mantine
type SegmentData = { label: string; value: string };

// --- GraphQL Запрос ---
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
const GET_INITIAL_DATA = gql`
  ${LocationFields}
  ${MaterialFields}
  ${BrightnessFields}
  ${RefreshRateFields}
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
      # active
    }
    brightnesses(onlyActive: true) {
      ...BrightnessFields
    }
    refreshRates(onlyActive: true) {
      ...RefreshRateFields
    }
    sensors(onlyActive: true) {
      ...SensorFields
    }
    controlTypes(onlyActive: true) {
      ...ControlTypeFields
    }
  }
`;

// --- Тип для ответа GraphQL ---
type InitialDataQueryResult = {
  screenTypes: Maybe<Array<Maybe<Pick<GqlScreenType, "id" | "code" | "name">>>>;
  locations: Maybe<Array<Maybe<GqlLocation>>>;
  materials: Maybe<Array<Maybe<GqlMaterial>>>;
  ipProtections: Maybe<Array<Maybe<Pick<GqlIpProtection, "id" | "code">>>>;
  brightnesses: Maybe<Array<Maybe<GqlBrightness>>>;
  refreshRates: Maybe<Array<Maybe<GqlRefreshRate>>>;
  sensors: Maybe<Array<Maybe<GqlSensor>>>;
  controlTypes: Maybe<Array<Maybe<GqlControlType>>>;
};

// --- Функция-запрос ---
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
  // Статусы загрузки/ошибки
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  // Загруженные данные
  screenTypes: (
    | Pick<GqlScreenType, "id" | "code" | "name">
    | null
    | undefined
  )[];
  locations: (GqlLocation | null | undefined)[];
  materials: (GqlMaterial | null | undefined)[];
  ipProtections: (Pick<GqlIpProtection, "id" | "code"> | null | undefined)[];
  brightnesses: (GqlBrightness | null | undefined)[];
  refreshRates: (GqlRefreshRate | null | undefined)[];
  sensors: (GqlSensor | null | undefined)[];
  controlTypes: (GqlControlType | null | undefined)[];
  // Состояния выбора
  selectedScreenTypeCode: string | null;
  selectedLocationCode: string | null;
  selectedMaterialCode: string | null;
  selectedProtectionCode: string | null;
  selectedBrightnessCode: string | null;
  selectedRefreshRateCode: string | null;
  selectedControlTypeCodes: string[];  
  selectedSensorCodes: string[]; 
  widthMm: string | number;
  heightMm: string | number;
  // Функции для обновления состояний
  setSelectedScreenTypeCode: (code: string | null) => void;
  setSelectedLocationCode: (code: string | null) => void;
  setSelectedMaterialCode: (code: string | null) => void;
  setSelectedProtectionCode: (code: string | null) => void;
  setSelectedBrightnessCode: (code: string | null) => void;
  setSelectedRefreshRateCode: (code: string | null) => void;
  setSelectedSensorCodes: (codes: string[]) => void;
  setSelectedControlTypeCodes: (codes: string[]) => void;
  setWidthMm: (value: string | number) => void;
  setHeightMm: (value: string | number) => void;
  // Мемоизированные опции для селекторов
  screenTypeSegments: SegmentData[];
  locationOptions: SegmentData[];
  materialOptions: SegmentData[];
  protectionOptions: SegmentData[];
  brightnessOptions: SegmentData[];
  refreshRateOptions: SegmentData[];
  sensorOptions: SegmentData[];
  controlTypeOptions: SegmentData[];
  resetQuery: () => void;
}

// --- Создание Контекста ---
// Предоставляем начальные значения по умолчанию (они будут переопределены Provider'ом)
const CalculatorContext = createContext<CalculatorContextProps>({
  isLoading: true,
  isError: false,
  error: null,
  screenTypes: [],
  locations: [],
  materials: [],
  ipProtections: [],
  brightnesses: [],
  refreshRates: [],
  sensors: [],
  controlTypes: [],
  // Состояния выбора
  selectedScreenTypeCode: null,
  selectedLocationCode: null,
  selectedMaterialCode: null,
  selectedProtectionCode: null,
  selectedBrightnessCode: null,
  selectedRefreshRateCode: null,
  selectedSensorCodes: [],
  selectedControlTypeCodes: [],
  widthMm: "",
  heightMm: "",
  setSelectedScreenTypeCode: () => {},
  setSelectedLocationCode: () => {},
  setSelectedMaterialCode: () => {},
  setSelectedProtectionCode: () => {},
  setSelectedBrightnessCode: () => {},
  setSelectedRefreshRateCode: () => {},
  setSelectedSensorCodes: () => {},
  setSelectedControlTypeCodes: () => {},
  setWidthMm: () => {},
  setHeightMm: () => {},
  screenTypeSegments: [],
  locationOptions: [],
  materialOptions: [],
  protectionOptions: [],
  brightnessOptions: [],
  refreshRateOptions: [],
  sensorOptions: [],
  controlTypeOptions: [],
  resetQuery: () => {},
});

// --- Компонент Провайдера Контекста ---
export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
  const [selectedScreenTypeCode, setSelectedScreenTypeCodeState] = useState<
    string | null
  >(null);
  const [widthMm, setWidthMm] = useState<string | number>("");
  const [heightMm, setHeightMm] = useState<string | number>("");
  const [selectedLocationCode, setSelectedLocationCodeState] = useState<
    string | null
  >(null);
  const [selectedMaterialCode, setSelectedMaterialCodeState] = useState<
    string | null
  >(null);
  const [selectedProtectionCode, setSelectedProtectionCodeState] = useState<
    string | null
  >(null);
  const [selectedBrightnessCode, setSelectedBrightnessCodeState] = useState<string | null>(null);
  const [selectedRefreshRateCode, setSelectedRefreshRateCodeState] = useState<string | null>(null);
  const [selectedSensorCodes, setSelectedSensorCodesState] = useState<string[]>([]);
  const [selectedControlTypeCodes, setSelectedControlTypeCodesState] = useState<string[]>([]);
 
  // Запрос данных
  const { data, isLoading, isError, error, refetch } = useQuery<
    InitialDataQueryResult,
    Error
  >({
    queryKey: ["calculatorInitialData"],
    queryFn: fetchInitialData,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Извлечение данных
  const screenTypes = data?.screenTypes ?? [];
  const gqlLocations = data?.locations ?? [];
  const gqlMaterials = data?.materials ?? [];
  // Используем ipProtections
  const gqlIpProtections = data?.ipProtections ?? [];
  const gqlBrightnessValues = data?.brightnesses ?? [];
  const gqlRefreshRates = data?.refreshRates ?? [];
  const gqlSensors = data?.sensors ?? [];
  const gqlControlTypes = data?.controlTypes ?? [];

  // Установка ScreenType по умолчанию
  useEffect(() => {
    if (
      !isLoading &&
      screenTypes.length > 0 &&
      selectedScreenTypeCode === null
    ) {
      const defaultCode = "cabinet";
      const defaultScreenType = screenTypes.find(
        (st) =>
          st?.code?.toLowerCase() === defaultCode.toLowerCase()
      );
      if (defaultScreenType?.code) {
        setSelectedScreenTypeCodeState(defaultScreenType.code);
      } else {
        const firstAvailable = screenTypes.find((st) => !!st?.code);
        if (firstAvailable?.code) {
          setSelectedScreenTypeCodeState(firstAvailable.code);
          console.warn(
            `Default ScreenType code '${defaultCode}' not found. Using first available: ${firstAvailable.code}`
          );
        } else {
          console.warn(
            `Default ScreenType code '${defaultCode}' not found, and no other types available.`
          );
        }
      }
    }
  }, [isLoading, screenTypes, selectedScreenTypeCode]);

  // Установка/сброс Protection на основе Location
  useEffect(() => {
    if (isLoading || !selectedLocationCode) {
      if (!selectedLocationCode && selectedProtectionCode !== null) {
        console.log("(Context) Resetting Protection because Location is null");
        setSelectedProtectionCodeState(null);
        // TODO: Здесь все еще нужен сброс зависимых состояний (Pitch, Cabinet...)
      }
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
      ) {
        const foundIp = gqlIpProtections.find((ip) => ip?.code === "IP30");
        newProtectionCode = foundIp?.code ?? null;
      } else if (
        codeLower.includes("outdoor") ||
        nameLower.includes("outdoor") ||
        codeLower.includes("уличн") ||
        nameLower.includes("уличн")
      ) {
        const foundIp = gqlIpProtections.find((ip) => ip?.code === "IP65");
        newProtectionCode = foundIp?.code ?? null;
      }
    }
    // Обновляем состояние, только если значение изменилось
    if (selectedProtectionCode !== newProtectionCode) {
      console.log(
        `(Context) Setting Protection based on Location '${selectedLocationCode}': ${newProtectionCode}`
      );
      setSelectedProtectionCodeState(newProtectionCode);
      // TODO: Здесь все еще нужен сброс зависимых состояний (Pitch, Cabinet...)
    }
  }, [selectedLocationCode, gqlIpProtections, gqlLocations, isLoading]);

  // Подготовка данных для селекторов
  const screenTypeSegments = useMemo((): SegmentData[] => {
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

  const locationOptions = useMemo((): SegmentData[] => {
    // TODO: Фильтрация по selectedScreenTypeCode
    if (!Array.isArray(gqlLocations)) return [];
    return gqlLocations
      .filter(
        (loc): loc is GqlLocation & { code: string; active: true } =>
          !!loc?.code && loc.active === true
      )
      .map((loc) => ({ value: loc.code, label: loc.name ?? loc.code }));
  }, [gqlLocations /*, selectedScreenTypeCode*/]);

  const materialOptions = useMemo((): SegmentData[] => {
    // TODO: Фильтрация по selectedLocationCode
    if (!Array.isArray(gqlMaterials)) return [];
    return gqlMaterials
      .filter(
        (mat): mat is GqlMaterial & { code: string; active: true } =>
          !!mat?.code && mat.active === true
      )
      .map((mat) => ({ value: mat.code, label: mat.name ?? mat.code }));
  }, [gqlMaterials /*, selectedLocationCode*/]);

  // Вычисляем опции для защиты
  const protectionOptions = useMemo((): SegmentData[] => {
    if (!Array.isArray(gqlIpProtections)) return [];
    return gqlIpProtections
      .filter(
        (ip): ip is Pick<GqlIpProtection, "id" | "code"> & { code: string } =>
          !!ip?.code
      )
      .sort((a, b) => a.code.localeCompare(b.code)) // Сортировка
      .map((ip) => ({ value: ip.code, label: ip.code }));
  }, [gqlIpProtections]);

  // Вычисляем опции для яркости
  const brightnessOptions = useMemo((): SegmentData[] => {
    if (!Array.isArray(gqlBrightnessValues)) return [];
    return gqlBrightnessValues
      .filter(
        // Убеждаемся, что есть code, value и active=true
        (br): br is GqlBrightness & { code: string; value: number; active: true } =>
          !!br?.code && typeof br.value === 'number' && br.active === true
      )
      // Сортируем по числовому значению яркости
      .sort((a, b) => a.value - b.value)
      // Формируем массив для Select
      .map((br) => ({
        value: br.code,
        label: `${br.value} nit` // Добавляем единицу измерения
      }));
  }, [gqlBrightnessValues]); // Зависимость от загруженных данных

  // Вычисляем опции для частоты обновления
  const refreshRateOptions = useMemo((): SegmentData[] => {
    if (!Array.isArray(gqlRefreshRates)) return [];
    return gqlRefreshRates
      .filter(
        // Убеждаемся, что есть code, value и active=true
        (rr): rr is GqlRefreshRate & { code: string; value: number; active: true } =>
          !!rr?.code && typeof rr.value === 'number' && rr.active === true
      )
      // Сортируем по числовому значению частоты
      .sort((a, b) => a.value - b.value)
      // Формируем массив для Select
      .map((rr) => ({
        value: rr.code,
        label: `${rr.value} Hz` // Добавляем единицу измерения
      }));
  }, [gqlRefreshRates]);

  // Вычисляем опции для сенсоров
  const sensorOptions = useMemo((): SegmentData[] => {
    if (!Array.isArray(gqlSensors)) return [];
    return gqlSensors
      .filter(
        // Убеждаемся, что есть code, name и active=true
        (s): s is GqlSensor & { code: string; name: string; active: true } =>
          !!s?.code && !!s.name && s.active === true
      )
      // Сортируем по имени для консистентности
      .sort((a, b) => a.name.localeCompare(b.name))
      // Формируем массив для CheckboxGroup
      .map((s) => ({
        value: s.code, // Используем code как value
        label: s.name  // Используем name как label
      }));
  }, [gqlSensors]);// Зависимость от загруженных данны

  // Вычисляем опции для типов управления
  const controlTypeOptions = useMemo((): SegmentData[] => {
    if (!Array.isArray(gqlControlTypes)) return [];
    return gqlControlTypes
      .filter(
        // Убеждаемся, что есть code, name и active=true
        (ct): ct is GqlControlType & { code: string; name: string; active: true } =>
          !!ct?.code && !!ct.name && ct.active === true
      )
      // Сортируем по имени
      .sort((a, b) => a.name.localeCompare(b.name))
      // Формируем массив для CheckboxGroup
      .map((ct) => ({
        value: ct.code, // Используем code как value
        label: ct.name  // Используем name как label
      }));
  }, [gqlControlTypes]);

  // Функции для обновления состояния с логикой сброса зависимостей
  const setSelectedScreenTypeCode = useCallback(
    (value: string | null) => {
      if (selectedScreenTypeCode === value) return; // Предотвращаем лишние обновления
      console.log("(Context) Selected Screen Type Code:", value);
      setSelectedScreenTypeCodeState(value);
      setSelectedLocationCodeState(null);
      setSelectedMaterialCodeState(null);
      setSelectedProtectionCodeState(null);
      setSelectedBrightnessCodeState(null);
      setSelectedRefreshRateCodeState(null);
      setSelectedSensorCodesState([]);
      setSelectedControlTypeCodesState([]);
    },
    [selectedScreenTypeCode]
  ); 

  const setSelectedLocationCode = useCallback(
    (value: string | null) => {
      if (selectedLocationCode === value) return; // Предотвращаем лишние обновления
      console.log("(Context) Selected Location Code:", value);
      setSelectedLocationCodeState(value);
      setSelectedMaterialCodeState(null);
      // Protection пересчитается в useEffect, но другие зависимости нужно сбросить
      setSelectedBrightnessCodeState(null);
      setSelectedRefreshRateCodeState(null);
    },
    [selectedLocationCode]
  );

  const setSelectedMaterialCode = useCallback(
    (value: string | null) => {
      if (selectedMaterialCode === value) return; // Предотвращаем лишние обновления
      console.log("(Context) Selected Material Code:", value);
      setSelectedMaterialCodeState(value);
      setSelectedBrightnessCodeState(null);
      setSelectedRefreshRateCodeState(null);
      // TODO: Сбросить остальные: Pitch, Cabinet...
    },
    [selectedMaterialCode]
  );

  const setSelectedProtectionCode = useCallback(
    (value: string | null): void => {
      if (selectedProtectionCode === value) return; // Предотвращаем лишние обновления
      console.log("(Context) Selected Protection Code:", value);
      setSelectedProtectionCodeState(value);
      setSelectedBrightnessCodeState(null);
      setSelectedRefreshRateCodeState(null);
      // TODO: Сбросить Pitch, Cabinet...
    },
    [selectedProtectionCode]
  );
  const setSelectedBrightnessCode = useCallback((value: string | null) => {
    if (selectedBrightnessCode === value) return;
    console.log("(Context) Selected Brightness Code:", value);
    setSelectedBrightnessCodeState(value);
    // TODO: Сбросить зависимые состояния (например, Cabinet, Module...), если они есть
  }, 
  [selectedBrightnessCode]);

const setSelectedRefreshRateCode = useCallback((value: string | null) => {
  if (selectedRefreshRateCode === value) return;
  console.log("(Context) Selected Refresh Rate Code:", value);
  setSelectedRefreshRateCodeState(value);
  // TODO: Сбросить зависимые состояния (например, Cabinet, Module...), если они есть
}, 
[selectedRefreshRateCode]);

const setSelectedSensorCodes = useCallback((value: string[]) => {
  // value - это новый массив выбранных кодов от Checkbox.Group
  console.log("(Context) Selected Sensor Codes:", value);
  setSelectedSensorCodesState(value);
  // Т.к. сенсоры пока ни на что не влияют, другие состояния не сбрасываем
}, [] // Нет зависимостей, т.к. просто устанавливаем новое значение
);

const setSelectedControlTypeCodes = useCallback((value: string[]) => {
  // value - это новый массив выбранных кодов от Checkbox.Group
  console.log("(Context) Selected Control Type Codes:", value);
  setSelectedControlTypeCodesState(value);
  // Т.к. типы управления пока ни на что не влияют, другие состояния не сбрасываем
}, [] // Нет зависимостей
);

  // Функция для ErrorBoundary
  const resetQuery = useCallback(() => {
    // Можно добавить сброс состояний перед перезапросом
    refetch();
  }, [refetch]);

  // Формируем значение контекста
  // Не оборачиваем в useMemo для максимального сохранения исходной структуры
  const contextValue: CalculatorContextProps = {
    isLoading,
    isError,
    error,
    screenTypes,
    locations: gqlLocations,
    materials: gqlMaterials,
    ipProtections: gqlIpProtections,
    brightnesses: gqlBrightnessValues,
    refreshRates: gqlRefreshRates,
    sensors: gqlSensors,
    controlTypes: gqlControlTypes,
    // Состояния выбора
    selectedScreenTypeCode,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode,
    selectedBrightnessCode,
    selectedRefreshRateCode,
    selectedSensorCodes,
    selectedControlTypeCodes,
    widthMm,
    heightMm,
    // Функции для обновления состояния
    setSelectedScreenTypeCode,
    setSelectedLocationCode,
    setSelectedMaterialCode,
    setSelectedProtectionCode,
    setSelectedBrightnessCode,
    setSelectedRefreshRateCode,
    setSelectedSensorCodes,
    setSelectedControlTypeCodes, 
    setWidthMm,
    setHeightMm,
    // Мемоизированные опции для селекторов
    screenTypeSegments,
    locationOptions,
    materialOptions,
    protectionOptions,
    brightnessOptions,
    refreshRateOptions,
    sensorOptions,
    controlTypeOptions,
    resetQuery,
  };

  return (
    <CalculatorContext.Provider value={contextValue}>
      {children}
    </CalculatorContext.Provider>
  );
};

// --- Кастомный хук для использования Контекста ---
export const useCalculatorContext = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error(
      "useCalculatorContext must be used within a CalculatorProvider"
    );
  }
  return context;
};
