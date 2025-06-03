// frontend/src/hooks/useCabinetDetails.ts
import { useQuery, QueryKey } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_CABINET_DETAILS } from '../graphql/calculator.gql';
import type {
  CabinetDetailsQueryResult,
  CabinetDetailsData, // Наш кастомный тип для обработанных данных
} from '../graphql/calculator.types';
// GqlCabinet не нужен здесь напрямую, если CabinetDetailsData его полностью описывает

export interface CabinetDetailsHookResult {
  cabinetDetails: CabinetDetailsData | null; // Используем наш обработанный тип
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
}

const fetchCabinetDetailsQuery = async (cabinetCode: string): Promise<CabinetDetailsQueryResult> => {
  // console.log(`[useCabinetDetails] Fetching details for cabinet: ${cabinetCode}`);
  const variables = { code: cabinetCode };
  return graphQLClient.request<CabinetDetailsQueryResult>(GET_CABINET_DETAILS, variables);
};

export function useCabinetDetails(
  cabinetCode: string | null,
  isCabinetScreenTypeSelected: boolean // Для управления флагом enabled
): CabinetDetailsHookResult {
  // Запрос активен только если выбран кабинетный тип экрана И cabinetCode предоставлен
  const enabled = isCabinetScreenTypeSelected && !!cabinetCode;

  const {
    data: rawData, // Тип CabinetDetailsQueryResult | undefined
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<CabinetDetailsQueryResult, Error, CabinetDetailsQueryResult, QueryKey>({
    queryKey: ["cabinetDetails", cabinetCode], // cabinetCode в ключе
    queryFn: () => {
      if (!cabinetCode) { // Эта проверка больше для TypeScript, enabled должен это покрывать
        return Promise.reject(new Error("Cabinet code is required to fetch details."));
      }
      return fetchCabinetDetailsQuery(cabinetCode);
    },
    enabled,
    staleTime: 1000 * 60 * 15, // 15 минут
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Аналогично деталям модуля
  });

  const cabinetDetailsData = useMemo((): CabinetDetailsData | null => {
    return rawData?.cabinetDetails ?? null;
  }, [rawData]);

  return {
    cabinetDetails: cabinetDetailsData,
    isLoading,
    isFetching,
    isError,
    error,
  };
}