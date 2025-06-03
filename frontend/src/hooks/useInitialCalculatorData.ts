// frontend/src/hooks/useInitialCalculatorData.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient'; // Убедитесь, что путь корректен
import { GET_INITIAL_DATA } from '../graphql/calculator.gql'; // Путь к вашим GraphQL запросам
import type { InitialDataQueryResult } from '../graphql/calculator.types'; // Путь к вашим типам ответов
import type {
  ScreenType as GqlScreenType,
  Location as GqlLocation,
  Material as GqlMaterial,
  IpProtection as GqlIpProtection,
  Sensor as GqlSensor,
  ControlType as GqlControlType,

} from "../generated/graphql/graphql"; // Путь к сгенерированным типам

// Определяем тип для данных, которые хук будет возвращать после обработки/фильтрации
export interface ProcessedInitialData {
  screenTypes: Array<Pick<GqlScreenType, "id" | "code" | "name">>; // Массив без Maybe для элементов
  locations: GqlLocation[];
  materials: GqlMaterial[];
  ipProtections: Array<Pick<GqlIpProtection, "id" | "code">>;
  sensors: GqlSensor[];
  controlTypes: GqlControlType[];
}

// Тип для полного возвращаемого значения хука, включая статусы загрузки
export interface InitialDataHookResult extends ProcessedInitialData {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// Функция для выполнения запроса
const fetchInitialDataQuery = async (): Promise<InitialDataQueryResult> => {
  // console.log("[useInitialCalculatorData] fetchInitialDataQuery called");
  return graphQLClient.request<InitialDataQueryResult>(GET_INITIAL_DATA);
};

export function useInitialCalculatorData(): InitialDataHookResult {
  const {
    data: rawData, // Необработанные данные от useQuery
    isLoading,
    isError,
    error,
  } = useQuery<InitialDataQueryResult, Error, InitialDataQueryResult>({ // Третий дженерик - тип данных после select (если есть)
    queryKey: ["calculatorInitialData"],
    queryFn: fetchInitialDataQuery,
    staleTime: 1000 * 60 * 10, // 10 минут
    refetchOnWindowFocus: false,
    // select не нужен здесь, если мы обрабатываем данные ниже
  });

  // Обработка и мемоизация данных для предотвращения лишних ре-рендеров
  const processedData = useMemo((): ProcessedInitialData => {
    // console.log("[useInitialCalculatorData] Memoizing processedData, rawData changed:", rawData);
    return {
      screenTypes: rawData?.screenTypes?.filter((st): st is Pick<GqlScreenType, "id" | "code" | "name"> => !!st) ?? [],
      locations: rawData?.locations?.filter((loc): loc is GqlLocation => !!loc) ?? [],
      materials: rawData?.materials?.filter((mat): mat is GqlMaterial => !!mat) ?? [],
      ipProtections: rawData?.ipProtections?.filter((ip): ip is Pick<GqlIpProtection, "id" | "code"> => !!ip) ?? [],
      sensors: rawData?.sensors?.filter((s): s is GqlSensor => !!s) ?? [],
      controlTypes: rawData?.controlTypes?.filter((ct): ct is GqlControlType => !!ct) ?? [],
    };
  }, [rawData]); // Зависимость только от rawData

  return {
    ...processedData, // Возвращаем обработанные данные
    isLoading,
    isError,
    error,
  };
}