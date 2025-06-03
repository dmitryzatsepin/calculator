// frontend/src/hooks/useFilteredRefreshRates.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_FILTERED_REFRESH_RATE_OPTIONS } from '../graphql/calculator.gql';
import type {
  GetFilteredRefreshRateOptionsQuery, // Тип полного ответа от graphql-codegen
  RefreshRate as GqlRefreshRate, // Тип для одного элемента RefreshRate
  // Maybe, // Не нужен, если возвращаем очищенный массив
} from "../generated/graphql/graphql";

// GqlRefreshRate уже должен содержать code и value из фрагмента RefreshRateFields
export type ProcessedRefreshRateOption = GqlRefreshRate;

export interface FilteredRefreshRatesHookResult {
  refreshRates: ProcessedRefreshRateOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const fetchFilteredRefreshRatesQuery = async (
  locationCode: string,
  pitchCode: string,
  isFlex: boolean
): Promise<GetFilteredRefreshRateOptionsQuery> => {
  const variables = {
    locationCode,
    pitchCode,
    isFlex,
    onlyActive: true,
  };
  return graphQLClient.request<GetFilteredRefreshRateOptionsQuery>(
    GET_FILTERED_REFRESH_RATE_OPTIONS,
    variables
  );
};

export function useFilteredRefreshRates(
  locationCode: string | null,
  pitchCode: string | null,
  isFlex: boolean // isFlex не может быть null, передаем его всегда
): FilteredRefreshRatesHookResult {
  // Запрос активен только если ВСЕ необходимые параметры предоставлены
  const enabled = !!locationCode && !!pitchCode;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<GetFilteredRefreshRateOptionsQuery, Error, GetFilteredRefreshRateOptionsQuery>({
    queryKey: ["filteredRefreshRateOptions", locationCode, pitchCode, isFlex],
    queryFn: () => {
      if (!locationCode || !pitchCode) {
        // Эта проверка больше для TypeScript, т.к. `enabled` флаг должен предотвратить вызов
        return Promise.reject(
          new Error("Location code and Pitch code are required to fetch refresh rates.")
        );
      }
      return fetchFilteredRefreshRatesQuery(locationCode, pitchCode, isFlex);
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 минут
    refetchOnWindowFocus: false,
  });

  const processedRefreshRates = useMemo((): ProcessedRefreshRateOption[] => {
    return rawData?.getFilteredRefreshRateOptions?.filter((rr): rr is GqlRefreshRate => !!rr) ?? [];
  }, [rawData]);

  return {
    refreshRates: processedRefreshRates,
    isLoading,
    isError,
    error,
  };
}