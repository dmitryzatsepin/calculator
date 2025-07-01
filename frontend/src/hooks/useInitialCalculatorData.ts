// frontend/src/hooks/useInitialCalculatorData.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_INITIAL_DATA } from '../graphql/calculator.gql';
import type { InitialDataQueryResult } from '../graphql/calculator.types';
import type {
  ScreenType as GqlScreenType,
  Location as GqlLocation,
  Material as GqlMaterial,
  IpProtection as GqlIpProtection,
  Sensor as GqlSensor,
  ControlType as GqlControlType,

} from "../generated/graphql/graphql";

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
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<InitialDataQueryResult, Error, InitialDataQueryResult>({
    queryKey: ["calculatorInitialData"],
    queryFn: fetchInitialDataQuery,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Обработка и мемоизация данных для предотвращения лишних ре-рендеров
  const processedData = useMemo((): ProcessedInitialData => {
    return {
      screenTypes: rawData?.screenTypes?.filter((st): st is Pick<GqlScreenType, "id" | "code" | "name"> => !!st) ?? [],
      locations: rawData?.locations?.filter((loc): loc is GqlLocation => !!loc) ?? [],
      materials: rawData?.materials?.filter((mat): mat is GqlMaterial => !!mat) ?? [],
      ipProtections: rawData?.ipProtections?.filter((ip): ip is Pick<GqlIpProtection, "id" | "code"> => !!ip) ?? [],
      sensors: rawData?.sensors?.filter((s): s is GqlSensor => !!s) ?? [],
      controlTypes: rawData?.controlTypes?.filter((ct): ct is GqlControlType => !!ct) ?? [],
    };
  }, [rawData]);

  return {
    ...processedData,
    isLoading,
    isError,
    error,
  };
}