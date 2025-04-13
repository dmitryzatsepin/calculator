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

const GET_INITIAL_DATA = gql`
  ${LocationFields}
  ${MaterialFields}

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
    # Используем ipProtections как в схеме GraphQL
    ipProtections(onlyActive: true) {
      id
      code
      # active // Если нужно поле active, добавь его здесь и в тип ниже
    }
  }
`;

// --- Тип для ответа GraphQL ---
type InitialDataQueryResult = {
  screenTypes: Maybe<Array<Maybe<Pick<GqlScreenType, "id" | "code" | "name">>>>;
  locations: Maybe<Array<Maybe<GqlLocation>>>;
  materials: Maybe<Array<Maybe<GqlMaterial>>>;
  // Используем ipProtections и тип Pick<GqlIpProtection, "id" | "code">
  ipProtections: Maybe<Array<Maybe<Pick<GqlIpProtection, "id" | "code">>>>;
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
      // Извлекаем ipProtections
      ipProtections: data?.ipProtections ?? [],
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
  // Тип для ipProtections соответствует типу в InitialDataQueryResult
  ipProtections: (Pick<GqlIpProtection, "id" | "code"> | null | undefined)[];
  // Состояния выбора
  selectedScreenTypeCode: string | null;
  selectedLocationCode: string | null;
  selectedMaterialCode: string | null;
  selectedProtectionCode: string | null; // <-- Добавлено для исправления TS2561
  widthMm: string | number;
  heightMm: string | number;
  // Функции для обновления состояний
  setSelectedScreenTypeCode: (code: string | null) => void;
  setSelectedLocationCode: (code: string | null) => void;
  setSelectedMaterialCode: (code: string | null) => void;
  setSelectedProtectionCode: (code: string | null) => void; // <-- Добавлено для исправления TS2561
  setWidthMm: (value: string | number) => void;
  setHeightMm: (value: string | number) => void;
  // Мемоизированные опции для селекторов
  screenTypeSegments: SegmentData[];
  locationOptions: SegmentData[];
  materialOptions: SegmentData[];
  protectionOptions: SegmentData[]; // <-- Добавлено для исправления TS2561 и TS6133
  // Функция сброса (для ErrorBoundary)
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
  // Состояния выбора
  selectedScreenTypeCode: null,
  selectedLocationCode: null,
  selectedMaterialCode: null,
  selectedProtectionCode: null, // <-- Добавлено для исправления TS2561 (исправлена ошибка из лога)
  // Значения ширины и высоты
  widthMm: "",
  heightMm: "",
  setSelectedScreenTypeCode: () => {},
  setSelectedLocationCode: () => {},
  setSelectedMaterialCode: () => {},
  setSelectedProtectionCode: () => {}, // <-- Добавлено для исправления TS2561
  setWidthMm: () => {},
  setHeightMm: () => {},
  screenTypeSegments: [],
  locationOptions: [],
  materialOptions: [],
  protectionOptions: [], // <-- Добавлено для исправления TS2561 и TS6133
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
          // Добавлена проверка st?.code
          st?.code?.toLowerCase() === defaultCode.toLowerCase()
      );
      if (defaultScreenType?.code) {
        setSelectedScreenTypeCodeState(defaultScreenType.code);
      } else {
        // Можно установить первый доступный, если дефолтный не найден
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
        // Ищем IP65, если он есть в списке
        const foundIp = gqlIpProtections.find((ip) => ip?.code === "IP65");
        newProtectionCode = foundIp?.code ?? null; // Устанавливаем IP65, если найден, иначе null
      }
      // Если ни indoor ни outdoor не определились, newProtectionCode останется null
      // Если нужный IP (IP30/IP65) не был загружен, newProtectionCode также будет null
    }
    // Обновляем состояние, только если значение изменилось
    if (selectedProtectionCode !== newProtectionCode) {
      console.log(
        `(Context) Setting Protection based on Location '${selectedLocationCode}': ${newProtectionCode}`
      );
      setSelectedProtectionCodeState(newProtectionCode);
      // TODO: Здесь все еще нужен сброс зависимых состояний (Pitch, Cabinet...)
    }
  }, [
    selectedLocationCode,
    gqlIpProtections,
    gqlLocations,
    isLoading,
  ]);

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

  // Функции для обновления состояния с логикой сброса зависимостей
  const setSelectedScreenTypeCode = useCallback(
    (value: string | null) => {
      if (selectedScreenTypeCode === value) return; // Предотвращаем лишние обновления
      console.log("(Context) Selected Screen Type Code:", value);
      setSelectedScreenTypeCodeState(value);
      setSelectedLocationCodeState(null);
      setSelectedMaterialCodeState(null);
      setSelectedProtectionCodeState(null); // Сбрасываем Protection
      // TODO: Сбросить остальные: Pitch, Cabinet...
    },
    [selectedScreenTypeCode]
  ); // Добавлена зависимость для сравнения

  const setSelectedLocationCode = useCallback(
    (value: string | null) => {
      if (selectedLocationCode === value) return; // Предотвращаем лишние обновления
      console.log("(Context) Selected Location Code:", value);
      setSelectedLocationCodeState(value);
      setSelectedMaterialCodeState(null);
      // Protection пересчитается в useEffect, но другие зависимости нужно сбросить
      // TODO: Сбросить остальные: Pitch, Cabinet...
    },
    [selectedLocationCode]
  ); // Добавлена зависимость для сравнения

  const setSelectedMaterialCode = useCallback(
    (value: string | null) => {
      if (selectedMaterialCode === value) return; // Предотвращаем лишние обновления
      console.log("(Context) Selected Material Code:", value);
      setSelectedMaterialCodeState(value);
      // TODO: Сбросить остальные: Pitch, Cabinet...
    },
    [selectedMaterialCode]
  ); // Добавлена зависимость для сравнения

  const setSelectedProtectionCode = useCallback(
    (value: string | null): void => {
      if (selectedProtectionCode === value) return; // Предотвращаем лишние обновления
      console.log("(Context) Selected Protection Code:", value);
      setSelectedProtectionCodeState(value);
      // TODO: Сбросить Pitch, Cabinet...
    },
    [selectedProtectionCode]
  ); // Добавлена зависимость для сравнения

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
    selectedScreenTypeCode,
    selectedLocationCode,
    selectedMaterialCode,
    selectedProtectionCode, // <-- Добавлено для исправления TS2561
    widthMm,
    heightMm,
    setSelectedScreenTypeCode,
    setSelectedLocationCode,
    setSelectedMaterialCode,
    setSelectedProtectionCode, // <-- Добавлено для исправления TS2561
    setWidthMm,
    setHeightMm,
    screenTypeSegments,
    locationOptions,
    materialOptions,
    protectionOptions, // <-- Добавлено для исправления TS2561 и TS6133
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
